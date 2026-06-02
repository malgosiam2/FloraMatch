// redis.js

const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

client.on("error", err => {
  console.error("Redis error:", err);
});

let connected = false;

async function getRedisClient() {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  return client;
}

module.exports = {
  getRedisClient
};