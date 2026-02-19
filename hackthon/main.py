from fastapi import FastAPI
from models import StandupCreate, SearchQuery
from moss_service import insert_standup, search_memory

app = FastAPI(
    title="AI PM Dashboard Backend",
    description="Backend using Moss for semantic search",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "status": "running",
        "service": "AI PM Backend with Moss"
    }


# Insert standup into Moss
@app.post("/standups")
def create_standup(standup: StandupCreate):

    result = insert_standup(
        user=standup.user,
        yesterday=standup.yesterday,
        today=standup.today,
        blockers=standup.blockers
    )

    return {
        "status": "success",
        "message": "Standup stored",
        "moss_response": result
    }


# Search standups using Moss
@app.post("/search")
def search(query: SearchQuery):

    results = search_memory(
        query=query.query,
        top_k=query.top_k
    )

    return {
        "status": "success",
        "query": query.query,
        "results": results
    }
