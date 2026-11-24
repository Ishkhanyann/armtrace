# ArmTrace requirements

## Sources

Local coursework materials, reviewed on 2026-11-24:

- `blockchain-web3-phase1-guide.pdf`: Phase 1 rules on pages 2–3; topic 9 on page 9; assessment criteria on page 19.
- `kursayinword.docx`: research, four role interfaces, event-based traceability, custody signatures and Web3 simulation.
- `Կուրսային_աշխատանք.docx`: revised research and problem statement for the same topic.
- `Տիտղոսաթերթ.docx`: individual coursework assignment for the same topic.

The two main coursework documents cover the same product. Their different research sections do not establish separate applications or divide development responsibilities. The PDF supplies the complete Phase 1 requirements.

## Confirmed by the user

1. Build one shared application.
2. Use clothing as the demonstration product category.
3. Use Armenian UI text, allowing familiar Web3 terms in English.
4. Use a light business interface with a sidebar, batch tables, route map, and blue/green accents.
5. Use GitHub for project tracking.
6. Create a new public repository.
7. Interview the user before implementing the frontend.

`ArmTrace` / `armtrace` is a provisional project and repository name selected during setup. The user has not chosen a final product brand.

## Required by the coursework

### Manufacturer

Register a new batch, create its Batch ID and generate a unique QR code.

### Logistics operator

Identify a batch using the QR interface; record receipt/transfer, GPS coordinates and timestamps; confirm custody.

### Administrator/controller

Monitor the full chain. The Word coursework additionally describes access management.

### Consumer

View the product route, event history and current status.

### Web3 UI and simulation

- An active Connect Wallet control in the top-right of every screen; connected state displays an abbreviated address and balance.
- Simulated wallet signing/confirmation dialogs.
- Explicit Pending, Success and Fail/Reverted transaction states.
- Mock tokens and a faucet control.
- Distinct Batch ID and simulated blockchain hash displays.
- QR scanning and location UI.
- Multisig logistics transfers.
- A Digital Product Passport represented as an NFT.
- Demonstration flow: logistics receives goods → scans a QR code → selects Confirm Custody → sees Mining Transaction → batch becomes In Transit → consumer route gains a timestamped point.

Phase 1 is a frontend simulation. Hashes, mock signatures and NFT displays must not claim to prove an actual on-chain transaction or real-world authenticity.

## Open decisions

- Final product name and clothing brand/demo data.
- Batch-level versus individual-item consumer lookup.
- Clothing fields, variants and whether a batch may be split.
- Demonstration organizations, locations and route.
- Exact lifecycle states and transfer/multisig rules.
- Role entry, demo identities and wallet behavior.
- Consumer-visible versus internal information.
- QR scanning behavior and fallback input.
- Map and location simulation behavior.
- Local persistence and a repeatable demonstration/reset flow.
- Frontend tooling and any additional instructor restrictions.
- Detailed screen composition and delivery/run expectations.
