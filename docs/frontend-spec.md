# ArmTrace frontend specification

## Goal

Deliver the interactive Phase 1 frontend of coursework topic 9, implementing the decisions in `requirements.md`. The shared clothing-traceability product has an Armenian interface, a light business design and four international demonstration scenarios.

## Product and navigation

- ArmTrace is the working product name.
- Persistent desktop sidebar; compact, usable navigation on small screens.
- Staff pages: overview, batches, route map, custody transfers, documents, transaction history. The controller also manages participant access.
- Four demo roles: manufacturer, logistics operator, controller, consumer. Staff can choose an organization belonging to their role. Switching identity disconnects the simulated wallet.
- Consumer entry is a shareable hash URL containing the Batch ID. It works without a connected wallet. A batch picker/manual ID lookup provides a camera-free demonstration path.
- Each batch contains one clothing article, color and size, plus quantity, composition, production date and origin. No splitting or individual-item tracking.

## Demonstration data

1. Armenia → Georgia, T-shirts: normal delivery; starts ready for the first handover.
2. Georgia → Armenia, jackets: missing document at a customs stage; starts on hold.
3. Italy → Armenia, jeans: submitted document hash mismatch; starts blocked for review.
4. Armenia → Germany, hoodies: rejected handover after packaging damage; starts as an open incident.

Companies, records and procedures are fictional educational data. Map connections are schematic route segments, not turn-by-turn directions. All coordinates are demonstration data, never a claim of live GPS.

## Custody and incidents

- Only the current active custodian can initiate a handover to the next route participant.
- The sender signs first. The designated receiver must sign under its own organization identity. Two signatures from one identity cannot complete the transfer.
- Custody, route progress and consumer history change only after the receiver's successful signature. Intermediate acceptance sets In Transit; final acceptance sets Delivered.
- Receiver rejection records an incident and leaves custody unchanged.
- A customs hold, integrity mismatch or incident blocks further handovers until resolved.
- Controllers resolve customs and integrity cases only after an uploaded document matches the recorded original. Packaging incidents require a recorded resolution note before a new handover can be initiated.
- New events append to the history. Corrections never replace prior document versions or incident events.

## Web3 simulation

- Connect Wallet in the top-right, a connected address and MOCK-ETH balance, and a faucet.
- Simulated signing dialog shows organization, action, batch and gas fee.
- Rejection/cancellation, Pending/Mining, Success and Fail/Reverted are explicit. A selectable failure outcome supports repeatable demonstrations; failed transactions do not mutate business data or charge gas.
- Each successful action costs a small mock fee. Insufficient balance is handled, and the faucet can replenish mock funds.
- Transaction records include timestamps and clearly simulated hashes. The NFT-style staff passport includes a simulated token ID and metadata, separate from the consumer view.
- No backend, actual blockchain transaction, real private key or real wallet connection.

## Documents, QR and map

- Generate actual decodable QR codes for public batch-passport URLs and support PNG downloads.
- Accept a batch ID or passport URL manually. Provide camera scanning where available, with explicit permission/error handling and an image-upload fallback.
- Compute SHA-256 over uploaded file bytes. Supply downloadable reference demo files so correct and altered uploads can both be demonstrated.
- Keep internal document hashes and versions in staff pages. Do not expose their contents in the consumer UI.
- Interactive map shows planned route and completed points; selecting a batch changes its route. The map also retains an offline schematic fallback if tiles cannot load.

## Consumer essentials

Show product illustration, article, composition, color, size, origin/manufacturer, delivery status, general route and important dates. Do not show staff addresses, gas fees, transaction hashes, multisig details or document controls. Public projection is separately defined and tested; all stored records remain fictional because this is a frontend simulation, not an access-controlled backend.

## Persistence and delivery

- Persist demonstration records locally with version/shape validation. A reset action with confirmation restores all four initial scenarios.
- React + TypeScript, Vite, local fonts, QR and map libraries. Use dependencies compatible with the installed Node.js version.
- Include reproducible npm install/build/test scripts, a Windows launch helper, a documented defense walkthrough and GitHub CI.
- No production deployment is included in this phase.

## Verification

Check the public domain command interface for two-party custody, role restrictions, incident blocking/resolution, append-only document correction and consumer projection. Check critical UI interactions, real QR encoding, failed transaction behavior and a production build. Run a separate standards review and specification review against the implementation baseline `e51ca86`.
