# MoneyShield evaluation

All six attachments were reviewed locally. The update uses weighted, explainable rules for pasted messages and URLs. It uses the survey to choose scam patterns and checks those rules against controlled scenarios and two reference sets. The repository and hosting bundle contain no raw attachments, messages, screenshots, identities, or extracted personal data.

## Before and after

The same 74 fictional messages and URLs were run through both versions. They include 39 scam scenarios and 35 ordinary scenarios in English, Hindi and Hinglish. An alert means either **Review before acting** or **High risk**, the same score threshold of 25 in both versions.

| Measure | Previous | Updated |
| --- | ---: | ---: |
| Scam scenarios flagged | 14 / 39 | 37 / 39 |
| Ordinary scenarios flagged | 12 / 35 | 2 / 35 |
| Recall | 35.9% | 94.9% |
| Precision | 53.8% | 94.9% |
| F1 | 43.1% | 94.9% |

The scenarios were authored as part of this upgrade, so these are development benchmark results. They do not establish real-world detection accuracy. Both versions missed scenarios where the visible message or URL had no identifying scam signal. The updated engine asked for review on a legitimate-looking debit alert with a supplied phone number and an internal HTTP address.

| Supplied reference set | Previous alerts | Updated alerts |
| --- | ---: | ---: |
| Distinct Enron label-zero texts, 10,000 sampled | 125, including 1 high | 21, including 7 high |
| Promotional SMS transcriptions, 25 | 0 | 0 |

The Enron labels and promotional messages have no verified fraud verdict for this use. These rows measure how often rules fire. They cannot measure false-positive rates. The updated detector issued fewer alerts overall and more high-risk alerts on the historical email sample.

## How the attachments were used

| Attachment | What the review found | Use in this upgrade |
| --- | --- | --- |
| Mobile Money Phone Scam Survey Dataset | 800 English rows and 800 French rows. Victim status and recognized method categories agree row for row across the language versions. Of 315 self-reported victims, 193 reported fake-agent calls, 149 fake withdrawal/deposit messages, 56 false customer payments, and 33 mistaken-transfer reimbursement requests. Respondents could select multiple methods. | Used once to identify patterns and design checks and scenarios. Survey responses are reports about incidents, without labels for individual incoming messages. |
| `archive (4)` | 25 promotional-looking SMS transcriptions and 25 matching image files. | Used the provided transcriptions to check for overflagging ads. The screenshots and texts lack independent scam verdicts. |
| `enron_data_fraud_labeled.csv` | 447,417 historical email rows with 2,327 positives. All positives had the external-sender, low-communication and no-reply/forward flags. Another 18,735 label-zero rows had those same three flags. There were 204,795 repeated nonempty text rows under the normalized 4,000-character comparison, including three text groups with both labels. | Deterministically sampled 10,000 distinct label-zero texts as a historical reference. Excluded duplicate-label conflicts. Corporate email labels were not treated as verified UPI or SMS fraud labels. |
| `archive (1)` | 150,000 simulated Central Asian payment transactions, including 5,205 labeled fraudulent, plus user and merchant tables. | Reviewed label balance and input fields. The transaction labels require structured inputs that a pasted message or URL does not supply. |
| `Financial_Ecosystem_Dataset_T1_5k_.csv` | 5,000 structured rows with 3 positive fraud/AML labels. | Reviewed target balance and input fields. Its transaction and AML labels are a different outcome from message fraud. |
| `archive` | Order, customer, product and payment tables with no fraud ground truth. | Reviewed schema. Order and payment statuses are unsuitable as scam labels. |

## Run the evaluation

From the ArthSaathi project folder, use Node.js 20 or later.

```sh
node benchmarks/evaluate.mjs
python3 benchmarks/evaluate-datasets.py --dataset-root "$HOME/Desktop"
```

The second command requires the original attachments and names. It streams private reference texts to a local process, discards them after scoring, and prints aggregate counts. It uses up to the first 4,000 characters of each email's subject and body, as required by the scanner input limit. No message or URL is opened or sent to a service.

The updated browser detector uses the wording around sensitive requests and checks link structure separately. Results contain a version, a risk indicator score and reason IDs. Scores are uncalibrated and a receipt or screenshot cannot confirm that money arrived.

Safety examples and suggested actions draw on official guidance. [RBI cyber fraud advisory](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185) · [NPCI fraud awareness](https://www.npci.org.in/fraud-awareness) · [CERT-In Digital Safety Compass](https://www.cert-in.org.in/PDF/CSH_Booklet25.pdf)
