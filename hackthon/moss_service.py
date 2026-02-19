import os
from moss import MossClient
from dotenv import load_dotenv

load_dotenv()

MOSS_API_KEY = os.getenv("MOSS_API_KEY")

moss_client = MossClient(
    api_key=MOSS_API_KEY
)

def insert_standup(user, yesterday, today, blockers):

    content = f"""
User: {user}

Yesterday:
{yesterday}

Today:
{today}

Blockers:
{blockers}
"""

    response = moss_client.insert({
        "text": content,
        "metadata": {
            "user": user,
            "type": "standup"
        }
    })

    return response


def search_memory(query, top_k=5):

    response = moss_client.search(
        query=query,
        top_k=top_k
    )

    return response["results"]
