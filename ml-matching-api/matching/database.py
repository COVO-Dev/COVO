from pymongo import MongoClient

class MongoDB:
    def __init__(self):
        self.client = MongoClient("mongodb+srv://covo:Covo123@covo.dyeab.mongodb.net/?retryWrites=true&w=majority&appName=Covo")
        self.db = self.client["metrics"]
        self.facebook = self.db["Facebook"]
        self.youtube = self.db["YouTube"]
        self.tiktok = self.db["TikTok"]

    def get_influencers(self, platform="facebook"):
        if platform == "facebook":
            return list(self.facebook.find({"vector": {"$exists": True}}))
        elif platform == "youtube":
            return list(self.youtube.find({"vector": {"$exists": True}}))
        elif platform == "tiktok":
            return list(self.tiktok.find({"vector": {"$exists": True}}))
        else:
            return []
