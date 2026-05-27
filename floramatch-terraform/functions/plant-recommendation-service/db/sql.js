const { Connector } = require("@google-cloud/cloud-sql-connector");
const { Pool } = require("pg");

const connector = new Connector();

let pool;


async function getPool() {
  if (pool) return pool;
  if (!process.env.DB_CONNECTION_NAME) {
    throw new Error("Missing DB_CONNECTION_NAME env var");
  }

  const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.DB_CONNECTION_NAME,
    ipType: "PUBLIC",
  });

  pool = new Pool({
    ...clientOpts,
    user: "plants_user",
    password: process.env.DB_PASSWORD,
    database: "plants",
  });

  return pool;
}

module.exports = { getPool };