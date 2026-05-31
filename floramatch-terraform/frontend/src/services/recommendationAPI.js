const API = "https://europe-central2-floramatch-497314.cloudfunctions.net/plant-recommendation-service";

export async function getRecommendations(filters) {
  try {
    const response = await fetch(`${API}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
  try {
    const response = await fetch(`${API}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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