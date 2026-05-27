const { getPool } = require("../db/sql");

async function getRecommendations(filters) {

  const pool = await getPool();

  const query = `
    SELECT *
    FROM plants
    WHERE location = $1
      AND sunlight = $2
      AND watering = $3
      AND plant_size = $4
      AND flowering = $5
    LIMIT 3
  `;

  const values = [
    filters.location,
    filters.sunlight,
    filters.watering,
    filters.plantSize,
    filters.flowering
  ];

  const result =
    await pool.query(query, values);

  return result.rows;
}

module.exports = {
  getRecommendations
};