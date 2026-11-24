# ArmTrace

Հագուստի մատակարարման շղթայի հետագծելիության ուսումնական Web3 հավելված։

An educational Web3 application for clothing supply-chain traceability, based on coursework topic 9: a supply-chain traceability system for manufacturers and logistics companies.

## Project stage

Requirements interview in progress. Application code and run commands will be added after the user flows are agreed.

Phase 1 delivers an interactive frontend simulation. Database implementation and real smart contracts belong to later coursework phases.

## Agreed direction

- One shared application for both coursework participants.
- Clothing supply chains.
- Armenian interface; familiar Web3 terms may remain in English.
- Light business interface with blue and green accents.
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
- [Domain vocabulary](GLOSSARY.md)

The original PDF and Word coursework files remain local reference materials.
