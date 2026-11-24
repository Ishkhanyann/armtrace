# ArmTrace

Հագուստի մատակարարման շղթայի հետագծելիության ուսումնական Web3 հավելված։

An educational Web3 application for clothing supply-chain traceability, based on coursework topic 9: a supply-chain traceability system for manufacturers and logistics companies.

## Գործարկում / Run

Requires Node.js 22 or newer and npm. On Windows, double-click `start-armtrace.cmd`, or run:

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. Keep that terminal open while using the app.

```sh
npm run build     # TypeScript check and production build in dist/
npm run preview   # Serve the production build locally
npm test          # Domain behavior tests
npm run test:e2e  # Browser scenarios; first run: npx playwright install chromium
```

Phase 1 is an interactive frontend simulation. A database, real smart contracts and authenticated backend access belong to later coursework phases. The role switcher is a demonstration tool, not a security boundary.

## Agreed direction

- One shared application for both coursework participants.
- Clothing supply chains.
- One QR code per batch of the same clothing article, color and size.
- Four international demonstration routes: normal delivery, customs hold, document mismatch and rejected handover after packaging damage.
- Armenian interface; familiar Web3 terms may remain in English.
- Light business interface with blue and green accents.
- A demonstration role switcher and consumer access without registration.
- Public GitHub repository for source code and issue tracking.

## Required interfaces

- Manufacturer: register batches and generate QR codes.
- Logistics operator: identify batches, record location and confirm custody transfers.
- Administrator/controller: monitor the chain and manage access.
- Consumer: view product history, route and current status.

## Required Phase 1 simulations

- Connect Wallet, abbreviated wallet address and balance.
- Wallet signature and transaction confirmation dialogs.
- Pending, Success and Fail/Reverted states.
- Mock tokens and a faucet.
- Batch identifiers, simulated blockchain hashes and GPS coordinates.
- Multisig custody transfers and an NFT-style Digital Product Passport.
- Confirm Custody → Mining Transaction → In Transit → updated consumer route/history.

## Documentation

- [Requirements and open decisions](docs/requirements.md)
- [Frontend specification](docs/frontend-spec.md)
- [Defense demonstration guide / Ցուցադրության ուղեցույց](docs/demo-guide.md)
- [Domain vocabulary](GLOSSARY.md)
- [Implementation task](https://github.com/Ishkhanyann/armtrace/issues/1)

The original PDF and Word coursework files remain local reference materials.

## How the simulation works

One QR identifies one batch of the same article, color and size. Custody changes after the sender and designated receiver sign under different organization identities. Signing once, declining or encountering a failed transaction leaves custody unchanged.

Uploaded files are hashed with SHA-256 over their actual bytes. Each batch has a downloadable original demo document for repeatable matching/mismatching tests. Only file names, hashes and version metadata are kept; file contents are not uploaded to a service.

Consumer pages contain product characteristics, origin, delivery status and a simple route/history. Staff hashes, signatures, internal documents and transaction mechanics are omitted from that view. All records are fictional and stored in the browser's localStorage; no sensitive real information should be entered into this public educational frontend.

The map uses [Leaflet](https://leafletjs.com/reference.html) and attributed OpenStreetMap tiles. Internet is needed for map imagery; route lines, markers and the stage list still work without tiles. Route lines are schematic and locations are demonstration coordinates, not live GPS. Fonts and garment artwork ship with the app.

QR camera access requires browser permission and localhost or HTTPS. Image upload and manual Batch ID lookup are available as alternatives. A QR contains the current site's address: a localhost QR works on the same computer. Opening it on another device requires hosting the built application at an address reachable by that device.

Data survives a reload. Use **Վերականգնել սցենարները** in the sidebar to reset the demonstration after confirmation. Clearing browser data also resets the simulation.

## Main source files

- `src/domain/`: batch model, demo data, business commands and public passport projection.
- `src/pages/`: staff workspaces and the consumer passport.
- `src/components/`: maps, QR tools, signing dialogs and shared UI.
- `src/store.tsx`: browser persistence, session and transaction simulation.
- `src/styles.css`: responsive interface.

No server, private key, API secret or real cryptocurrency is required.
