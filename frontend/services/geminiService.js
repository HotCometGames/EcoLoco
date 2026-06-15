const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function identifyPlant(imageData) {
  const res = await fetch(`${API_URL}/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData, location: "" , }),
  });
  return await res.json();
}

export async function getPlantRecommendations(location) {
  const res = await fetch(`${API_URL}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  });
  return await res.json();
}
