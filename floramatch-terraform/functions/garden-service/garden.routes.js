const { plantsCollection } = require("../firestore");
const { getUserId } = require("../auth");

function send(res, code, body) {
  res.status(code).json(body);
}

exports.handleGardenRoutes = async (req, res) => {
  const userId = await getUserId(req);
  const col = plantsCollection(userId);

  try {
    const path = req.path;
    const method = req.method;

    // GET ALL
    if (method === "GET" && path === "/garden/plants") {
      const snapshot = await col.get();

      return send(res, 200,
        snapshot.docs.map(d => ({
          plantInstanceId: d.id,
          ...d.data()
        }))
      );
    }

    // GET ONE
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

    // CREATE
    if (method === "POST" && path === "/garden/plants") {
      const body = req.body;

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

    // UPDATE
    if (method === "PUT" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();

      await col.doc(id).update({
        ...req.body,
        updatedAt: new Date().toISOString()
      });

      return send(res, 200, { status: "updated" });
    }

    // DELETE
    if (method === "DELETE" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();

      await col.doc(id).delete();

      return send(res, 200, { status: "deleted" });
    }

    return send(res, 404, { error: "Route not found" });

  } catch (e) {
    console.error(e);
    return send(res, 500, { error: "Internal error" });
  }
};