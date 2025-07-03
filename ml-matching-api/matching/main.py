from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from .database import MongoDB
from .algorithm import weighted_cosine_similarity

app = FastAPI()
db = MongoDB()

class MatchRequest(BaseModel):
    target_vector: List[float]
    weights: List[float]
    top_k: int = 5
    platform: Optional[str] = "facebook"

@app.post("/match")
def match_influencers(request: MatchRequest):
    influencers = db.get_influencers(platform=request.platform)

    if len(request.target_vector) != len(request.weights):
        raise HTTPException(status_code=400, detail="Vector and weight lengths must match.")

    scored = []
    for inf in influencers:
        try:
            vec = np.array(inf["vector"])
            score = weighted_cosine_similarity(
                np.array(request.target_vector), vec, np.array(request.weights))
            scored.append({
                "id": str(inf["_id"]),
                "name": inf.get("name", "Unknown"),
                "score": round(score, 4)
            })
        except Exception as e:
            continue

    top_matches = sorted(scored, key=lambda x: x["score"], reverse=True)[:request.top_k]
    return top_matches
