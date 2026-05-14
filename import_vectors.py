import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient

# Database connection details
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "qiti"  # Change this if your database has a different name in Compass

async def import_data():
    print("Loading data from ananya_data.json...")
    
    # 1. Read the raw data
    try:
        with open("ananya_data.json", "r") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: ananya_data.json not found. Make sure it is in the same folder.")
        return
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON. Check ananya_data.json for missing commas or brackets.")
        return

    # 2. Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    collection = client[DB_NAME]["truth_vectors"]
    
    # 3. Format the data into MongoDB documents
    formatted_documents = []
    for node_id, vector in raw_data.items():
        formatted_documents.append({
            "node_id": node_id,
            "vector": vector
        })
    
    # 4. Inject into the database
    if formatted_documents:
        print(f"Found {len(formatted_documents)} nodes. Clearing old data and inserting...")
        await collection.delete_many({}) 
        await collection.insert_many(formatted_documents)
        print("✅ Success! Database populated.")
    else:
        print("No data found to import.")

    client.close()

if __name__ == "__main__":
    asyncio.run(import_data())