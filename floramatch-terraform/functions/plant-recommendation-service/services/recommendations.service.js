const { db } = require("../db/firebase");
const { VertexAI } = require("@google-cloud/vertexai");
const { getRedisClient } = require("../redis");

function getModel() {
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "floramatch-497314",
    location: "us-central1"
  });

  return vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: plantResponseSchema
    }
  });
}

function buildCacheKey(filters) {
  return [
    filters.location,
    filters.sunlight,
    filters.watering,
    filters.plantSize,
    filters.flowering
  ].join(":");
}

const plantResponseSchema = {
  type: "OBJECT",
  properties: {
    aiMessage: { type: "STRING" },
    plants: {
      type: "ARRAY",
      description: "Array of 1 to 3 plant recommendations",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          sunlight: { type: "STRING" },
          watering: { type: "STRING" },
          location: { type: "STRING" },
          plant_size: { type: "STRING" },
          flowering: { type: "BOOLEAN" },
          pet_friendly: { type: "BOOLEAN" },
          description: { type: "STRING" }
        },
        required: [
          "name",
          "sunlight",
          "watering",
          "location",
          "plant_size",
          "flowering",
          "pet_friendly",
          "description"
        ]
      },
      maxItems: 3
    }
  },
  required: ["aiMessage", "plants"]
};

async function saveAIGeneratedPlants(plants, fallbackFilters = null) {
  if (!plants || !Array.isArray(plants) || plants.length === 0) return;

  const plantsRef = db.collection("plants");

  for (const plant of plants) {
    plant.ai_generated = true;

    const plantId = plant.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    if (!plantId) continue;

    try {
      const docRef = plantsRef.doc(plantId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        let sunlight, watering, location, plant_size, flowering;

        if (fallbackFilters) {
          sunlight = String(fallbackFilters.sunlight).toLowerCase().trim();
          watering = String(fallbackFilters.watering).toLowerCase().trim();
          location = String(fallbackFilters.location).toLowerCase().trim();
          plant_size = String(fallbackFilters.plantSize).toLowerCase().trim();
          flowering = fallbackFilters.flowering === true || fallbackFilters.flowering === "yes";
        } else {
          const normalize = (val, allowed, fallback) => {
            const str = String(val || "").toLowerCase();
            for (const a of allowed) {
              if (str.includes(a)) return a;
            }
            return fallback;
          };

          sunlight = normalize(plant.sunlight, ["low", "medium", "high"], "medium");
          watering = normalize(plant.watering, ["low", "medium", "high"], "medium");
          location = normalize(plant.location, ["indoor", "balcony", "garden"], "indoor");
          plant_size = normalize(plant.plant_size, ["small", "medium", "large"], "medium");
          flowering = plant.flowering === true || String(plant.flowering).toLowerCase() === "yes" || String(plant.flowering).toLowerCase() === "true";
        }

        await docRef.set({
          name: plant.name.trim(),
          sunlight,
          watering,
          location,
          plant_size,
          flowering,
          pet_friendly: !!plant.pet_friendly,
          description: plant.description ? plant.description.trim() : "",
          ai_generated: true
        });
        
        console.log(`Successfully auto-saved new AI plant to database: ${plant.name}`);
      }
    } catch (saveErr) {
      console.error("Failed to auto-save AI plant to Firestore:", saveErr);
    }
  }
}

async function getAIFallbackRecommendation(filters) {
  const generativeModel = getModel();
  const prompt = `
You are a professional botanist and a customer service assistant. 
A customer searched for a plant with specific filters, but we have 0 matches in our local inventory database. 

Find between 1 and 3 alternative real plants that perfectly fit these criteria:
- Location: ${filters.location}
- Sunlight: ${filters.sunlight}
- Watering: ${filters.watering}
- Size: ${filters.plantSize}
- Flowering: ${filters.flowering ? "Yes" : "No"}

You MUST return a JSON object aligning exactly with the required schema:
1. In the "aiMessage" field, write a friendly, natural customer chat message in English explaining that while exact matches weren't found, you recommend these alternatives.
2. In the "plants" field, provide an array (1, 2, or 3 items max) of the structured objects containing the details of these plants.

All text must be in English.
`;

  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.candidates[0].content.parts[0].text);
}

async function getChatRecommendation(userPrompt, history = []) {
  const generativeModel = getModel();

  let historyText = "";
  if (history && history.length > 0) {
    historyText = "Here is the conversation history so far. Take it into account:\n" + 
      history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join("\n") + "\n";
  }

  const prompt = `
You are an expert plant assistant helping a user discover a plant through conversation.

${historyText}
Current User's request: "${userPrompt}"

CRITICAL RULE: Evaluate if the current user's request is related to plants, gardening, botany, nature, or terrariums. 
If the request is COMPLETELY UNRELATED to plants (e.g., asking for recipes, coding help, general knowledge, or math):
1. In the "aiMessage" field, politely decline to answer, remind the user that you are the FloraMatch plant assistant, and gently guide them back to asking about plants. Do not break the conversation context.
2. In the "plants" field, return an empty array: [].

If the request IS related to plants, or is a continuation/refinement of previous recommendations (e.g., "give me something else", "more options", "something smaller"):
Recommend between 1 and 3 real plants based on their preferences. If they asked for alternatives or something else, do NOT recommend the exact same plants listed in the history text above.
1. In the "aiMessage" field, write an engaging, helpful chat response directly addressing the user.
2. In the "plants" field, provide an array (1, 2, or 3 items max) of the structured attributes of those plants.

You MUST return a JSON object aligning exactly with the required schema. All text must be in English.
`;

  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  const aiData = JSON.parse(response.candidates[0].content.parts[0].text);

  if (aiData.plants) {
    await saveAIGeneratedPlants(aiData.plants, null);
  }

  return aiData;
}

async function getRecommendations(filters) {

  const redis = await getRedisClient();
  const cacheKey = buildCacheKey(filters);
  const cached = await redis.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT");

    return {
      source: "cache",
       ...JSON.parse(cached)
    };
  }

  console.log("CACHE MISS");


  try {
    const plantsRef = db.collection("plants");
    const isFlowering = filters.flowering === true || filters.flowering === "yes";

    const snapshot = await plantsRef
      .where("location", "==", filters.location)
      .where("sunlight", "==", filters.sunlight)
      .where("watering", "==", filters.watering)
      .where("plant_size", "==", filters.plantSize)
      .where("flowering", "==", isFlowering)
      .limit(3)
      .get();

    const rows = [];
    snapshot.forEach(doc => {
      rows.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (rows.length > 0) {

      const result = {
        source: "database",
        aiMessage: null,
        recommendations: rows
      };

      await redis.set(
        cacheKey,
        JSON.stringify(result),
        {
          EX: 3600
        }
      );

      return result;
    }

    const aiData = await getAIFallbackRecommendation(filters);

    if (aiData.plants) {
      await saveAIGeneratedPlants(aiData.plants, filters);
    }

    const result = {
      source: "ai_fallback",
      aiMessage: aiData.aiMessage,
      recommendations: aiData.plants || []
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      {
        EX: 3600
      }
    );

    return result;

  } catch (err) {
    console.error("Firestore / Vertex AI failed:", err);
    return {
      source: "database",
      aiMessage: "No plants found and AI is unavailable.",
      recommendations: []
    };
  }
}

module.exports = {
  getRecommendations,
  getChatRecommendation
};