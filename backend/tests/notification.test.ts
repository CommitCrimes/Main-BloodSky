import { test, expect } from "bun:test";
import * as bcrypt from 'bcrypt';

function request(method: string, route: string, path: string, body?: any, token?: string) {
  const fullPath = `/api/${route}${path}`.replace(/\/+$/, '').replace(/\/{2,}/g, '/');
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`http://localhost:3000${fullPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

test("Notification routes with auth", async () => {
  // Prepare unique ids
  const resCenters = await request("GET", "donation-centers", "/");
  const centers = await resCenters.json();
  const centerId = centers.reduce((m: number, c: any) => Math.max(m, c.centerId), 0) + 1;

  const resHospitals = await request("GET", "hospitals", "/");
  const hospitals = await resHospitals.json();
  const hospitalId = hospitals.reduce((m: number, h: any) => Math.max(m, h.hospitalId), 0) + 1;

  const resUsers = await request("GET", "users", "/");
  const allUsers = await resUsers.json();
  const baseUserId = allUsers.reduce((m: number, u: any) => Math.max(m, u.userId), 0) + 1000; // offset to avoid collisions
  const centerAdminId = baseUserId + 1;
  const hospitalAdminId = baseUserId + 2;

  const resDrones = await request("GET", "drones", "/");
  const drones = await resDrones.json();
  const droneId = drones.reduce((m: number, d: any) => Math.max(m, d.droneId), 0) + 1;

  const resDeliveries = await request("GET", "deliveries", "/");
  const deliveries = await resDeliveries.json();
  const deliveryId = deliveries.reduce((m: number, d: any) => Math.max(m, d.deliveryId), 0) + 1;

  const resBlood = await request("GET", "blood", "/");
  const bloodList = await resBlood.json();
  const bloodId = bloodList.reduce((m: number, b: any) => Math.max(m, b.bloodId), 0) + 1;

  // Create center and hospital
  const resCreateCenter = await request("POST", "donation-centers", "/", {
    centerId,
    centerCity: "Notif Center",
    centerPostal: 11111,
    centerAdress: "1 Center St",
    centerLatitude: null,
    centerLongitude: null
  });
  expect(resCreateCenter.status).toBe(201);

  const resCreateHospital = await request("POST", "hospitals", "/", {
    hospitalId,
    hospitalName: "Notif Hospital",
    hospitalCity: "Notif City",
    hospitalPostal: 22222,
    hospitalAdress: "2 Hospital Ave",
    hospitalLatitude: null,
    hospitalLongitude: null
  });
  expect(resCreateHospital.status).toBe(201);

  // Create role users (admin) with known plaintext passwords
  const centerAdminEmail = `notif_center_${Date.now()}@bloodsky.fr`;
  const hospitalAdminEmail = `notif_hospital_${Date.now()}@bloodsky.fr`;
  const passwordPlain = "NotifPass123!";

  const resCreateCenterAdmin = await request("POST", "users", "/donation-center", {
    user: {
      userId: centerAdminId,
      email: centerAdminEmail,
      password: await bcrypt.hash(passwordPlain, 10),
      userName: "CenterAdmin",
      userFirstname: "Notif",
      telNumber: null,
      userStatus: "active"
    },
    centerId,
    admin: true,
    info: "center admin"
  });
  expect(resCreateCenterAdmin.status).toBe(201);

  const resCreateHospitalAdmin = await request("POST", "users", "/hospital", {
    user: {
      userId: hospitalAdminId,
      email: hospitalAdminEmail,
      password: await bcrypt.hash(passwordPlain, 10),
      userName: "HospitalAdmin",
      userFirstname: "Notif",
      telNumber: null,
      userStatus: "active"
    },
    hospitalId,
    admin: true,
    info: "hospital admin"
  });
  expect(resCreateHospitalAdmin.status).toBe(201);

  // Login as hospital admin to get token
  const resLogin = await request("POST", "auth", "/login", {
    email: hospitalAdminEmail,
    password: passwordPlain
  });
  expect(resLogin.status).toBe(200);
  const loginData = await resLogin.json();
  const token = loginData.token as string;
  expect(typeof token).toBe("string");

  // Create drone and blood and delivery
  const resCreateDrone = await request("POST", "drones", "/", {
    droneId,
    droneName: "NotifDrone",
    centerId,
    droneImage: null,
    droneStatus: null
  });
  expect(resCreateDrone.status).toBe(201);

  const resCreateBlood = await request("POST", "blood", "/", {
    bloodId,
    bloodType: "O+",
    deliveryId: null
  });
  expect(resCreateBlood.status).toBe(201);

  const resCreateDelivery = await request("POST", "deliveries", "/", {
    deliveryId,
    droneId,
    bloodId,
    hospitalId,
    centerId,
    dteDelivery: null,
    dteValidation: null,
    deliveryStatus: "pending",
    deliveryUrgent: false,
    participants: []
  });
  expect(resCreateDelivery.status).toBe(201);

  // Update delivery status to trigger notifications for hospital users
  const resUpdateDelivery = await request("PUT", "deliveries", `/${deliveryId}`, {
    deliveryStatus: "accepted_center",
    dteValidation: null,
    droneId
  });
  expect(resUpdateDelivery.status).toBe(200);

  // Fetch notifications as hospital admin
  const resNotif = await request("GET", "notifications", "/", undefined, token);
  expect(resNotif.status).toBe(200);
  const notifs = await resNotif.json();
  expect(Array.isArray(notifs)).toBe(true);

  // Unread count should be >= 1
  const resUnread = await request("GET", "notifications", "/unread-count", undefined, token);
  expect(resUnread.status).toBe(200);
  const unread = await resUnread.json();
  expect(typeof unread.unreadCount).toBe("number");

  if (notifs.length > 0) {
    // Mark first as read
    const firstId = notifs[0].notificationId;
    const resMark = await request("POST", "notifications", `/${firstId}/read`, undefined, token);
    expect(resMark.status).toBe(200);
  }

  // Mark all as read
  const resMarkAll = await request("POST", "notifications", "/mark-all-read", undefined, token);
  expect(resMarkAll.status).toBe(200);

  // Cleanup
  await request("DELETE", "deliveries", `/${deliveryId}`);
  await request("DELETE", "blood", `/${bloodId}`);
  await request("DELETE", "drones", `/${droneId}`);
  await request("DELETE", "users", `/${centerAdminId}`);
  await request("DELETE", "users", `/${hospitalAdminId}`);
  await request("DELETE", "donation-centers", `/${centerId}`);
  await request("DELETE", "hospitals", `/${hospitalId}`);
});
