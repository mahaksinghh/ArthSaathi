"""Measure QR readability on local datasets. Prints aggregate counts only."""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import struct
import subprocess

from PIL import Image

HERE = Path(__file__).resolve().parent


def scan_images(paths):
    process = subprocess.Popen(['node', str(HERE / 'qr-read.mjs')],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    with process:
        with process.stdin as stream:
            for path in paths:
                with Image.open(path) as source:
                    image = source.convert('RGBA')
                    stream.write(struct.pack('>II', image.width, image.height))
                    stream.write(image.tobytes())
        output = process.stdout.read()
        if process.wait():
            raise RuntimeError('QR benchmark failed')
    return json.loads(output)


def archive_split(root, split):
    paths = sorted((root / split / 'images').glob('*.jpg'))
    boxes = Counter()
    for path in paths:
        labels = root / split / 'labels' / (path.stem + '.txt')
        if labels.is_file():
            boxes.update(line.split()[0] for line in labels.read_text().splitlines() if line.strip())
    return paths, dict(boxes)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset-root', type=Path, required=True)
    parser.add_argument('--png-groups', type=int, default=250,
                        help='Minimum-hash sample of code families, with every image variant in each family')
    args = parser.parse_args()
    if args.png_groups < 1:
        parser.error('--png-groups must be positive')
    archive = args.dataset_root / 'archive (2)'
    dataset = args.dataset_root / 'qr_dataset'
    train, train_boxes = archive_split(archive, 'train')
    holdout, holdout_boxes = archive_split(archive, 'test')
    groups = defaultdict(list)
    for path in dataset.glob('*.png'):
        groups[path.stem.rsplit('-v', 1)[0]].append(path)
    if not train or not holdout or not groups:
        parser.error('Expected both supplied folders with their original names and file structure')
    sampled_keys = sorted(groups, key=lambda name: hashlib.sha256(name.encode()).digest())[:args.png_groups]
    sample = sorted(path for name in sampled_keys for path in groups[name])
    results = {
        'archive_train': {'images': len(train), 'annotation_classes': train_boxes},
        'archive_test': {'annotation_classes': holdout_boxes, **scan_images(holdout)},
        'qr_dataset': {'images': sum(map(len, groups.values())), 'filename_families': len(groups),
                       'sampled_families': len(sampled_keys), **{
                            'benchmark': scan_images(sample)
                       }},
    }
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
