# Three-minute demo

**ArthSaathi · The Solvers · HackNova Track 1**

Before presenting, run `npm start` and open the app in a clean browser profile. Keep that local tab ready as a fallback if venue internet is unreliable. Choose **Explore demo** and confirm the **Demo workspace** badge.

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:25 | Overview, daily chart and personal/business toggle | “A neighbourhood shop can see what it collected, what it spent and what customers still owe.” |
| 0:25–0:55 | MoneyShield → Use demo scam → Check for risk | “Someone claims they sent ₹2,450 and asks the shopkeeper to enter a PIN. The rules show the the PIN-to-release-payment request, urgency and link signals. The score is a warning, not a fraud probability.” |
| 0:55–1:35 | Link to a sale → Meera Stores → Link risk summary | “The claim is attached to the open sale. Cash flow stays unchanged. In real use the shopkeeper opens their own bank or UPI app and checks the incoming credit independently.” |
| 1:35–2:00 | Check the fictional demo attestation and record confirmation | “Only the shopkeeper’s confirmation moves ₹2,450 into recorded income. ArthSaathi records their decision and has no connection to the bank.” |
| 2:00–2:25 | MoneyManager → ledger and budget, then reload | “Meera Stores has one receipt. The open dues fell by the same amount. The workspace survives a refresh.” |
| 2:25–3:00 | Switch to हिन्दी, open MoneyGuide and Report fraud | “Official guidance is available in both languages. In India, the emergency reporting screen links to 1930 and the national portal.” |

For the next run, use a fresh browser profile or use **Privacy & data → Delete local data** on the fictional workspace, then reopen the demo.

## Smoke checks

1. Empty onboarding starts with zero totals. Add a personal expense for ₹50.25 and a personal budget of ₹100. The budget shows roughly 50% used and the business ledger stays unchanged.
2. Add an unpaid business sale. Linking a scan to it must preserve income. Leave the attestation unchecked and attempt submission. Check it, submit again, and confirm that only one linked income entry appears after reload.
3. Opt into scan-summary history and run a check. Verify the export contains the score and rule IDs only and no raw scan text. Turn history off and confirm the history is removed.
4. Open the app at a mobile viewport and switch languages. Verify that the controls and reporting links remain usable.
5. With no API credentials, verify the sourced topic cards work and the AI panel says it is disabled.


## Demo a suspicious QR

Open **MoneyShield → QR check → Try payee mismatch**. The fictional expected ID is `meera@demo`, but the QR encodes `collection@demo`. The assessment shows the mismatch. **Try suspicious link** shows the actual host, `redirect.test`.

For the file-upload demo, use the PNGs in `public/demos/`. Enter `meera@demo` and `2450.00` as the expected details for the UPI examples.
