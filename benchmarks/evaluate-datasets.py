"""Audit the supplied datasets and compare two MoneyShield versions locally.

Only aggregate counts are printed. Reference texts are piped directly to Node in
memory. No dataset text, URLs, contact details, or record IDs are written by this script.
"""
import argparse
from collections import Counter
import csv
import hashlib
import heapq
import json
from pathlib import Path
import subprocess
import unicodedata

HERE = Path(__file__).resolve().parent
SAMPLE_SIZE = 10_000
ENRON_LABEL_MASKS = {'0': 1, '1': 2}
csv.field_size_limit(16_000_000)


def rows(path):
    with path.open(encoding='utf-8-sig', errors='replace', newline='') as file:
        yield from csv.DictReader(file)


def inspect_enron(path):
    labels = Counter()
    metadata_joint = Counter()
    fingerprints = {}
    duplicate_count = 0
    zero_candidates = []
    # Deterministic minimum-hash sample over distinct texts. The extra slots cover
    # collisions in label meaning between exact duplicate rows across folders.
    for row in rows(path):
        label = row['Label'].strip()
        labels[label] += 1
        if (row['Sender-Type'], row['Low-Comm'], row['Contains-Reply-Forwards']) == ('External', 'True', 'False'):
            metadata_joint[label] += 1
        message = (row['Subject'] + '\n' + row['Body']).strip()[:4000]
        canonical = ' '.join(unicodedata.normalize('NFKC', message).casefold().split())
        if not canonical:
            continue
        digest = int.from_bytes(hashlib.blake2b(canonical.encode(), digest_size=12).digest())
        old = fingerprints.get(digest)
        mask = ENRON_LABEL_MASKS.get(label, 4)
        fingerprints[digest] = (old or 0) | mask
        if old is not None:
            duplicate_count += 1
            continue
        if label != '0':
            continue
        candidate = (-digest, message)
        if len(zero_candidates) < SAMPLE_SIZE + 2_000:
            heapq.heappush(zero_candidates, candidate)
        elif candidate > zero_candidates[0]:
            heapq.heapreplace(zero_candidates, candidate)
    reference = [
        message for rank, message in sorted(zero_candidates, reverse=True)
        if fingerprints[-rank] == 1
    ][:SAMPLE_SIZE]
    return {
        'rows': sum(labels.values()), 'labels': dict(labels),
        'external_low_communication_no_reply_or_forward': dict(metadata_joint),
        'duplicate_nonempty_text_rows': duplicate_count,
        'distinct_multilabel_texts': sum(mask == 3 for mask in fingerprints.values()),
        'sampled_distinct_label_zero_texts': len(reference),
    }, reference


def inspect_surveys(directory):
    english = list(rows(next(directory.rglob('*_EN.csv'))))
    french = list(rows(next(directory.rglob('*_fr.csv'))))
    english_methods = {
        'Call from a stranger pretending to be an agent': 'fake_agent',
        'Fake withdrawal or deposit message': 'fake_debit_or_deposit',
        'False transaction of a customer': 'false_customer_payment',
        'Reimbursement request for a supposedly erroneous transfer': 'mistaken_transfer_refund',
    }
    french_methods = {
        'Appel d’un inconnu qui se fait passer pour un agent': 'fake_agent',
        'Faux message de retrait ou dépôt': 'fake_debit_or_deposit',
        'Fausse transaction d’un client': 'false_customer_payment',
        'Demande de remboursement pour un transfert soi-disant erroné': 'mistaken_transfer_refund',
    }

    def map_methods(text, separator, mapping):
        return {mapping[value] for item in text.split(separator) if (value := item.strip()) in mapping}

    counts = Counter(key for row in english if row['Victim'] == 'Yes'
                     for key in map_methods(row['Scam_Method'], ';', english_methods))
    # Positional columns in the French copy correspond to Victim and Scam_Method.
    paired_matches = 0
    for en, fr in zip(english, french):
        values = list(fr.values())
        translated = {'Oui': 'Yes', 'Non': 'No'}.get(values[8].strip())
        methods_match = map_methods(en['Scam_Method'], ';', english_methods) == map_methods(values[10], ',', french_methods)
        paired_matches += translated == en['Victim'] and methods_match
    return {
        'english_rows': len(english), 'french_rows': len(french),
        'same_victim_status_and_recognized_methods_at_same_row': paired_matches,
        'self_reported_victims': sum(row['Victim'] == 'Yes' for row in english),
        'recognized_methods_among_victims': dict(counts),
    }


def label_counts(path, column):
    return dict(Counter(row[column].strip().lower() for row in rows(path)))


def inspect_datasets(root):
    enron, sample = inspect_enron(root / 'enron_data_fraud_labeled.csv')
    screenshot_dir = root / 'archive (4)'
    screenshot_rows = list(rows(screenshot_dir / 'spam_texts.csv'))
    image_matches = sum((screenshot_dir / 'images' / Path(row['image']).name).is_file() for row in screenshot_rows)
    ordinary_ecommerce = {
        path.name: sum(1 for _ in rows(path))
        for path in sorted((root / 'archive').glob('*.csv'))
    }
    central_asia = root / 'archive (1)'
    return {
        'enron': enron,
        'financial_ecosystem_fraud_aml_label_counts': label_counts(root / 'Financial_Ecosystem_Dataset_T1_5k_.csv', 'Target_Is_Fraud_AML'),
        'ecommerce_rows_without_a_fraud_label': ordinary_ecommerce,
        'central_asia_transaction_fraud_label_counts': label_counts(central_asia / 'transactions.csv', 'is_fraud'),
        'central_asia_related_rows': {
            name: sum(1 for _ in rows(central_asia / name)) for name in ('users.csv', 'merchants.csv')
        },
        'promotional_sms_transcripts': {'rows': len(screenshot_rows), 'matching_image_files': image_matches},
        'mobile_money_survey': inspect_surveys(root / 'Mobile Money Phone Scam Survey Dataset'),
    }, {'enron_label_zero_reference': sample, 'promotional_sms_reference': [row['text'] for row in screenshot_rows]}


def evaluate(reference_sets):
    process = subprocess.Popen(
        ['node', str(HERE / 'evaluate.mjs'), '--stdin'],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, encoding='utf-8',
    )
    with process:
        assert process.stdin is not None and process.stdout is not None
        with process.stdin as stream:
            for name, messages in reference_sets.items():
                for message in messages:
                    stream.write(json.dumps({'set': name, 'message': message}, ensure_ascii=False) + '\n')
        output = process.stdout.read()
        if process.wait():
            raise RuntimeError('MoneyShield comparison failed')
    return json.loads(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset-root', required=True, type=Path,
                        help='Directory with the six original attachments and their original names')
    args = parser.parse_args()
    audit, references = inspect_datasets(args.dataset_root)
    print(json.dumps({'audit': audit, 'comparison': evaluate(references)}, indent=2))


if __name__ == '__main__':
    main()
