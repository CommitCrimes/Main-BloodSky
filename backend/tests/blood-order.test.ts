import { test, expect } from "bun:test";

function request(method: string, route: string, path: string, body?: any) {
  const fullPath = `/api/${route}${path}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/');
  return fetch(`http://localhost:3000${fullPath}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test("Blood order, cancel, and status update workflow", async () => {
  // Prepare unique IDs
  const resCenters = await request("GET", "donation-centers", "/");
  const centers = await resCenters.json();
  const centerId = centers.reduce((m: number, c: any) => Math.max(m, c.centerId), 0) + 1;

  const resHospitals = await request("GET", "hospitals", "/");
  const hospitals = await resHospitals.json();
  const hospitalId = hospitals.reduce((m: number, h: any) => Math.max(m, h.hospitalId), 0) + 1;

  const resBloodAll = await request("GET", "blood", "/");
  const bloodAll = await resBloodAll.json();
  const maxBloodId = bloodAll.reduce((m: number, b: any) => Math.max(m, b.bloodId), 0);
  const bloodId1 = maxBloodId + 1;
  const bloodId2 = maxBloodId + 2;
  const bloodId3 = maxBloodId + 3;

  // Create center and hospital
  console.log("[TEST] Create center and hospital for order workflow");
  let res = await request("POST", "donation-centers", "/", {
    centerId,
    centerCity: "Order Center",
    centerPostal: 40000,
    centerAdress: "1 Order St",
    centerLatitude: null,
    centerLongitude: null
  });
  expect(res.status).toBe(201);

  res = await request("POST", "hospitals", "/", {
    hospitalId,
    hospitalName: "Order Hospital",
    hospitalCity: "Order City",
    hospitalPostal: 50000,
    hospitalAdress: "2 Order Ave",
    hospitalLatitude: null,
    hospitalLongitude: null
  });
  expect(res.status).toBe(201);

  // Create available blood stock (B-)
  console.log("[TEST] Create available blood stock");
  for (const bloodId of [bloodId1, bloodId2, bloodId3]) {
    const resCreateBlood = await request("POST", "blood", "/", {
      bloodId,
      bloodType: "B-",
      deliveryId: null,
    });
    expect(resCreateBlood.status).toBe(201);
  }

  // Place order for 2 units of B-
  console.log("[TEST] Place order for 2 units");
  res = await request("POST", "blood", "/order", {
    hospitalId,
    centerId,
    bloodType: "B-",
    quantity: 2,
    isUrgent: true,
    notes: "Test order",
  });
  expect(res.status).toBe(200);
  const order = await res.json();
  expect(order.success).toBe(true);
  const deliveryIdA = order.deliveryId as number;
  expect(Array.isArray(order.bloodIds)).toBe(true);
  expect(order.bloodIds.length).toBe(2);

  // Verify blood assigned to delivery
  let resBloodByDelivery = await request("GET", "blood", `/delivery/${deliveryIdA}`);
  expect(resBloodByDelivery.status).toBe(200);
  const bloodByDelivery = await resBloodByDelivery.json();
  expect(bloodByDelivery.length).toBe(2);

  // Verify delivery is pending
  let resDelivery = await request("GET", "deliveries", `/${deliveryIdA}`);
  expect(resDelivery.status).toBe(200);
  let delivery = await resDelivery.json();
  expect(delivery.deliveryStatus).toBe("pending");

  // Cancel the order (pending)
  console.log("[TEST] Cancel pending order");
  res = await request("POST", "blood", `/cancel-order/${deliveryIdA}`);
  expect(res.status).toBe(200);
  const cancelJson = await res.json();
  expect(cancelJson.success).toBe(true);

  // Verify delivery deleted and blood released
  resDelivery = await request("GET", "deliveries", `/${deliveryIdA}`);
  expect(resDelivery.status).toBe(404);
  resBloodByDelivery = await request("GET", "blood", `/delivery/${deliveryIdA}`);
  expect(resBloodByDelivery.status).toBe(404);

  // Place a new order for 2 units again
  console.log("[TEST] Place second order and update status");
  res = await request("POST", "blood", "/order", {
    hospitalId,
    centerId,
    bloodType: "B-",
    quantity: 2,
    isUrgent: false,
  });
  expect(res.status).toBe(200);
  const orderB = await res.json();
  const deliveryIdB = orderB.deliveryId as number;

  // Update status via status-update route
  res = await request("POST", "blood", `/status-update/${deliveryIdB}`, { status: "accepted_center" });
  expect(res.status).toBe(200);
  const statusResp = await res.json();
  expect(statusResp.success).toBe(true);
  expect(statusResp.status).toBe("accepted_center");

  // Verify delivery status updated
  resDelivery = await request("GET", "deliveries", `/${deliveryIdB}`);
  expect(resDelivery.status).toBe(200);
  delivery = await resDelivery.json();
  expect(delivery.deliveryStatus).toBe("accepted_center");

  // Cleanup
  await request("DELETE", "deliveries", `/${deliveryIdB}`);
  for (const bloodId of [bloodId1, bloodId2, bloodId3]) {
    await request("DELETE", "blood", `/${bloodId}`);
  }
  await request("DELETE", "donation-centers", `/${centerId}`);
  await request("DELETE", "hospitals", `/${hospitalId}`);
});

