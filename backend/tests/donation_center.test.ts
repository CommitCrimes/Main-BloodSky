import { test, expect } from "bun:test";

// Utilitaire pour effectuer des requêtes basiques
function request(method: string, route:string, path: string, body?: any) {
  // S'assure qu'il n'y a qu'un seul slash entre base et path
  const fullPath = `/api/${route}${path}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/');
  return fetch(`http://localhost:3000${fullPath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test("CRUD donation center", async () => {
    // 1. Récupérer tous les centres de don pour déterminer l'ID max
    console.log("[TEST] GET all donation centers");
    const resAll = await request("GET", "donation-centers", "/");
    const all = await resAll.json();
    const maxId = all.reduce(
      (max: number, c: any) => Math.max(max, c.centerId),
      0
    );
    const centerId = maxId + 1;

    // 2. POST: Créer un nouveau centre de don
    console.log("[TEST] POST create new donation center");
    const centerData = {
      centerId,
      centerCity: "Test Center",
      centerPostal: 12345,
      centerAdress: "123 Saint Test",
      centerLatitude: null,
      centerLongitude: null
    };
    const resCreate = await request("POST", "donation-centers", "/", centerData);
    expect(resCreate.status).toBe(201);
    console.log("[TEST] Created donation center with ID:", centerId);

    // 3. GET: Récupérer le centre de don par ID
    console.log("[TEST] GET donation center by ID");
    const resGet = await request("GET", "donation-centers", `/${centerId}`);
    expect(resGet.status).toBe(200);
    const fetched = await resGet.json();
    expect(fetched.centerCity).toBe("Test Center");

    // 4. PUT: Mettre à jour le centre de don
    console.log("[TEST] PUT update donation center");
    const updatedCenterData = {
      centerId,
      centerCity: "Updated Center",
      centerPostal: 54321,
      centerAdress: "321 Updated St",
      centerLatitude: null,
      centerLongitude: null
    };
    const resUpdate = await request("PUT", "donation-centers", `/${centerId}`, updatedCenterData);
    expect(resUpdate.status).toBe(200);

    // 5. GET: Vérifier la mise à jour du centre de don en le récupérant par code postal
    console.log("[TEST] GET donation center by postal code");
    const resByPostal = await request("GET", "donation-centers", `/postal/${updatedCenterData.centerPostal}`);
    expect(resByPostal.status).toBe(200);
    const centersByPostal = await resByPostal.json();
    expect(centersByPostal.length).toBeGreaterThan(0);
    const centerMatch = centersByPostal.find((c: any) => c.centerId === centerId);
    expect(centerMatch).toBeDefined();

    // 5. DELETE: Supprimer le centre de don
    console.log("[TEST] DELETE donation center");
    const resDelete = await request("DELETE", "donation-centers", `/${centerId}`);
    expect(resDelete.status).toBe(200);

    console.log("[TEST] CRUD donation center test completed successfully");
});