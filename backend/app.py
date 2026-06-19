from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from services.gemini_service import identify_plant, get_plant_recommendations
from services.inat_service import get_plant_requests #get_local_plants

load_dotenv()

app = Flask(__name__)
CORS(app)

'''
@app.route("/get_local_plants_endpoints", methods=["POST"])
def get_local_plants_endpoint():
    data = request.get_json()
    location = data.get("location")

    if not location:
        return jsonify({"error": "location is required"}), 400

    result = get_local_plants(location)
    return jsonify({"result": result})
    '''


@app.route("/identify", methods=["POST"])
def identify():
    data = request.get_json()
    image = data.get("image")
    location = data.get("location")

    if not location:
        return jsonify({"error": "image and location are required"}), 400

    result = identify_plant(image, location)
    return jsonify({"result": result})


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    location = data.get("location")

    if not location:
        return jsonify({"error": "location is required"}), 400

    result = result = get_plant_recommendations(location)
    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')