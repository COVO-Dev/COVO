# ML Matching API

This service implements an influencer-brand matching engine using weighted cosine similarity. It currently supports Facebook, with the intention of including YouTube and TikTok vectors (configurable via the `platform` field).

Repository Structure

server/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── load_test_data.py
├── README.txt
└── matching/
├── **init**.py
├── algorithm.py
├── database.py
└── main.py

- Dockerfile: Builds a Python container running the FastAPI app.
- docker-compose.yml: Brings up the API service on port 8000.
- requirements.txt: Lists Python dependencies.
- load_test_data.py: Inserts sample influencer vectors into MongoDB.
- README.txt: This guide.
- matching/: Contains the core Python modules:
  - algorithm.py: weighted_cosine_similarity logic.
  - database.py: MongoDB connection and platform-based fetch.
  - main.py: FastAPI app exposing the /match endpoint.

Prerequisites

- Python 3.12+
- MongoDB cluster with a `metrics` database and collections named `Facebook`, `YouTube`, and `TikTok`.
- Docker & Docker Compose (optional).

Quick Start (Local without Docker)

1. Install dependencies:
2. Load sample data:
3. Run the API:
4. Open the docs:
   http://127.0.0.1:8000/docs

---

Quick Start (With Docker)

1. Build & run:
   cd server
   docker-compose up --build

2. Open the docs:
   http://127.0.0.1:8000/docs

## Usage

POST /match

Request body example:

    {    "target_vector": [100,2000,50000,3000,200,150,4.1,0.3,0.25,0.05,15,0.1,0.4,0.3,0.1,0.1,0.45,0.45,0.1],
         "weights": [0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05],
         "top_k": 5,
         "platform": "facebook"
    }

Response example:
[
{ "id": "...", "name": "Alice FB", "score": 0.887 },
...
]

---
