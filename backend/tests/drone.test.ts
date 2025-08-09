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
        droneStatus: null,
        droneCurrentLat: null,
        droneCurrentLong: null,
        droneBattery: null,
        droneImage: null,
        droneApiUrl: "http://localhost:5000",
        droneApiId: 1,
        altitudeM: null,
        horizontalSpeedMS: null,
        verticalSpeedMS: null,
        headingDeg: null,
        flightMode: null,
        isArmed: false,
        missionStatus: null,
        currentMissionId: null,
        lastSyncAt: null
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
        droneStatus: "ACTIVE",
        droneCurrentLat: 48.8566,
        droneCurrentLong: 2.3522,
        droneBattery: "75%",
        altitudeM: 50.5,
        horizontalSpeedMS: 10.2,
        verticalSpeedMS: 0.5,
        headingDeg: 45.0,
        flightMode: "AUTO",
        isArmed: true,
        missionStatus: "ACTIVE"
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

// Test drone control endpoints
test("Drone control endpoints", async () => {
    // Create a test drone first
    const resAll = await request("GET", "drones", "/");
    const all = await resAll.json();
    const maxId = all.reduce((max: number, d: any) => Math.max(max, d.droneId), 0);
    const droneId = maxId + 1;

    const droneData = {
        droneId,
        droneName: "Control Test Drone",
        centerId: 1,
        droneApiUrl: "http://localhost:5000",
        droneApiId: 1,
        isArmed: false,
        missionStatus: "IDLE"
    };

    const resCreate = await request("POST", "drones", "/", droneData);
    expect(resCreate.status).toBe(201);

    // Test drone status endpoint
    console.log("[TEST] GET drone status");
    const resStatus = await request("GET", "drones", "/status");
    expect(resStatus.status).toBe(200);
    const status = await resStatus.json();
    expect(Array.isArray(status)).toBe(true);

    // Test force sync endpoint
    console.log("[TEST] POST force sync drone");
    const resSync = await request("POST", "drones", `/${droneId}/sync`);
    // Note: This might fail if the drone API is not running, which is expected
    console.log("Sync response status:", resSync.status);

    // Test create delivery mission endpoint
    console.log("[TEST] POST create delivery mission");
    const deliveryMission = {
        pickupLat: 48.8566,
        pickupLon: 2.3522,
        deliveryLat: 48.8606,
        deliveryLon: 2.3376,
        altitude: 50
    };
    const resDelivery = await request("POST", "drones", `/${droneId}/delivery-mission`, deliveryMission);
    console.log("Delivery mission response status:", resDelivery.status);

    // Clean up
    console.log("[TEST] DELETE test drone");
    const resDelete = await request("DELETE", "drones", `/${droneId}`);
    expect(resDelete.status).toBe(200);

    console.log("[TEST] Drone control endpoints test completed");
});