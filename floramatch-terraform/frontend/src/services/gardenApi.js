import { auth } from "./firebase";

const API =
  "https://europe-central2-floramatch-497314.cloudfunctions.net/garden-service";

export async function getPlants() {

  const token = await auth.currentUser.getIdToken();

  const response = await fetch(
    `${API}/garden/plants`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.json();
}

export async function addPlant(plant) {

  const token = await auth.currentUser.getIdToken();

  const response = await fetch(
    `${API}/garden/plants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(plant)
    }
  );

  return response.json();
}