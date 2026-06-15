import requests
from dotenv import load_dotenv
import os

load_dotenv()

INAT_BASE_URL = "https://api.inaturalist.org/v1"


def get_plant_location(plant_name: str):
    """
    Takes a plant name and returns its known location(s).
    
    :param plant_name: Common or scientific name of the plant
    :return: Location data for the plant
    """
    pass


def get_plants_by_location(location: str):
    """
    Takes a location and returns a list of native plants found there.
    
    :param location: Location string (city, region, coordinates, etc.)
    :return: List of plant names found at that location
    """
    pass