from pydantic import BaseModel
from typing import Optional, List

class StandupCreate(BaseModel):
    user: str
    yesterday: str
    today: str
    blockers: Optional[str] = ""

class SearchQuery(BaseModel):
    query: str
    top_k: Optional[int] = 5

class MossResult(BaseModel):
    text: str
    metadata: Optional[dict] = {}

class SearchResponse(BaseModel):
    results: List[MossResult]
