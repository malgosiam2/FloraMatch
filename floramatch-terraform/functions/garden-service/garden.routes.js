const { plantsCollection } = require("./firestore");
const { getUserId } = require("./auth");

function send(res, code, body) {
  res.status(code).json(body);
}

exports.handleGardenRoutes = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const col = plantsCollection(userId);
    const path = req.path;
    const method = req.method;

    if (method === "GET" && path === "/garden/plants") {
      const snapshot = await col.get();
      const plants = snapshot.docs.map(d => ({
        plantInstanceId: d.id,
        ...d.data()
      }));
      return send(res, 200, plants);
    }

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
        message: "Plant added to garden",
        plantInstanceId: doc.id
      });
    }

    if (method === "PUT" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();
      const docRef = col.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return send(res, 404, { error: "Plant not found" });
      }

      await docRef.update({
        ...req.body,
        updatedAt: new Date().toISOString()
      });

      return send(res, 200, { 
        status: "success", 
        message: "Plant updated successfully" 
      });
    }

    if (method === "DELETE" && path.startsWith("/garden/plants/")) {
      const id = path.split("/").pop();
      const docRef = col.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return send(res, 404, { error: "Plant not found" });
      }

      await docRef.delete();
      return send(res, 200, { 
        status: "success", 
        message: "Plant removed from garden" 
      });
    }

    return send(res, 404, { error: "Not Found" });

  } catch (e) {
    return send(res, 401, { error: e.message });
  }
};













