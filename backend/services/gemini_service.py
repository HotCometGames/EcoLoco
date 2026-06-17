import json
from openai import OpenAI
from dotenv import load_dotenv
from services.inat_service import get_plant_requests
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def identify_plant(image_data, location):
    identify_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "Identify the plant in this image. Respond only in JSON with no markdown, no backticks. Format: {\"plant_name\": \"...\", \"confidence\": 0.0}"
                    }
                ]
            }
        ]
    )

    identify_data = json.loads(identify_response.choices[0].message.content)
    plant_name = identify_data["plant_name"]
    confidence = identify_data["confidence"]

    is_native = True

    actions = []
    if is_native:
        actions_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": f"The plant '{plant_name}' is native to {location}. Give 2 specific, practical actions a person can take involving planting or caring for this or companion plants to benefit the local ecosystem. Each action should name a specific plant or technique and explain the direct environmental benefit in one sentence. Respond only in JSON with no markdown, no backticks. Format: [{{\"action\": \"...\", \"impact\": \"...\"}}]"
                }
            ]
        )
        actions = json.loads(actions_response.choices[0].message.content)

    return {
        "plant_name": plant_name,
        "is_native": is_native,
        "confidence": confidence,
        "actions": actions
    }


def get_plant_recommendations(location: str):
    """
    Takes a location and returns AI generated native plant recommendations.

    :param location: Location string (city, region, etc.)
    :return: A problem, an action, and the impact
    """
    pass

