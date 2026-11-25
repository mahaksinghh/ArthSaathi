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

## Mentor demo

Open [Why ArthSaathi?](https://arthsaathi-rosy.vercel.app/mentor.html) for the comparison, documented browser capabilities, API inventory and benchmark scope. [Start the guided sale review](https://arthsaathi-rosy.vercel.app/?demo=sale-qr) to open the fictional Meera Stores sale for ₹2,450. The guided demo runs separately from your regular browser workspace and resets on refresh.

1. Select **Check a QR for this sale** and then **Scan sample for this sale**. The amount matches the sale, but the fixture encodes `collection@demo` instead of the expected `meera@demo`.
2. Save the QR review. The sale remains pending. Only review indicators and metadata are saved with the sale.
3. Simulate separately checking incoming credit and record the confirmation. The business ledger receives one user-confirmed entry.

## Product and architecture

- **Overview and MoneyManager** show separate personal and business ledgers, monthly totals, daily charts, spending budgets and digital khata. Money is represented as integer paise. Pending dues are tracked apart from collected income.
- **MoneyShield** checks pasted text, URL structure and QR images locally. It looks for credential requests, fake payment and refund tactics, KYC pressure, remote access and lookalike links. The result shows which indicators matched and what to check next. See the [dataset audit and before/after evaluation](benchmarks/README.md).
- **MoneyGuide** offers English and Hindi lessons from RBI, SEBI Investor and the National Cyber Crime Reporting Portal. **Explain with AI** requests a plain-language explanation of the selected lesson with a fictional example. If the AI service is unavailable, it shows a labeled MoneyGuide example.
- **Intelligence Hub** compares a QR against an open sale’s expected amount and an independently known UPI ID when supplied. It can save both message and QR summaries on that sale. One local state write changes sale status and adds a receipt after separate user confirmation of incoming credit. Repeat confirmations are rejected.
- **Onboarding, reporting and privacy** include a clean or fictional workspace, India’s 1930 helpline and official complaint portal, optional scan-summary history, export and whole-workspace deletion.

```text
Browser UI (English / हिन्दी)
    ├── MoneyShield → local rule engine
    ├── MoneyManager → paise ledger, budgets and dues
    ├── Intelligence Hub → risk summary → sale → user-confirmed receipt
    └── MoneyGuide → curated lessons → preset AI explanation or built-in example
           Browser localStorage ← ledger, settings and opted-in summaries
```

`public/app.js` renders and wires the app, `public/core.js` contains the domain rules, and `public/guide.js` holds the reviewed content and links. This MVP uses browser JavaScript and a dependency-free Node server. The earlier React, FastAPI and Supabase proposal was simplified so the core demo runs from one folder without cloud credentials.

## QR checks in MoneyShield

Open **MoneyShield → QR check** and choose a PNG, JPEG, or WebP screenshot or photo of up to 10 MB. For payment QR codes, provide an independently known UPI ID or amount if available. The result shows the encoded payment details, recipient or amount mismatches, repeated fields, and suspicious link destinations. Use **Try payee mismatch** or **Try suspicious link** for built-in fictional examples.

Images and decoded values stay in the current screen. MoneyShield does not open QR destinations, launch payment apps, or perform transactions. It assesses supported UPI and web-link payloads. A matching UPI ID or low signal result does not verify a merchant, an unreadable code, or a payment. [QR dataset evaluation](benchmarks/QR.md)

## Deploy

**Vercel (public demo).** Deploy the project root so Vercel builds `dist/` and detects `api/guide.js`. The function uses Vercel AI Gateway with project OIDC and Google Gemini 2.5 Flash Lite. It accepts only the selected lesson and language, then sends the curated lesson and a fixed request for an example to the model. The provider response is cached by lesson and language. The Vercel team must complete AI Gateway verification before it can make model requests. The guide shows a labeled built-in example when the Gateway is unavailable. [AI Gateway setup](https://vercel.com/docs/ai-gateway/getting-started) · [Project OIDC](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc)

**Static hosting.** Run `npm run build` and publish `dist/`. MoneyGuide uses the built-in examples when hosted without a function.

**Optional typed AI questions (local or trusted Node host).** Copy `.env.example` to `.env`, set `OPENAI_API_KEY` and `OPENAI_MODEL` to values from your OpenAI project, then run:

```sh
node --env-file=.env server.mjs
```

For a Node host, set those environment variables using the host's secret settings, use `npm start`, and configure the required `HOST` and `PORT`. The same-origin endpoint uses the OpenAI Responses API for preset explanations and for typed lesson questions with explicit consent. The endpoint is rate-limited in memory and meant for a trusted demo. Keep typed questions on trusted deployments. [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create)

## Data and scope

Data lives in the current browser profile and origin. It does not sync across devices and is not encrypted by ArthSaathi. Raw scan text stays in memory until it is cleared or the tab closes. Scan history is off by default. Disabling it removes saved history, while a linked risk summary remains part of its sale until workspace deletion. Exports are local JSON snapshots. This MVP has no import, account sign-in, cloud backup, signed receipts, or bank connection. Use one tab for editing during the demo. Voice input, OCR, automatic monitoring, credit-readiness reporting, savings goals, bill reminders and native apps are outside this build.

## Covexcode CLI

Covexcode CLI v1.18.0 was used on 25 November 2026 for a development-time QA review of MoneyShield’s fictional QR mismatch scenario. The CLI was connected to a local Qwen2.5 model. Its reply changed the scanned ID, so the team rejected that detail and added an exact-identifier regression check. The released app’s opening screen and dashboard link to the prompt, CLI reply, and verified result.

[CLI usage evidence](public/build-evidence.html) · [Official Covexcode release](https://github.com/HolboxAI/covexcode/releases/tag/v1.18.0)

## Ask ArthSaathi

Open **Ask ArthSaathi** from the dashboard. English, Hindi and Marathi are available in the assistant. The rest of the app supports English and Hindi. Use **Speak** to transcribe a question, review the text, then submit it. **Listen** reads an answer aloud when a matching voice is available. Microphone input depends on browser support and permission and may use the browser vendor's speech service. Typed chat remains available.

The assistant searches two bundled collections at runtime: a multilingual product handbook and curated lessons from RBI, SEBI Investor and India's National Cyber Crime Reporting Portal. It can explain the current product, open the relevant screen and link official sources. This uses retrieval and reviewed text. No custom model was trained or fine-tuned.

To enable web answers, start the optional Node server as described above with an OpenAI model that supports the Responses API web search tool. In the assistant panel, opt in to sending questions. **Send question** returns the strongest available answer. Bundled answers take priority, followed by opted-in AI web answers when enabled. Web results show clickable citations when the provider returns them. The feature can decline a question or fail if the provider, model or evidence is unavailable. No prior turns, transaction records or voice recordings are sent by the assistant endpoint. The static hosted version can run the bundled assistant and supported browser voice controls. Web answers require the Node deployment. [OpenAI web search documentation](https://developers.openai.com/api/docs/guides/tools-web-search?api-mode=responses)

### General questions without credentials

The assistant now answers arithmetic directly, including decimal numbers, parentheses, and Devanagari digits. It also includes a small set of sourced example facts. Sourced quick facts and product help work without credentials. If a question falls outside the available answers, the assistant asks for clarification. The optional AI web search above can synthesize broader answers when configured.
