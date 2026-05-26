const { getPool } = require("../db/sql");

async function getRecommendations() {
  const pool = await getPool();

  const result = await pool.query(`
    SELECT *
    FROM plants
    LIMIT 3
  `);

  return result.rows;
}

module.exports = {
  getRecommendations,
};