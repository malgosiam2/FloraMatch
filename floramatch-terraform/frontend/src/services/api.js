export async function getPlants(user) {
  const token = await user.getIdToken();

  const res = await fetch(
    "https://europe-central2-floramatch-497314.cloudfunctions.net/garden-service/garden/plants",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.json();
}