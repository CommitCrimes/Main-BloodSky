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

test("CRUD drone", async () => {
    // 1. GET all drones to determine max ID
    console.log("[TEST] GET all drones");
    const resAll = await request("GET", "drones", "/");
    const all = await resAll.json();
    const maxId = all.reduce(
      (max: number, d: any) => Math.max(max, d.droneId),
      0
    );
    const droneId = maxId + 1;

    // 2. GET all donation centers to determine max center ID
    console.log("[TEST] GET all donation centers");
    const resCenters = await request("GET", "donation-centers", "/");
    const centers = await resCenters.json();
    const maxCenterId = centers.reduce(
      (max: number, c: any) => Math.max(max, c.centerId),
      0
    );
    const centerId = maxCenterId + 1;

    // 3. POST: Create a new donation center
    console.log("[TEST] POST create new donation center");
    const centerData = {
        centerId,
        centerCity: "Test Center",
        centerPostal: 12345,
        centerAdress: "123 Saint Test",
        centerLatitude: null,
        centerLongitude: null
    };
    const resCreateCenter = await request("POST", "donation-centers", "/", centerData);
    expect(resCreateCenter.status).toBe(201);
    console.log("[TEST] Created donation center with ID:", centerId);

    // 4. POST: Create a new drone
    console.log("[TEST] POST create new drone");
    const droneData = {
        droneId,
        droneName: "Test Drone",
        centerId: centerId,
        droneImage: null,
        droneStatus: null
    };
    const resCreate = await request("POST", "drones", "/", droneData);
    expect(resCreate.status).toBe(201);
    console.log("[TEST] Created drone with ID:", droneId);

    // 5. GET: Retrieve the drone by ID
    console.log("[TEST] GET drone by ID");
    const resGet = await request("GET", "drones", `/${droneId}`);
    expect(resGet.status).toBe(200);
    const fetched = await resGet.json();
    expect(fetched.droneName).toBe("Test Drone");

    // 6. PUT: Update the drone
    console.log("[TEST] PUT update drone");
    const updatedDroneData = {
        droneName: "Updated Drone",
        centerId: centerId,
        droneImage: null,
        droneStatus: "ACTIVE"
    };
    const resUpdate = await request("PUT", "drones", `/${droneId}`, updatedDroneData);
    expect(resUpdate.status).toBe(200);

    // 7. GET: Verify the drone update by retrieving it by ID (by center ID)
    console.log("[TEST] GET drone by center ID");
    const resByCenter = await request("GET", "drones", `/center/${centerId}`);
    expect(resByCenter.status).toBe(200);
    const dronesByCenter = await resByCenter.json();
    expect(dronesByCenter.length).toBeGreaterThan(0);
    const droneMatch = dronesByCenter.find((d: any) => d.droneId === droneId);
    expect(droneMatch).toBeDefined();

    // 8. DELETE: Delete the drone
    console.log("[TEST] DELETE drone");
    const resDelete = await request("DELETE", "drones", `/${droneId}`);
    expect(resDelete.status).toBe(200);

    // 9. GET: Verify the drone deletion by trying to retrieve it by ID
    console.log("[TEST] GET drone after deletion (should be 404)");
    const resAfterDelete = await request("GET", "drones", `/${droneId}`);
    expect(resAfterDelete.status).toBe(404);

    // 10. DELETE: Clean up the donation center
    console.log("[TEST] DELETE donation center");
    const resDeleteCenter = await request("DELETE", "donation-centers", `/${centerId}`);
    expect(resDeleteCenter.status).toBe(200);

    console.log("[TEST] CRUD drone test completed successfully");
});
