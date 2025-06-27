import pandas as pd
from pymongo import MongoClient

# 1. Load your CSV
df = pd.read_csv("facebook_influencer_data.csv")

# 2. Build the 19-element vector from each row
def row_to_vector(row):
    return [
        row.page_views,
        row.reach,
        row.impressions,
        row.likes,
        row.comments,
        row.shares,
        row.engagement,
        row.ctr,
        row.conversion_rate,
        row.audience_growth_rate,
        row.top_posts,
        row.age_18_24,
        row.age_25_34,
        row.age_35_44,
        row.age_45_54,
        row.age_55_64,
        row.gender_male,
        row.gender_female,
        row.gender_non_binary
    ]

df["vector"] = df.apply(row_to_vector, axis=1)

# 3. Connect to MongoDB
client = MongoClient("mongodb+srv://covo:Covo123@covo.dyeab.mongodb.net/?retryWrites=true&w=majority&appName=Covo")
fb = client["metrics"]["Facebook"]

# 4. Clear out old FB docs, then insert yours
fb.delete_many({})
records = []
for _, r in df.iterrows():
    records.append({
        "influencer_id": int(r.influencer_id),
        "name": r.influencer_name,
        "vector": r.vector
    })

fb.insert_many(records)
print(f"Inserted {len(records)} Facebook influencer vectors.")
