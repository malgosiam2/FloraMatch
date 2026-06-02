import { auth } from "./firebase";

//const API = "https://europe-central2-floramatch-497314.cloudfunctions.net/plant-recommendation-service";
const API = "https://floramatch-gateway-4rnl9enj.ew.gateway.dev"

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return await user.getIdToken();
}


export async function getRecommendations(filters) {
    const token = await getAuthToken();
  try {
    const response = await fetch(`${API}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ filters }) 
    });

    if (!response.ok) {
      throw new Error("Unable to use chat right now. Please try again later. 🪴");
    }
    return await response.json();
  } catch (error) {
    throw new Error("Unable to use chat right now. Please try again later. 🪴");
  }
}

export async function getChatRecommendation(prompt, history = []) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${API}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, history }) // Wysyłamy prompt oraz historię
    });

    if (!response.ok) {
      throw new Error("Unable to use chat right now. Please try again later. 🪴");
    }
    return await response.json();
  } catch (error) {
    throw new Error("Unable to use chat right now. Please try again later. 🪴");
  }
}