import { auth } from "./firebase";

//const API = "https://europe-central2-floramatch-497314.cloudfunctions.net/garden-service";
const API = "https://floramatch-gateway-4rnl9enj.ew.gateway.dev"

async function getAuthToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  return await user.getIdToken();
}

export async function getPlants() {
  const token = await getAuthToken();
  console.log("USER:", auth.currentUser);
  console.log("PROVIDER:", auth.currentUser?.providerData);
  const response = await fetch(`${API}/garden/plants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

export async function addPlant(plant) {
  const token = await getAuthToken();
  const response = await fetch(`${API}/garden/plants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(plant)
  });
  return response.json();
}

export async function updatePlant(plantInstanceId, plantData) {
  const token = await getAuthToken();
  const response = await fetch(`${API}/garden/plants/${plantInstanceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(plantData)
  });
  return response.json();
}

export async function deletePlant(plantInstanceId) {
  const token = await getAuthToken();
  const response = await fetch(`${API}/garden/plants/${plantInstanceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}