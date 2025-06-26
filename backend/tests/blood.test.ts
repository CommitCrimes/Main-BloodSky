import { test, expect } from "bun:test";

// Utilitaire pour effectuer des requêtes
function request(method: string, path: string, body?: any) {
  // S'assure qu'il n'y a qu'un seul slash entre base et path
  const fullPath = `/api/blood${path}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/');
  return fetch(`http://localhost:3000${fullPath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test("CRUD blood sample (with GET by type and deliveryId if available)", async () => {
  // 1. Récupérer tous les blood samples pour déterminer l'ID max
  console.log("[TEST] GET all blood samples");
  const resAll = await request("GET", "/");
  const all = await resAll.json();
  const maxId = all.reduce(
    (max: number, b: any) => Math.max(max, b.bloodId),
    0
  );
  const bloodId = maxId + 1;

  // 2. Chercher un deliveryId utilisable (non null)
  const deliveryId = all.find((b: any) => b.deliveryId != null)?.deliveryId;

  if (!deliveryId) {
    console.warn("[TEST] GET by deliveryID skipped: no deliveryId found in DB");
  }

  // 3. POST: Créer un nouveau blood sample sans deliveryId
  console.log("[TEST] POST create new blood sample");
  const bloodData = {
    bloodId,
    bloodType: "A+",
    deliveryId: null,
  };

  const resCreate = await request("POST", "/", bloodData);
  expect(resCreate.status).toBe(201);

  // 4. GET by ID
  console.log("[TEST] GET blood sample by ID");
  const resGet = await request("GET", `/${bloodId}`);
  expect(resGet.status).toBe(200);
  const fetched = await resGet.json();
  expect(fetched.bloodType).toBe("A+");

  // 5. PUT update: ajouter un deliveryId s’il y en a un
  if (deliveryId) {
    console.log("[TEST] PUT update blood sample with deliveryId");
    const updatedData = { ...bloodData, deliveryId };
    const resUpdate = await request("PUT", `/${bloodId}`, updatedData);
    expect(resUpdate.status).toBe(200);

    // 6. GET by deliveryId
    console.log("[TEST] GET blood samples by deliveryId");
    const resByDelivery = await request("GET", `/delivery/${deliveryId}`);
    expect(resByDelivery.status).toBe(200);
    const deliveryList = await resByDelivery.json();
    const match = deliveryList.find((b: any) => b.bloodId === bloodId);
    expect(match).toBeDefined();
  } else {
    console.warn(
      "[TEST] Skipping PUT and GET /delivery/:id because no deliveryId is available"
    );
  }

  // 7. GET by blood type
  console.log("[TEST] GET blood samples by blood type");
  const resByType = await request("GET", `/type/A+`);
  expect(resByType.status).toBe(200);
  const typeList = await resByType.json();
  const typeMatch = typeList.find((b: any) => b.bloodId === bloodId);
  expect(typeMatch).toBeDefined();

  // 8. DELETE
  console.log("[TEST] DELETE blood sample");
  const resDelete = await request("DELETE", `/${bloodId}`);
  expect(resDelete.status).toBe(200);

  // 9. GET après suppression
  console.log("[TEST] GET blood sample after deletion (should be 404)");
  const resAfterDelete = await request("GET", `/${bloodId}`);
  expect(resAfterDelete.status).toBe(404);
});
