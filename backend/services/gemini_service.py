import json
import math
import requests
from openai import OpenAI
from dotenv import load_dotenv
from services.inat_service import get_plant_requests
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _haversine_miles(lat1, lng1, lat2, lng2):
    R = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


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

    # ── iNaturalist cross-check ────────────────────────────────────────────
    inat_note = None
    try:
        geo_resp = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"postalcode": location, "country": "US", "format": "json", "limit": 1},
            headers={"User-Agent": "EcoLoco/1.0 (jhabhaskar1205@gmail.com)"},
            timeout=5,
        )
        geo_data = geo_resp.json()
        if geo_data:
            user_lat = float(geo_data[0]["lat"])
            user_lng = float(geo_data[0]["lon"])
            observations = get_plant_requests(plant_name)
            nearby = sum(
                1 for obs in observations
                if _haversine_miles(user_lat, user_lng, obs["latitude"], obs["longitude"]) <= 200
            )
            if nearby >= 10:
                pass  # sufficient local data — keep GPT confidence as-is
            elif nearby >= 1:
                confidence = max(0.0, round(confidence - 0.1, 2))
            else:
                confidence = max(0.0, round(confidence - 0.2, 2))
                inat_note = "Rarely observed in your region — verify before acting"
    except Exception:
        pass  # iNat check failed — keep original confidence unchanged

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
        "inat_note": inat_note,
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


def generate_letter(plant_names: list, score: int, zip_code: str):
    # Format plant list naturally
    if len(plant_names) == 1:
        plant_list  = plant_names[0]
        adding_word = "Adding it"
    elif len(plant_names) == 2:
        plant_list  = f"{plant_names[0]} and {plant_names[1]}"
        adding_word = "Adding them"
    else:
        plant_list  = ", ".join(plant_names[:-1]) + f", and {plant_names[-1]}"
        adding_word = "Adding them"

    # GPT generates only the benefit sentence(s)
    benefit_response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[{
            "role": "user",
            "content": (
                f"Write 1–2 sentences explaining why the following native plant(s) "
                f"help local wildlife in ZIP code {zip_code}: {plant_list}. "
                "Be specific — mention pollinators, birds, or insects they support. "
                "Return only the sentences, no preamble or trailing text."
            )
        }]
    )
    benefit = benefit_response.choices[0].message.content.strip()

    letter = (
        f"Dear [PRINCIPAL_NAME],\n\n"
        f"The [SCHOOL_NAME] eco-club has been studying the plants growing around our campus, "
        f"and we'd like to propose a change that could make a real difference for local wildlife.\n\n"
        f"Right now, much of our schoolyard is planted with species that do very little for the "
        f"insects, birds, and pollinators that depend on this area. We audited our grounds and our "
        f"campus scored {score} out of 100 on biodiversity, a measure of how well our plants "
        f"actually support native wildlife. We think we can do better, and it starts with a few changes.\n\n"
        f"We're requesting permission to add the following native species, well suited to our region "
        f"(ZIP {zip_code}): {plant_list}. {benefit} "
        f"{adding_word} would raise our biodiversity score and create real, living habitat that "
        f"students can watch grow and learn from all year.\n\n"
        f"We researched this using EcoLoco, a tool that identifies plants and ranks them by how much "
        f"they help the local ecosystem. We'd be glad to share our full audit and find a time to talk "
        f"through next steps.\n\n"
        f"Thank you for considering this. A small change to our campus could leave a lasting mark "
        f"on the wildlife around it.\n\n"
        f"Sincerely,\n\n"
        f"[STUDENT_NAME]\n\n"
        f"[SCHOOL_NAME] Eco-Club"
    )

    return letter