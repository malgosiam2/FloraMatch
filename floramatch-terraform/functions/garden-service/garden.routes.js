const { plantsCollection } = require("../firestore");
const { getUserId } = require("../auth");

function send(res, code, body) {
  return res.status(code).json(body);
}

exports.handleGardenRoutes = async (req, res) => {
  console.log("🔥 REQUEST:", req.method, req.originalUrl);

  try {
    const path = req.path || req.originalUrl;
    const method = req.method;

    console.log("PATH:", path);

    let userId;

    try {
      userId = await getUserId(req);
      console.log("🔐 USER:", userId);
    } catch (e) {
      console.error("❌ AUTH ERROR:", e.message);

      return send(res, 401, {
        error: "Unauthorized",
        details: e.message
      });
    }

    const col = plantsCollection(userId);

    // GET ALL
    if (method === "GET" && path === "/garden/plants") {
      const snapshot = await col.get();

      return send(res, 200, snapshot.docs.map(d => ({
        plantInstanceId: d.id,
        ...d.data()
      })));
    }

    // -------------------------
    // GET ONE
    // -------------------------
    if (method === "GET" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();
      const doc = await col.doc(id).get();

      if (!doc.exists) {
        return send(res, 404, { error: "Plant not found" });
      }

      return send(res, 200, {
        plantInstanceId: doc.id,
        ...doc.data()
      });
    }

    // -------------------------
    // CREATE
    // -------------------------
    if (method === "POST" && path === "/garden/plants") {
      const body = req.body;

      console.log("🌱 CREATE BODY:", body);

      if (!body.plantId) {
        return send(res, 400, { error: "plantId required" });
      }

      const doc = await col.add({
        plantId: body.plantId,
        nickname: body.nickname || "",
        location: body.location || "",
        purchaseDate: body.purchaseDate || null,
        notes: body.notes || "",
        createdAt: new Date().toISOString()
      });

      return send(res, 201, {
        status: "success",
        plantInstanceId: doc.id
      });
    }

    // -------------------------
    // UPDATE
    // -------------------------
    if (method === "PUT" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();

      await col.doc(id).update({
        ...req.body,
        updatedAt: new Date().toISOString()
      });

      return send(res, 200, { status: "updated" });
    }

    // -------------------------
    // DELETE
    // -------------------------
    if (method === "DELETE" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();

      await col.doc(id).delete();

      return send(res, 200, { status: "deleted" });
    }

    return send(res, 404, { error: "Route not found" });

  } catch (e) {
    console.error("🔥 ERROR:", e);

    return send(res, 500, {
      error: "Internal error",
      details: e.message
    });
  }
};