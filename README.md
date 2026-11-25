# ArthSaathi

**The Solvers · HackNova 2026 · Track 1, Fintech and Financial Inclusion**

ArthSaathi helps people and small shops check suspicious messages, record their money and find trustworthy financial guidance. The Financial Intelligence Hub connects those tasks. It keeps a pending sale outside cash flow until a person checks the incoming credit in their own bank or UPI app and records their confirmation.

## Run it

Use Node.js 20 or later. There are no npm dependencies or API keys required for the main demo.

```sh
npm start
```

Open http://127.0.0.1:4173 and choose **Explore demo** or **Start empty**. The demo workspace and its records are labeled fictional. Run `npm test` for the core and HTTP tests and `npm run build` to generate the static site in `dist/`.

See [DEMO.md](DEMO.md) for the presentation script and repeatable checks. Use a separate browser profile for the demo if you already have real records on that origin.

## Product and architecture

- **Overview and MoneyManager** show separate personal and business ledgers, monthly totals, daily charts, spending budgets and digital khata. Money is represented as integer paise. Pending dues are tracked apart from collected income.
- **MoneyShield** checks pasted text and URL structure locally. Each rule contributes once, the total is capped at 100, and explanations show every matched rule. Scores are uncalibrated heuristics. The app neither opens links nor uses reputation services.
- **MoneyGuide** contains bilingual lessons from RBI, SEBI Investor and the National Cyber Crime Reporting Portal. It works with the optional AI endpoint off.
- **Intelligence Hub** stores a risk summary against a sale. One local state write changes the sale status and adds a linked receipt after explicit confirmation. The domain function rejects repeat confirmations.
- **Onboarding, reporting and privacy** include a clean or fictional workspace, India’s 1930 helpline and official complaint portal, optional scan-summary history, export and whole-workspace deletion.

```text
Browser UI (English / हिन्दी)
    ├── MoneyShield → local rule engine
    ├── MoneyManager → paise ledger, budgets and dues
    ├── Intelligence Hub → risk summary → sale → user-confirmed receipt
    └── MoneyGuide → curated lessons → optional consent-based Node endpoint
           Browser localStorage ← ledger, settings and opted-in summaries
```

`public/app.js` renders and wires the app, `public/core.js` contains the domain rules, and `public/guide.js` holds the reviewed content and links. This MVP uses browser JavaScript and a dependency-free Node server. The earlier React, FastAPI and Supabase proposal was simplified so the core demo runs from one folder without cloud credentials.

## Deploy

**Static hosting (recommended for judging).** Run `npm run build` and publish the contents of `dist/` as a static site. For Vercel, import the project folder or select it as the root directory. The included `vercel.json` sets the build command and output folder. The static deployment keeps AI disabled.

**Optional real AI (local or trusted Node host).** Copy `.env.example` to `.env`, set `OPENAI_API_KEY` and `OPENAI_MODEL` to values from your OpenAI project, then run:

```sh
node --env-file=.env server.mjs
```

For a Node host, set those environment variables using the host's secret settings, use `npm start`, and configure the required `HOST` and `PORT`. The same-origin endpoint calls the OpenAI Responses API. It sends the selected curated lesson, language and explicitly consented question. The endpoint is rate-limited in memory and meant for a trusted demo. Keep it off on unauthenticated public deployments. The app never sends payment messages, ledger records or dues to the provider. [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)

## Data and scope

Data lives in the current browser profile and origin. It does not sync across devices and is not encrypted by ArthSaathi. Raw scan text stays in memory until it is cleared or the tab closes. Scan history is off by default. Disabling it removes saved history, while a linked risk summary remains part of its sale until workspace deletion. Exports are local JSON snapshots. This MVP has no import, account sign-in, cloud backup, signed receipts, or bank connection. Use one tab for editing during the demo. Voice input, OCR, automatic monitoring, credit-readiness reporting, savings goals, bill reminders and native apps are outside this build.

## Covexcode

Covexcode is named on the [HackNova event listing](https://devnovate.co/event/hacknova-2026). No Covexcode tool or command was available in this workspace, so it was not used. If the organisers provide access, open this project in the tool using their onboarding instructions. A bounded task for the team is to add a missing Hindi URL-rule test or review the sale confirmation path. Review the diff, run `npm test` and `npm run build`, and record the actual tool use for submission. Keep API keys and real financial data out of prompts.
