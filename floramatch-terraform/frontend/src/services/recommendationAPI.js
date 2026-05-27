const API =
  "https://europe-central2-floramatch-497314.cloudfunctions.net/plant-recommendation-service";

export async function getRecommendations(filters) {

  const response = await fetch(
    `${API}/recommendations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(filters)
    }
  );

  if (!response.ok) {

    throw new Error(
      "Failed to fetch recommendations"
    );

  }

  return response.json();

}