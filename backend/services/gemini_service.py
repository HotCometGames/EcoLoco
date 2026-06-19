import json
from openai import OpenAI
from dotenv import load_dotenv
from services.inat_service import get_plant_requests
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def identify_plant(image_data, location):
    # determine how to format the image data 
    if image_data.startswith(("http://", "https://")):
        formatted_url = image_data
    elif image_data.startswith("data:image"):
        formatted_url = image_data
    else:
        formatted_url = f"data:image/jpeg;base64,{image_data}"

    # identify plant and get all status information
    identify_response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": formatted_url
                        }
                    },
                    {
                        "type": "text",
                        "text": f"""Identify the plant in this image. The location is zip code {location}. 

determine:
1. plant name (common name)
2. scientific name
3. confidence in the identification as a float between 0.0 and 1.0. Be genuinely calibrated:
   - Use 0.90–0.99 only if the plant is clearly visible, unambiguous, and you are highly certain
   - Use 0.70–0.89 if the image is clear but the species could plausibly be one of a few similar plants
   - Use 0.50–0.69 if the image is partially obscured, low quality, or the plant is hard to distinguish from similar species
   - Use 0.30–0.49 if you are mostly guessing based on limited visual information
   - Use below 0.30 if you cannot reliably identify the plant
   Do NOT default to round numbers like 0.9. Express your actual uncertainty with two decimal places (e.g. 0.83, 0.61, 0.47).
4. is it native to the area with zip code {location}? (t/f)
5. status in this area: "invasive", "non-native", or "native"
6. conservation status: "not_threatened", "threatened", "endangered", "critically_endangered", or "unknown"
7. wildlife support level: "high", "medium", or "low"
   - high: Supports many pollinators, birds, or beneficial insects; provides food/habitat, etc. (other qualities may be a part of this list as well)
   - medium: Supports some wildlife but not a keystone species
   - low: Minimal wildlife value, ornamental only, or actively harmful

respond only in JSON
 {{
  "plant_name": "...",
  "scientific_name": "...",
  "confidence": 0.00,
  "is_native": true/false,
  "invasive_status": "invasive/non-native/native",
  "endangered_status": "not_threatened/threatened/endangered/critically_endangered/unknown",
  "wildlife_support": "high/medium/low",
  "wildlife_support_reason": "Brief explanation of wildlife value"
}}"""
                    }
                ]
            }
        ]
    )

    # parse the identification data
    raw_content = identify_response.choices[0].message.content.strip()
    if raw_content.startswith("```json"):
        raw_content = raw_content[7:-3].strip()
        
    identify_data = json.loads(raw_content)
    
    plant_name = identify_data["plant_name"]
    scientific_name = identify_data.get("scientific_name", "")
    confidence = identify_data["confidence"]
    is_native = identify_data["is_native"]
    invasive_status = identify_data["invasive_status"]
    endangered_status = identify_data["endangered_status"]
    wildlife_support = identify_data["wildlife_support"]
    wildlife_support_reason = identify_data.get("wildlife_support_reason", "")

    # get climate actions based on plant status
    actions = []
    
    if invasive_status == "invasive":
        # for invasive plants, provide removal/management actions
        actions = [
            {
                "action": "Do not plant or propagate this species",
                "impact": "Prevents further spread of invasive species that can harm native ecosystems and reduce biodiversity"
            },
            {
                "action": f"Consider removing this plant and replacing with native alternatives for {location}",
                "impact": "Supports local biodiversity, provides better wildlife habitat, and strengthens ecosystem resilience"
            }
        ]
    else:
        # for native or non-invasive plants, get beneficial climate actions
        actions_response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": f"""The plant '{plant_name}' ({invasive_status}) is found in zip code {location}. 
                    It has {wildlife_support} wildlife support value.
                    
                    Give 2 specific, practical actions a person can take involving planting or caring for this or companion plants to benefit the local ecosystem and support biodiversity. 
                    
                    Each action should:
                    - Name a specific plant or technique
                    - Explain the direct environmental benefit in one sentence
                    - Consider the plant's wildlife support level
                    
                    Respond only in JSON with no markdown, no backticks. 
                    Format: [{{\"action\": \"...\", \"impact\": \"...\"}}]"""
                }
            ]
        )
        
        raw_actions = actions_response.choices[0].message.content.strip()
        if raw_actions.startswith("```json"):
            raw_actions = raw_actions[7:-3].strip()
            
        actions = json.loads(raw_actions)

    return {
        "plant_name": plant_name,
        "scientific_name": scientific_name,
        "is_native": is_native,
        "invasive_status": invasive_status,
        "endangered_status": endangered_status,
        "wildlife_support": wildlife_support,
        "wildlife_support_reason": wildlife_support_reason,
        "confidence": confidence,
        "actions": actions
    }


def get_plant_recommendations(location: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"""For ZIP code {location}, return a JSON array of 11 native plants ranked from highest to lowest ecological impact.

wildlife_support values:
- "high": keystone or near-keystone — strong pollinator, bird, or insect support
- "medium": supports some local wildlife but not a primary habitat plant
- "low": modest benefit, mainly soil or water improvement

The FIRST 3 entries are your top recommendations — full detail:
{{
  "plant_name": "common name",
  "scientific_name": "scientific name",
  "wildlife_support": "high/medium/low",
  "problem": "one sentence — the specific local issue this plant addresses",
  "action": "one actionable planting step — mention plant_name explicitly",
  "impact": "direct ecological benefit — mention plant_name explicitly"
}}

Entries 4–11 are additional high-impact natives — compact format:
{{
  "plant_name": "common name",
  "scientific_name": "scientific name",
  "wildlife_support": "high/medium/low",
  "benefit": "one sentence describing the key ecological benefit"
}}

Rank all 11 highest wildlife_support first. No markdown, no backticks, return only the JSON array."""
            }
        ]
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```json"):
        raw = raw[7:-3].strip()
    elif raw.startswith("```"):
        raw = raw[3:-3].strip()

    return json.loads(raw)