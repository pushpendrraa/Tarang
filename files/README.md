# TraceNet — Dummy Dataset (SIH26189)

Synthetic, fictional data for demoing the AI-Powered Criminal Network Analysis System.
**All names, numbers, accounts, and locations are made up.** No real persons, phone
numbers, or bank accounts are represented.

## What's in here

| File | Purpose | Feeds into |
|---|---|---|
| `cases.json` | 4 case records (Mumbai, Delhi, Punjab, Kolkata) | Case Management module |
| `fir_reports.json` | Unstructured FIR narrative text (the actual "documents" investigators upload) | NLP Entity Extraction |
| `surveillance_notes.json` | Additional unstructured intel notes | NLP Entity Extraction |
| `cdr_records.csv` | 86 call detail records (caller, callee, timestamp, tower) | Entity Extraction + Graph edges |
| `financial_transactions.csv` | 28 bank transactions between accounts | Entity Extraction + Graph edges |
| `entities_master.json` | Ground-truth list of every person/phone/vehicle/account/location, with real IDs | Seed script for your DB (also acts as your "answer key") |
| `relationships_ground_truth.json` | The hidden network your system *should* eventually surface, plus a ready-made demo script | Validation + your jury demo narrative |

## The storyline (read this before demoing)

Four FIRs look unrelated on the surface:
1. **Mumbai** — a courier caught with narcotics, mentions a supplier and a payment handler
2. **Delhi** — an extortion complaint naming a local gang
3. **Punjab** — a truck interception with a mysterious "Mumbai contact" in the call log
4. **Kolkata** — a vague informant tip about someone called "RV"

None of the four FIRs name a single connecting figure. The connection only emerges when you
cross-reference: a burner phone number, a shell-company bank account, and the alias "RV" —
all pointing to one entity, **Rajesh Verma (P001)**, who never appears as a named suspect in
any individual FIR.

This is intentionally designed so your entity resolution + graph analytics pipeline has
something real to *discover*, rather than just visualizing already-obvious connections —
which is exactly what the problem statement asks for ("uncover hidden relationships... that
are fragmented, unstructured, and distributed across multiple systems").

## How to use it

1. Seed your MongoDB using `entities_master.json` and `cases.json` directly (these map
   cleanly to your `Entity` and `Case` schemas).
2. Run your NLP extraction pipeline against the `text` fields in `fir_reports.json` and
   `surveillance_notes.json` — this is your "unstructured input" demo.
3. Load `cdr_records.csv` and `financial_transactions.csv` as structured input — this is
   where most of your relationship edges will come from.
4. Use `relationships_ground_truth.json` to check your system's output against what it's
   *supposed* to find, and reuse its `suggested_demo_narrative` as your live jury walkthrough.

## Regenerating / extending

`generate_csv.py` (included) regenerates `cdr_records.csv` and `financial_transactions.csv`
from the same entity list, with a fixed random seed (42) for reproducibility. Edit the
`storyline_calls` / `storyline_txns` lists to add more hidden links, or bump the noise-record
counts if you want a denser graph for the demo.
