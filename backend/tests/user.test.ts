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

test("CRUD user", async () => {
    // 1. GET all users to determine max ID
    console.log("[TEST] GET all users");
    const resAll = await request("GET", "users", "/");
    const all = await resAll.json();
    const maxId = all.reduce(
        (max: number, u: any) => Math.max(max, u.userId),
        0
    );
    const userId = maxId + 1;
    const userDonationId = maxId + 2;
    const userDronistId = maxId + 3;
    const userSupportId = maxId + 4;
    const userHospitalId = maxId + 5;

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

    // 4. GET all hospitals to determine max hospital ID
    console.log("[TEST] GET all hospitals");
    const resHospitals = await request("GET", "hospitals", "/");
    const hospitals = await resHospitals.json();
    const maxHospitalId = hospitals.reduce(
        (max: number, h: any) => Math.max(max, h.hospitalId),
        0
    );
    const hospitalId = maxHospitalId + 1;

    // 5. POST: Create a new hospital
    console.log("[TEST] POST create new hospital");
    const hospitalData = {
        hospitalId,
        hospitalName: "Test Hospital",
        hospitalCity: "Test City",
        hospitalPostal: 12345,
        hospitalAdress: "123 Test Street",
        hospitalLatitude: null,
        hospitalLongitude: null
    };
    const resCreateHospital = await request("POST", "hospitals", "/", hospitalData);
    expect(resCreateHospital.status).toBe(201);
    console.log("[TEST] Created hospital with ID:", hospitalId);

    // 6. POST: Create a new user
    console.log("[TEST] POST create new user");
    const userData = {
        userId,
        email: "testuser09DH10ZHD13083NF7193GF1B07B10837FB1@bloodsky.fr",
        password: await bcrypt.hash("TestUser", 10),
        userName: "TestUser",
        userFirstname: "Test",
        telNumber: null,
        userStatus: "active"
    };
    const resCreate = await request("POST", "users", "/", userData);
    expect(resCreate.status).toBe(201);
    console.log("[TEST] Created user with ID:", userId);

    // 6b. GET: Retrieve the user by name
    console.log("[TEST] GET user by name");
    const resGetByName = await request("GET", "users", `/name/${encodeURIComponent(userData.userName)}`);
    expect(resGetByName.status).toBe(200);

    // 7. POST: Create a new user with donation role
    console.log("[TEST] POST create new user with donation role");
    const userDonationCenterData = {
        user:{
            userId: userDonationId,
            email: "testDonation12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("TestDonation", 10),
            userName: "Donation",
            userFirstname: "Center",
            telNumber: null,
            userStatus: "active"
        },
        centerId,
        admin: false,
        info: "info du test de l'user donation center"
    };
    const resCreateUserDonationCenter = await request ("POST", "users", "/donation-center", userDonationCenterData);
    expect(resCreateUserDonationCenter.status).toBe(201);
    console.log("[TEST] Created donation center user");

    // 8. POST: Create a new user with dronist role
    console.log("[TEST] POST create new user with dronist role");
    const userDronistData = {
        user: {
            userId: userDronistId,
            email: "testDronist12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("TestDronist", 10),
            userName: "Dronist",
            userFirstname: "Test",
            telNumber: null,
            userStatus: "active"
        },
        info: "info du test de l'user dronist"
    };
    const resCreateUserDronist = await request("POST", "users", "/dronist", userDronistData);
    expect(resCreateUserDronist.status).toBe(201);
    console.log("[TEST] Created dronist user");

    // 9. POST: Create a new user with support role
    console.log("[TEST] POST create new user with support role");
    const userSupportData = {
        user: {
            userId: userSupportId,
            email: "testSupport12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("TestSupport", 10),
            userName: "Support",
            userFirstname: "Test",
            telNumber: null,
            userStatus: "active"
        },
        info: "info du test de l'user support"
    };
    const resCreateUserSupport = await request("POST", "users", "/support-center", userSupportData);
    expect(resCreateUserSupport.status).toBe(201);
    console.log("[TEST] Created support user");

    // 10. POST: Create a new user with hospital role
    console.log("[TEST] POST create new user with hospital role");
    const userHospitalData = {
        user: {
            userId: userHospitalId,
            email: "testHospital12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("TestHospital", 10),
            userName: "Hospital",
            userFirstname: "Test",
            telNumber: null,
            userStatus: "active"
        },
        hospitalId,
        admin: false,
        info: "info du test de l'user hospital"
    };
    const resCreateUserHospital = await request("POST", "users", "/hospital", userHospitalData);
    expect(resCreateUserHospital.status).toBe(201);
    console.log("[TEST] Created hospital user");

    // 10b. GET: Verify listing endpoints for each role contain the created users
    console.log("[TEST] GET users listing for roles");
    const resListDonation = await request("GET", "users", "/donation-center");
    expect(resListDonation.status).toBe(200);
    const listDonation = await resListDonation.json();
    expect(listDonation.find((u: any) => u.userId === userDonationId)).toBeDefined();

    const resListDronist = await request("GET", "users", "/dronist");
    expect(resListDronist.status).toBe(200);
    const listDronist = await resListDronist.json();
    expect(listDronist.find((u: any) => u.userId === userDronistId)).toBeDefined();

    const resListSupport = await request("GET", "users", "/support-center");
    expect(resListSupport.status).toBe(200);
    const listSupport = await resListSupport.json();
    expect(listSupport.find((u: any) => u.userId === userSupportId)).toBeDefined();

    const resListHospital = await request("GET", "users", "/hospital");
    expect(resListHospital.status).toBe(200);
    const listHospital = await resListHospital.json();
    expect(listHospital.find((u: any) => u.userId === userHospitalId)).toBeDefined();

    // 11. GET: Retrieve the user by ID
    console.log("[TEST] GET user by ID");
    const resGet = await request("GET", "users", `/${userId}`);
    expect(resGet.status).toBe(200);
    const fetched = await resGet.json();
    expect(fetched.userId).toBe(userId);
    expect(fetched.email).toBe(userData.email);
    expect(fetched.userName).toBe(userData.userName);
    expect(fetched.userFirstname).toBe(userData.userFirstname);
    expect(fetched.userStatus).toBe(userData.userStatus);
    console.log("[TEST] User found by ID");

    // 12. GET: Retrieve the user by email
    console.log("[TEST] GET user by email");
    const resGetByEmail = await request("GET", "users", `/email/${userData.email}`);
    expect(resGetByEmail.status).toBe(200);
    const fetchedByEmail = await resGetByEmail.json();
    expect(fetchedByEmail.userId).toBe(userId);
    expect(fetchedByEmail.email).toBe(userData.email);
    expect(fetchedByEmail.userName).toBe(userData.userName);
    expect(fetchedByEmail.userFirstname).toBe(userData.userFirstname);
    expect(fetchedByEmail.userStatus).toBe(userData.userStatus);
    console.log("[TEST] User found by email");

    // 13. GET: Retrieve the user by donation center ID
    console.log("[TEST] GET user by donation center ID");
    const resGetByCenter = await request("GET", "users", `/donation-center/${centerId}`);
    const fetchedByCenter = await resGetByCenter.json();
    expect(Array.isArray(fetchedByCenter)).toBe(true);
    const foundByCenter = fetchedByCenter.find((u: any) => u.userId === userDonationId);
    expect(foundByCenter).toBeDefined();
    expect(foundByCenter.userId).toBe(userDonationId);
    expect(foundByCenter.centerId).toBe(centerId);
    expect(foundByCenter.admin).toBe(userDonationCenterData.admin);
    expect(foundByCenter.info).toBe(userDonationCenterData.info);
    console.log("[TEST] User found by donation center ID");

    // 14. GET: Retrieve the user by hospital ID
    console.log("[TEST] GET user by hospital ID");
    const resGetByHospital = await request("GET", "users", `/hospital/${hospitalId}`);
    const fetchedByHospital = await resGetByHospital.json();
    expect(Array.isArray(fetchedByHospital)).toBe(true);
    const foundByHospital = fetchedByHospital.find((u: any) => u.userId === userHospitalId);
    expect(foundByHospital).toBeDefined();
    expect(foundByHospital.userId).toBe(userHospitalId);
    expect(foundByHospital.hospitalId).toBe(hospitalId);
    expect(foundByHospital.admin).toBe(userHospitalData.admin);
    expect(foundByHospital.info).toBe(userHospitalData.info);
    console.log("[TEST] User found by hospital ID");

    // 15. PUT: Update the user
    console.log("[TEST] PUT update user");
    const updatedUserData = {
        userId,
        email: "updatedTestUser09DH10ZHD13083NF7193GF1@bloodsky.fr",
        userName: "UpdatedUserName",
        userFirstname: "UpdatedUserFirstname",
        userStatus: "inactive"
    };
    const resUpdate = await request("PUT", "users", `/${userId}`, updatedUserData);
    expect(resUpdate.status).toBe(200);
    console.log("[TEST] User updated");

    // 16. GET: Verify the update by retrieving the user by ID
    console.log("[TEST] GET user by ID after update");
    const resGetAfterUpdate = await request("GET", "users", `/${userId}`);
    expect(resGetAfterUpdate.status).toBe(200);
    const updatedUser = await resGetAfterUpdate.json();
    expect(updatedUser.userId).toBe(userId);
    expect(updatedUser.email).toBe(updatedUserData.email);
    expect(updatedUser.userName).toBe(updatedUserData.userName);
    expect(updatedUser.userFirstname).toBe(updatedUserData.userFirstname);
    expect(updatedUser.userStatus).toBe(updatedUserData.userStatus);
    console.log("[TEST] User found by ID after update");

    // 17. PUT: Update the donation center user
    console.log("[TEST] PUT update donation center user");
    const updatedUserDonationData = {
        user:{
            userId: userDonationId,
            email: "updatedDonationUserEmail@example.com",
            userName: "UpdatedDonationUserName",
            userFirstname: "UpdatedDonationUserFirstname",
            userStatus: "inactive"
        },
        centerId,
        admin: true,
        info: "Updated info for donation center user"
    };
    const resUpdateDonation = await request("PUT", "users", `/donation-center/${userDonationId}`, updatedUserDonationData);
    expect(resUpdateDonation.status).toBe(200);
    console.log("[TEST] Donation center user updated");

    // 18. GET: Verify the update by retrieving the donation center user by checking admins
    console.log("[TEST] GET donation center user by checking admins");
    const resGetDonationAdmins = await request("GET", "users", `/donation-center/${centerId}/admins`);
    expect(resGetDonationAdmins.status).toBe(200);
    const donationAdmins = await resGetDonationAdmins.json();
    const donationUser = donationAdmins.find((u: any) => u.userId === userDonationId);
    expect(donationUser).toBeDefined();
    expect(donationUser.userId).toBe(userDonationId);
    expect(donationUser.centerId).toBe(centerId);
    expect(donationUser.admin).toBe(updatedUserDonationData.admin);
    expect(donationUser.info).toBe(updatedUserDonationData.info);
    console.log("[TEST] Donation center user found by checking admins");

    // 19. PUT: Update the dronist user
    console.log("[TEST] PUT update dronist user");
    const updatedUserDronistData = {
        user: {
            userId: userDronistId,
            email: "updatedDronistUserEmail@example.com",
            userName: "UpdatedDronistUserName",
            userFirstname: "UpdatedDronistUserFirstname",
            userStatus: "inactive"
        },
        info: "Updated info for dronist user"
    };
    const resUpdateDronist = await request("PUT", "users", `/dronist/${userDronistId}`, updatedUserDronistData);
    expect(resUpdateDronist.status).toBe(200);
    console.log("[TEST] Dronist user updated");

    // 20. GET: Verify the update with GET by ID
    console.log("[TEST] GET dronist user by ID after update");
    const resGetDronistAfterUpdate = await request("GET", "users", `/${userDronistId}`);
    expect(resGetDronistAfterUpdate.status).toBe(200);
    const updatedDronistUser = await resGetDronistAfterUpdate.json();
    expect(updatedDronistUser.userId).toBe(userDronistId);
    expect(updatedDronistUser.email).toBe(updatedUserDronistData.user.email);
    expect(updatedDronistUser.userName).toBe(updatedUserDronistData.user.userName);
    expect(updatedDronistUser.userFirstname).toBe(updatedUserDronistData.user.userFirstname);
    expect(updatedDronistUser.userStatus).toBe(updatedUserDronistData.user.userStatus);
    console.log("[TEST] Dronist user found by ID after update");

    // 21. PUT: Update the support user
    console.log("[TEST] PUT update support user");
    const updatedUserSupportData = {
        user: {
            userId: userSupportId,
            email: "updatedSupportUserEmail@example.com",
            userName: "UpdatedSupportUserName",
            userFirstname: "UpdatedSupportUserFirstname",
            userStatus: "inactive"
        },
        info: "Updated info for support user"
    };
    const resUpdateSupport = await request("PUT", "users", `/support-center/${userSupportId}`, updatedUserSupportData);
    expect(resUpdateSupport.status).toBe(200);
    console.log("[TEST] Support user updated");

    // 22. GET: Verify the update with GET by ID
    console.log("[TEST] GET support user by ID after update");
    const resGetSupportAfterUpdate = await request("GET", "users", `/${userSupportId}`);
    expect(resGetSupportAfterUpdate.status).toBe(200);
    const updatedSupportUser = await resGetSupportAfterUpdate.json();
    expect(updatedSupportUser.userId).toBe(userSupportId);
    expect(updatedSupportUser.email).toBe(updatedUserSupportData.user.email);
    expect(updatedSupportUser.userName).toBe(updatedUserSupportData.user.userName);
    expect(updatedSupportUser.userFirstname).toBe(updatedUserSupportData.user.userFirstname);
    expect(updatedSupportUser.userStatus).toBe(updatedUserSupportData.user.userStatus);
    console.log("[TEST] Support user found by ID after update");

    // 23. PUT: Update the hospital user
    console.log("[TEST] PUT update hospital user");
    const updatedUserHospitalData = {
        user: {
            userId: userHospitalId,
            email: "updatedHospitalUserEmail@example.com",
            userName: "UpdatedHospitalUserName",
            userFirstname: "UpdatedHospitalUserFirstname",
            userStatus: "inactive"
        },
        hospitalId,
        admin: true,
        info: "Updated info for hospital user"
    };
    const resUpdateHospital = await request("PUT", "users", `/hospital/${userHospitalId}`, updatedUserHospitalData);
    expect(resUpdateHospital.status).toBe(200);
    console.log("[TEST] Hospital user updated");

    // 24. GET: Verify the update by retrieving the hospital user by checking admins
    console.log("[TEST] GET hospital user by checking admins");
    const resGetHospitalAdmins = await request("GET", "users", `/hospital/${hospitalId}/admins`);
    expect(resGetHospitalAdmins.status).toBe(200);
    const hospitalAdmins = await resGetHospitalAdmins.json();
    const hospitalUser = hospitalAdmins.find((u: any) => u.userId === userHospitalId);
    expect(hospitalUser).toBeDefined();
    expect(hospitalUser.userId).toBe(userHospitalId);
    expect(hospitalUser.hospitalId).toBe(hospitalId);
    expect(hospitalUser.admin).toBe(updatedUserHospitalData.admin);
    expect(hospitalUser.info).toBe(updatedUserHospitalData.info);
    console.log("[TEST] Hospital user found by checking admins");

    // (We need to add a test for the get delivery participation, so we need to create a delivery so we need a drone and blood)
    // 25. GET all drones to determine max drone ID
    console.log("[TEST] GET all drones");
    const resDrones = await request("GET", "drones", "/");
    const drones = await resDrones.json();
    const maxDroneId = drones.reduce(
        (max: number, d: any) => Math.max(max, d.droneId),
        0
    );
    const droneId = maxDroneId + 1;

    // 26. POST: Create a new drone
    console.log("[TEST] POST create new drone");
    const droneData = {
        droneId,
        droneName: "Test Drone",
        centerId: centerId,
        droneImage: null,
        droneStatus: null
    };
    const resCreateDrone = await request("POST", "drones", "/", droneData);
    expect(resCreateDrone.status).toBe(201);
    console.log("[TEST] Created drone with ID:", droneId);

    // 27. GET all deliveries to determine max delivery ID
    console.log("[TEST] GET all deliveries");
    const resDeliveries = await request("GET", "deliveries", "/");
    const deliveries = await resDeliveries.json();
    const maxDeliveryId = deliveries.reduce(
        (max: number, d: any) => Math.max(max, d.deliveryId),
        0
    );
    const deliveryId = maxDeliveryId + 1;

    // 28. GET all blood samples to determine max blood ID
    console.log("[TEST] GET all blood samples");
    const resBlood = await request("GET", "blood", "/");
    const bloodSamples = await resBlood.json();
    const maxBloodId = bloodSamples.reduce(
        (max: number, b: any) => Math.max(max, b.bloodId),
        0
    );
    const bloodId = maxBloodId + 1;

    // 29. POST: Create a new blood sample without deliveryId
    console.log("[TEST] POST create new blood sample");
    const bloodData = {
        bloodId,
        bloodType: "A+",
        deliveryId: null,
    };
    const resCreateBlood = await request("POST", "blood", "/", bloodData);
    expect(resCreateBlood.status).toBe(201);
    console.log("[TEST] Created blood sample with ID:", bloodId);

    // 30. POST: Create a new delivery
    console.log("[TEST] POST create new delivery");
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

    // 31. POST: Add participant to delivery
    console.log("[TEST] POST add participant to delivery");
    const participantData = {
        deliveryId,
        userId: userId
    };
    const resAddParticipant = await request("POST", "deliveries", `/participation`, participantData);
    expect(resAddParticipant.status).toBe(201);
    console.log("[TEST] Added participant to delivery");

    // 32. GET: check delivery by user ID
    console.log("[TEST] GET delivery by user ID");
    const resGetDeliveryByUser = await request("GET", "users", `/${userId}/deliveries`);
    expect(resGetDeliveryByUser.status).toBe(200);
    const deliveriesByUser = await resGetDeliveryByUser.json();
    expect(deliveriesByUser.length).toBeGreaterThan(0);
    const deliveryMatch = deliveriesByUser.find((d: any) => d.deliveryId === deliveryId);
    expect(deliveryMatch).toBeDefined();
    console.log("[TEST] Delivery found by user ID");

    // (now we delete everything we created)
    // 33. DELETE: Delete Participant from Delivery
    console.log("[TEST] DELETE participant from delivery");
    const resDeleteParticipant = await request("DELETE", "deliveries", `/participation`, participantData);
    expect(resDeleteParticipant.status).toBe(200);
    console.log("[TEST] Participant deleted from delivery");

    // 34. DELETE: Delete User
    console.log("[TEST] DELETE user");
    const resDeleteUser = await request("DELETE", "users", `/${userId}`);
    expect(resDeleteUser.status).toBe(200);
    console.log("[TEST] User deleted");

    // 35. DELETE: Delete Donation Center User
    console.log("[TEST] DELETE donation center user");
    const resDeleteUserDonation = await request("DELETE", "users", `/${userDonationId}`);
    expect(resDeleteUserDonation.status).toBe(200);
    console.log("[TEST] Donation center user deleted");

    // 36. DELETE: Delete Dronist User
    console.log("[TEST] DELETE dronist user");
    const resDeleteUserDronist = await request("DELETE", "users", `/${userDronistId}`);
    expect(resDeleteUserDronist.status).toBe(200);
    console.log("[TEST] Dronist user deleted");

    // 37. DELETE: Delete Support User
    console.log("[TEST] DELETE support user");
    const resDeleteUserSupport = await request("DELETE", "users", `/${userSupportId}`);
    expect(resDeleteUserSupport.status).toBe(200);
    console.log("[TEST] Support user deleted");

    // 38. DELETE: Delete Hospital User
    console.log("[TEST] DELETE hospital user");
    const resDeleteUserHospital = await request("DELETE", "users", `/${userHospitalId}`);
    expect(resDeleteUserHospital.status).toBe(200);
    console.log("[TEST] Hospital user deleted");

    // 39. GET: Verify user deletion
    console.log("[TEST] GET user after deletion (should be 404)");
    const resGetAfterDelete = await request("GET", "users", `/${userId}`);
    expect(resGetAfterDelete.status).toBe(404);
    console.log("[TEST] User not found after deletion");

    // 40. DELETE: Delete Blood Sample
    console.log("[TEST] DELETE blood sample");
    const resDeleteBlood = await request("DELETE", "blood", `/${bloodId}`);
    expect(resDeleteBlood.status).toBe(200);
    console.log("[TEST] Blood sample deleted");

    // 41. DELETE: Delete Delivery
    console.log("[TEST] DELETE delivery");
    const resDeleteDelivery = await request("DELETE", "deliveries", `/${deliveryId}`);
    expect(resDeleteDelivery.status).toBe(200);
    console.log("[TEST] Delivery deleted");

    // 42. DELETE: Delete Drone
    console.log("[TEST] DELETE drone");
    const resDeleteDrone = await request("DELETE", "drones", `/${droneId}`);
    expect(resDeleteDrone.status).toBe(200);
    console.log("[TEST] Drone deleted");

    // 43. DELETE: Delete Donation Center
    console.log("[TEST] DELETE donation center");
    const resDeleteCenter = await request("DELETE", "donation-centers", `/${centerId}`);
    expect(resDeleteCenter.status).toBe(200);
    console.log("[TEST] Donation center deleted");

    // 44. DELETE: Delete Hospital
    console.log("[TEST] DELETE hospital");
    const resDeleteHospital = await request("DELETE", "hospitals", `/${hospitalId}`);
    expect(resDeleteHospital.status).toBe(200);
    console.log("[TEST] Hospital deleted");

    console.log("[TEST] CRUD user test completed successfully");

});
