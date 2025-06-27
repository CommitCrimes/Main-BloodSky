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


test("CRUD blood sample (with GET by type and deliveryId if available)", async () => {
  // 1. GET all blood samples to determine max ID
  console.log("[TEST] GET all blood samples");
  const resAll = await request("GET", "blood", "/");
  const all = await resAll.json();
  const maxId = all.reduce(
    (max: number, b: any) => Math.max(max, b.bloodId),
    0
  );
  const bloodId = maxId + 1;

  // 2. POST: Create a new blood sample without deliveryId
  console.log("[TEST] POST create new blood sample");
  const bloodData = {
    bloodId,
    bloodType: "A+",
    deliveryId: null,
  };

  const resCreate = await request("POST", "blood", "/", bloodData);
  expect(resCreate.status).toBe(201);

  // 3. GET by ID
  console.log("[TEST] GET blood sample by ID");
  const resGet = await request("GET", "blood", `/${bloodId}`);
  expect(resGet.status).toBe(200);
  const fetched = await resGet.json();
  expect(fetched.bloodType).toBe("A+");

  // 4. GET all deliveries to determine max ID
  console.log("[TEST] GET all deliveries");
  const resDeliveries = await request("GET", "deliveries", "/");
  const deliveries = await resDeliveries.json();
  const maxDeliveryId = deliveries.reduce(
    (max: number, d: any) => Math.max(max, d.deliveryId),
    0
  );
  const deliveryId = maxDeliveryId + 1;

  // 5. GET all drones to determine max ID
  console.log("[TEST] GET all drones");
  const resDrones = await request("GET", "drones", "/");
  const drones = await resDrones.json();
  const maxDroneId = drones.reduce(
    (max: number, d: any) => Math.max(max, d.droneId),
    0
  );
  const droneId = maxDroneId + 1;

  // 6. GET all donation centers to determine max ID
  console.log("[TEST] GET all donation centers");
  const resDonationCenters = await request("GET", "donation-centers", "/");
  const donationCenters = await resDonationCenters.json();
  const maxcenterId = donationCenters.reduce(
    (max: number, d: any) => Math.max(max, d.centerId),
    0
  );
  const centerId = maxcenterId + 1;

  // 7. GET all hospitals to determine max ID
  console.log("[TEST] GET all hospitals");
  const resHospitals = await request("GET", "hospitals", "/");
  const hospitals = await resHospitals.json();
  const maxHospitalId = hospitals.reduce(
    (max: number, d: any) => Math.max(max, d.hospitalId),
    0
  );
  const hospitalId = maxHospitalId + 1;

  // 8. POST: Create a new donation center for testing
  console.log("[TEST] POST create new donation center");
  const donationCenterData = {
      centerId,
      centerCity: "Donation Center test " + centerId,
      centerPostal: 75016,
      centerAdress: "50 rue du test unitaire",
      centerLatitude: null,
      centerLongitude: null
  };
  const resCreateDonationCenter = await request("POST", "donation-centers", "/", donationCenterData);
  expect(resCreateDonationCenter.status).toBe(201);
  console.log("[TEST] Created donation center");

  // 9. POST: Create a new hospital
  console.log("[TEST] POST create new hospital");
  const hospitalData = {
      hospitalId,
      hospitalName: "Test",
      hospitalCity: "Not Paris",
      hospitalPostal: 76001,
      hospitalAdress: "571 avenue de la testation testatoire",
      hospitalLatitude: null,
      hospitalLongitude: null
  };
  const resCreateHospital = await request("POST", "hospitals", "/", hospitalData);
  expect(resCreateHospital.status).toBe(201);
  console.log("[TEST] Created hospital");

  // 10. POST: Create a drone
  console.log("[TEST] POST create drone");
  const droneData = {
    droneId,
    droneName: "unaryTestDrone",
    centerId,
    droneStatus: null,
    droneCurrentLat: null,
    droneCurrentLong: null,
    droneBattery: null,
    droneImage: null
  };
  const resCreateDrone = await request("POST", "drones", "/", droneData);
  expect(resCreateDrone.status).toBe(201);
  console.log("[TEST] Created drone");

  // 11. POST: Create a delivery
  console.log("[TEST] POST create delivery");
  const deliveryData = {
    deliveryId,
    droneId,
    bloodId,
    hospitalId,
    centerId,
    dteDelivery: null,
    dteValidation: null,
    deliveryStatus: "testStatus",
    deliveryUrgent: false,
    participants: []
  };
  const resCreateDelivery = await request("POST", "deliveries", "/", deliveryData);
  expect(resCreateDelivery.status).toBe(201);
  console.log("[TEST] Created delivery");

  // 12. GET blood samples by blood type
  console.log("[TEST] GET blood samples by blood type");
  const resByType = await request("GET", "blood", `/type/A+`);
  expect(resByType.status).toBe(200);
  const typeList = await resByType.json();
  const typeMatch = typeList.find((b: any) => b.bloodId === bloodId);
  expect(typeMatch).toBeDefined();

  // 13. PUT update blood sample to use deliveryId
  console.log("[TEST] PUT update blood sample to use deliveryId");
  const updatedBloodData = {
    bloodId,
    bloodType: "A+",
    deliveryId: deliveryId, // Set the deliveryId
  };
  const resUpdate = await request("PUT", "blood", `/${bloodId}`, updatedBloodData);
  expect(resUpdate.status).toBe(200);

  // 14. GET blood sample by deliveryId
  console.log("[TEST] GET blood sample by deliveryId");
  const resByDelivery = await request("GET", "blood", `/delivery/${deliveryId}`);
  expect(resByDelivery.status).toBe(200);
  const deliveryList = await resByDelivery.json();
  const deliveryMatch = deliveryList.find((b: any) => b.bloodId === bloodId);
  expect(deliveryMatch).toBeDefined();

  // 15. DELETE blood sample
  console.log("[TEST] DELETE blood sample");
  const resDelete = await request("DELETE", "blood", `/${bloodId}`);
  expect(resDelete.status).toBe(200);

  // 16. GET after deletion
  console.log("[TEST] GET blood sample after deletion (should be 404)");
  const resAfterDelete = await request("GET", "blood", `/${bloodId}`);
  expect(resAfterDelete.status).toBe(404);
});
