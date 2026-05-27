import { auth } from "./firebase";

const API =   "https://europe-central2-floramatch-497314.cloudfunctions.net/plant-recommendation-service";

export async function getRecommendations(prompt) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  const response = await fetch(
    `${API}/recommendations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt
      })
    }
  );

  if (!response.ok) {

    throw new Error(
      "Failed to fetch recommendations"
    );

  }

  return response.json();

}