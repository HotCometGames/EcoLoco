const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getLocalPlants(location) {
  const res = await fetch(`${API_URL}/get_local_plants_endpoints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  });
  return await res.json();
}