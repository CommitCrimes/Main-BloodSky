import { test, expect } from "bun:test";
import * as bcrypt from 'bcrypt';

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

test("CRUD delivery", async () => {
    // 1. Récupérer toutes les livraisons pour déterminer l'ID max
    console.log("[TEST] GET all deliveries");
    const resAll = await request("GET", "deliveries", "/")
    const all = await resAll.json();
    const maxId = all.reduce(
      (max: number, d: any) => Math.max(max, d.deliveryId),
      0
    );
    const deliveryId = maxId + 1;

    // 2. Récupérer tous les drones pour déterminer l'ID max
    console.log("[TEST] GET all drones");
    const resDrones = await request("GET", "drones", "/");
    const drones = await resDrones.json();
    const maxDroneId = drones.reduce(
      (max: number, d: any) => Math.max(max, d.droneId),
      0
    );
    const droneId = maxDroneId + 1;

    // 3. Récupérer tous les users pour déterminer l'ID max
    console.log("[TEST] GET all users");
    const resUsers = await request("GET", "users", "/");
    const users = await resUsers.json();
    const maxUserId = users.reduce(
        (max: number, d: any) => Math.max(max, d.userId),
        0
    );
    const userIdDonationCenter = maxUserId + 1;
    const userIdHospital = maxUserId + 2;
    const userIdDrone = maxUserId + 3;
    
    // 4. Récupérer tous les donation center pour déterminer l'ID max
    console.log("[TEST] GET all donation centers");
    const resDonationCenters = await request("GET", "donation-centers", "/");
    const donationCenters = await resDonationCenters.json();
    const maxDonationCenterId = donationCenters.reduce(
        (max: number, d: any) => Math.max(max, d.donationCenterId),
        0
    );
    const donationCenterId = maxDonationCenterId + 1;

    // 5. Récupérer tous les hospitaux pour déterminer l'ID max
    console.log("[TEST] GET all hospitals");
    const resHospitals = await request("GET", "hospitals", "/");
    const hospitals = await resHospitals.json();
    const maxHospitalId = hospitals.reduce(
        (max: number, d: any) => Math.max(max, d.hospitalId),
        0
    );
    const hospitalId = maxHospitalId + 1;

    // 6. Récupérer toutes les blood pour déterminer l'ID max
    console.log("[TEST] GET all blood");
    const resBlood = await request("GET", "blood", "/");
    const blood = await resBlood.json();
    const maxBloodId = blood.reduce(
        (max: number, d: any) => Math.max(max, d.bloodId),
        0
    );
    const bloodId = maxBloodId + 1;

    // 6. POST: Créer un nouvel donation center de test
    console.log("[TEST] POST create new donation center");
    const donationCenterData = {
        donationCenterId,
        centerCity: "Donation Center test" + donationCenterId,
        centerPostal: 75016,
        centerAdress: "50 rue du test unitaire",
        centerLatitude: null,
        centerLongitude: null
    };
    const resCreateDonationCenter = await request("POST", "donation-centers", "/", donationCenterData);
    expect(resCreateDonationCenter.status).toBe(201);
    const createdDonationCenter = await resCreateDonationCenter.json();
    console.log("[TEST] Created donation center:", createdDonationCenter);

    // 7. POST: Créer un nouvel hospital
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
    const createdHospital = await resCreateHospital.json();
    console.log("[TEST] Created hospital:", createdHospital);

    // 8. POST: Créer un user de donation center
    console.log("[TEST] POST create donation center user");
    const userDonationCenterData = {
        user:{
            userIdDonationCenter,
            email: "testDonation12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("Test", 10),
            userName: "Donation",
            userFirstname: "Center",
            telNumber: null,
            userStatus: "active"
        },
        donationCenterId,
        admin: false,
        info: "info du test de l'user donation center"
    };
    const resCreateUserDonationCenter = await request ("POST", "users", "/donation-center", userDonationCenterData);
    expect(resCreateUserDonationCenter.status).toBe(201);
    const createdUserDonationCenter = await resCreateUserDonationCenter.json();
    console.log("[TEST] Created donation center user:", createdUserDonationCenter);

    // 9. POST: Créer un user de hospital
    console.log("[TEST] POST create hospital user");
    const userHospitalData = {
        user:{
            userIdHospital,
            email: "hospitalZDNIAZ9DA6TGE9128EG1BDN98Z0I1IZPDH1ZPHP1PHD1ZDH9G@bloodsky.fr",
            password: await bcrypt.hash("Test", 10),
            userName: "hospi",
            userFirstname: "taltal",
            telNumber: null,
            userStatus: "active"
        },
        hospitalId,
        admin: false,
        info: "info du test de l'user hospital"
    };
    const resCreateUserHospital = await request("POST", "users", "/hospital", userHospitalData);
    expect(resCreateUserHospital.status).toBe(201);
    const createdUserHospital = await resCreateUserHospital.json();
    console.log("[TEST] Created hospital user:", createdUserHospital);

    // 10. POST: Créer un user de dronist
    console.log("[TEST] POST create dronist user");
    const userDronistData = {
        user:{
            userIdDrone,
            email: "dronist90UYZHA9Z8DHA9Z8OAIHEAZ08EGAIZEA79CGSUAG0D9G8AZDIZAGD@bloodsky.fr",
            password: await bcrypt.hash("Test", 10),
            userName: "drone",
            userFirstname: "histe",
            telNumber: null,
            userStatus: "active"
        },
        info: "info du test de l'user droniste"
    };
    const resCreateUserDronist = await request("POST", "users", "/dronist", userDronistData);
    expect(resCreateUserDronist.status).toBe(201);
    const createdUserDronist = await resCreateUserDronist.json();
    console.log("[TEST] Created dronist user:", createdUserDronist);

    // 11. POST: Créer un drone
    console.log("[TEST] POST create drone");
    const droneData = {
        droneId,
        droneName: "unaryTestDrone",
        donationCenterId,
        droneStatus: null,
        droneCurrentLat: null,
        droneCurrentLong: null,
        droneBattery: null,
        droneImage: null
    };
    const resCreateDrone = await request("POST", "drones", "/", droneData);
    expect(resCreateDrone.status).toBe(201);
    const createdDrone = await resCreateDrone.json();
    console.log("[TEST] Created drone:", createdDrone);
});