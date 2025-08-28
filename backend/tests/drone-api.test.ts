import { test, expect } from "bun:test";
// Utilitaire pour effectuer des requêtes basiques
function request(method: string, route: string, path: string, body?: any) {
  // S'assure qu'il n'y a qu'un seul slash entre base et path
  const fullPath = `/api/${route}${path}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/');
  return fetch(`http://localhost:3000${fullPath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
// These tests require an external Drone API to be available. They are skipped by default
// to keep the test suite deterministic. Set DRONE_API_TESTS=true to run them.
const runDroneApiTests = process.env.DRONE_API_TESTS === "true";
const maybeTest = runDroneApiTests ? test : test.skip;
maybeTest("Drone control endpoints", async () => {
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
    missionStatus: "IDLE",
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
  console.log("Sync response status:", resSync.status);
  // Test create delivery mission endpoint
  console.log("[TEST] POST create delivery mission");
  const deliveryMission = {
    pickupLat: 48.8566,
    pickupLon: 2.3522,
    deliveryLat: 48.8606,
    deliveryLon: 2.3376,
    altitude: 50,
  };
  const resDelivery = await request("POST", "drones", `/${droneId}/delivery-mission`, deliveryMission);
  console.log("Delivery mission response status:", resDelivery.status);
  // Clean up
  console.log("[TEST] DELETE test drone");
  const resDelete = await request("DELETE", "drones", `/${droneId}`);
  expect(resDelete.status).toBe(200);
  console.log("[TEST] Drone control endpoints test completed");
});