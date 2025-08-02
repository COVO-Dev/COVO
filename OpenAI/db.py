from pymongo import MongoClient
from config import settings

# conect to MongoDB
def connect_to_mongodb():
    client = MongoClient(settings.mongodb_uri)
    
    # list all databases
    databases = client.list_database_names()
    print("Databases:", databases)
    
    # List all collections in the 'main' database
    db = client['main']
    collections = db.list_collection_names()
    print("Collections in 'main' database:", collections)
    
    # list all collections users only with role Influencer in main
    influencers = db['users'].find({"role": "Influencer"})
    print("Influencers:")
    for influencer in influencers:
        # print the influencer's username and role with readable formatting
        print(f"Username: {influencer['username']}, Role: {influencer['role']}")
        
    brand = db['users'].find({"role": "Brand"})
    print("Brands:")
    for b in brand:
        # print the brand's username and role with readable formatting
        print(f"companyName: {b['companyName']}, Role: {b['role']}")
    return client

# Example usage
if __name__ == "__main__":
    connect_to_mongodb()