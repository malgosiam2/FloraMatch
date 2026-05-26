const API =
  import.meta.env.VITE_API_URL;

export async function getRecommendations(prompt) {

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