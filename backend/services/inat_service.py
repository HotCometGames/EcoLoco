import requests
import os

def get_plant_requests(species_name, limit=100):
    # fetches coordinates of given plant species from iNaturalist

    url = "https://api.inaturalist.org/v2/observations"

    fields_requested = {

        "location" : True,
        "place_guess" : True,
        "observed_on_string" : True
    }

    params = {
        "q": species_name,
        "iconic_taxa": "Plantae",
        "has[]": "geo",
        "per_page": limit,
        "order": "desc",
        "order_by": "created_at",
        "fields": fields_requested  # pass specific fields needed
    }

    headers = {
        "User-Agent": "EcoLoco/1.0 (jhabhaskar1205@gmail.com)"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        locations = []
        for obs in data.get("results", []):
            if obs.get("location"):
                lat, lng = map(float, obs["location"].split(","))
                locations.append({
                    "latitude": lat,
                    "longitude": lng,
                    "observed_on": obs.get("observed_on_string"),
                    "place_guess": obs.get("place_guess")
                })
                
        return locations

    except requests.exceptions.RequestException as e:
        print(f"error fetching data from iNaturalist: {e}")
        return []
