import google.generativeai as genai
from dotenv import load_dotenv
from services.inat_service import get_plant_requests
import os

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def identify_plant(image_data):
    """
    Takes image data and returns an identified plant name.

    :param image_data: Image file or base64 encoded image, possible string
    :call inat get_plant_requests to see if its native, and then once it is confirmed native ask gemini for possible actions w impact
    :return: Identified plant name, native or not, confidence info, and possible actions w impact
    """
    pass


def get_plant_recommendations(location: str):
    """
    Takes a location and returns AI generated native plant recommendations.

    :param location: Location string (city, region, etc.)
    :return: A problem, an action, and the impact
    """
    pass

