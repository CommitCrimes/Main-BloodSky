import { test, expect } from "bun:test";
import * as bcrypt from 'bcrypt';
import exp from "constants";

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
    const resAll = await request("GET", "deliveries", "/");
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
    const maxcenterId = donationCenters.reduce(
        (max: number, d: any) => Math.max(max, d.centerId),
        0
    );
    const centerId = maxcenterId + 1;

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

    // 7. POST: Créer un nouvel donation center de test
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

    // 8. POST: Créer un nouvel hospital
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

    // 9. POST: Créer un user de donation center
    console.log("[TEST] POST create donation center user");
    const userDonationCenterData = {
        user:{
            userId: userIdDonationCenter,
            email: "testDonation12702410864238213123OYT213IUG211219462018745@bloodsky.fr",
            password: await bcrypt.hash("Test", 10),
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

    // 10. POST: Créer un user de hospital
    console.log("[TEST] POST create hospital user");
    const userHospitalData = {
        user:{
            userId: userIdHospital,
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
    console.log("[TEST] Created hospital user");

    // 11. POST: Créer un user de dronist
    console.log("[TEST] POST create dronist user");
    const userDronistData = {
        user:{
            userId: userIdDrone,
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
    console.log("[TEST] Created dronist user");

    // 12. POST: Créer un drone
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

    // 13. POST: Créer un blood sample
    console.log("[TEST] POST create blood sample");
    const bloodSampleData = {
        bloodId,
        bloodType: "A+",
        deliveryId: null
    };
    const resCreateBloodSample = await request("POST", "blood", "/", bloodSampleData);
    expect(resCreateBloodSample.status).toBe(201);
    console.log("[TEST] Created blood sample");

    // 13. POST: Créer une livraison
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

    // 14. GET: get delivery by deliveryId
    console.log("[TEST] GET delivery by deliveryId");
    const resByDeliveryId = await request("GET", "deliveries", `/${deliveryId}`);
    expect(resByDeliveryId.status).toBe(200);

    const fetchedDelivery = await resByDeliveryId.json();
    expect(fetchedDelivery.deliveryId).toBe(deliveryId);
    expect(fetchedDelivery.droneId).toBe(droneId);
    expect(fetchedDelivery.bloodId).toBe(bloodId);
    expect(fetchedDelivery.hospitalId).toBe(hospitalId);
    expect(fetchedDelivery.centerId).toBe(centerId);
    expect(fetchedDelivery.deliveryStatus).toBe("testStatus");
    expect(fetchedDelivery.deliveryUrgent).toBe(false);
    expect(fetchedDelivery.participants).toEqual([]);

    // 15. POST: Ajouter les participants à la livraison
    console.log("[TEST] POST add participants to delivery");
    const participationDataDonationCenter = {
        deliveryId,
        userId: userIdDonationCenter
    };
    const resAddParticipantDonationCenter = await request("POST", "deliveries/participation", "/", participationDataDonationCenter);
    expect(resAddParticipantDonationCenter.status).toBe(201);
    const addedParticipantDonationCenter = await resAddParticipantDonationCenter.text();
    console.log("[TEST] Added participant from donation center:", addedParticipantDonationCenter);
    const participationDataHospital = {
        deliveryId,
        userId: userIdHospital
    };
    const resAddParticipantHospital = await request("POST", "deliveries/participation", "/", participationDataHospital);
    expect(resAddParticipantHospital.status).toBe(201);
    const addedParticipantHospital = await resAddParticipantHospital.text();
    console.log("[TEST] Added participant from hospital:", addedParticipantHospital);
    const participationDataDronist = {
        deliveryId,
        userId: userIdDrone
    };
    const resAddParticipantDronist = await request("POST", "deliveries/participation", "/", participationDataDronist);
    expect(resAddParticipantDronist.status).toBe(201);
    const addedParticipantDronist = await resAddParticipantDronist.text();
    console.log("[TEST] Added participant from dronist:", addedParticipantDronist);

    // 16. GET: get delivery by droneId
    console.log("[TEST] GET delivery by droneId");
    const resByDroneId = await request("GET", "deliveries/drone", `/${droneId}`);
    expect(resByDroneId.status).toBe(200);
    const fetchedDeliveriesByDrone = await resByDroneId.json();

    // Vérifie qu'on a bien un tableau
    expect(Array.isArray(fetchedDeliveriesByDrone)).toBe(true);

    // Récupère la livraison qu'on a créée
    const foundDelivery = fetchedDeliveriesByDrone.find((d: any) => d.deliveryId === deliveryId);
    expect(foundDelivery).toBeDefined();

    // check the participants
    expect(foundDelivery.participants).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ userId: userIdDonationCenter }),
            expect.objectContaining({ userId: userIdHospital }),
            expect.objectContaining({ userId: userIdDrone })
        ])
    );


    // 17. PUT: Mettre à jour la livraison (par exemple, changer le statut)
    console.log("[TEST] PUT update delivery status");
    const updatedDeliveryData = {
        deliveryId,
        droneId,
        bloodId,
        hospitalId,
        centerId,
        dteDelivery: null,
        dteValidation: null,
        deliveryStatus: "updatedTestStatus",
        deliveryUrgent: true,
        participants: [
            { deliveryId, userId: userIdDonationCenter },
            { deliveryId, userId: userIdHospital },
            { deliveryId, userId: userIdDrone }
        ]
    };
    const resUpdateDelivery = await request("PUT", "deliveries", `/${deliveryId}`, updatedDeliveryData);
    expect(resUpdateDelivery.status).toBe(200);
    console.log("[TEST] Updated delivery");

    // 18. GET: Vérifier que la livraison a bien été mise à jour
    console.log("[TEST] GET delivery by deliveryId after update");
    const resAfterUpdate = await request("GET", "deliveries", `/${deliveryId}`);
    expect(resAfterUpdate.status).toBe(200);
    const updatedDelivery = await resAfterUpdate.json();
    expect(updatedDelivery.deliveryStatus).toBe("updatedTestStatus");
    expect(updatedDelivery.deliveryUrgent).toBe(true);
    expect(updatedDelivery.participants).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ userId: userIdDonationCenter }),
            expect.objectContaining({ userId: userIdHospital }),
            expect.objectContaining({ userId: userIdDrone })
        ])
    );


    // 19. DELETE: Supprimer un des participants de la livraison
    console.log("[TEST] DELETE participant from delivery");
    const resDeleteParticipant = await request("DELETE", "deliveries", "/participation", {
        deliveryId,
        userId: userIdDonationCenter
    });
    expect(resDeleteParticipant.status).toBe(200);
    const deletedParticipantMessage = await resDeleteParticipant.text();
    console.log("[TEST] Deleted participant message:", deletedParticipantMessage);

    // 20. GET: Vérifier que le participant a bien été supprimé
    console.log("[TEST] GET delivery by deliveryId after participant deletion");
    const resAfterDeleteParticipant = await request("GET", "deliveries", `/${deliveryId}`);
    expect(resAfterDeleteParticipant.status).toBe(200);
    const deliveryAfterDeleteParticipant = await resAfterDeleteParticipant.json();
    expect(deliveryAfterDeleteParticipant.participants).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ userId: userIdHospital }),
            expect.objectContaining({ userId: userIdDrone })
        ])
    );

    // 21. DELETE: Supprimer le reste des participants
    console.log("[TEST] DELETE remaining participants from delivery");
    const resDeleteHospitalParticipant = await request("DELETE", "deliveries", "/participation", {
        deliveryId,
        userId: userIdHospital
    });
    expect(resDeleteHospitalParticipant.status).toBe(200);
    const deletedHospitalParticipantMessage = await resDeleteHospitalParticipant.text();
    console.log("[TEST] Deleted hospital participant message:", deletedHospitalParticipantMessage);
    const resDeleteDronistParticipant = await request("DELETE", "deliveries", "/participation", {
        deliveryId,
        userId: userIdDrone
    });
    expect(resDeleteDronistParticipant.status).toBe(200);
    const deletedDronistParticipantMessage = await resDeleteDronistParticipant.text();
    console.log("[TEST] Deleted dronist participant message:", deletedDronistParticipantMessage);

    // 22. DELETE: Supprimer la livraison (et tout le reste : drones, blood, users, donation centers, hospitals)
    console.log("[TEST] DELETE delivery");
    const resDeleteDelivery = await request("DELETE", "deliveries", `/${deliveryId}`);
    expect(resDeleteDelivery.status).toBe(200);

    // 23. GET: Vérifier que la livraison a bien été supprimée
    console.log("[TEST] GET delivery by deliveryId after deletion (should be 404)");
    const resAfterDeleteDelivery = await request("GET", "deliveries", `/${deliveryId}`);
    expect(resAfterDeleteDelivery.status).toBe(404);
    console.log("[TEST] Delivery successfully deleted");

    // 24. DELETE: Supprimer le drone
    console.log("[TEST] DELETE test drone");
    const resDeleteDrone = await request("DELETE", "drones", `/${droneId}`);
    expect(resDeleteDrone.status).toBe(200);

    // 25. DELETE: Supprimer le user de donation center
    console.log("[TEST] DELETE donation center user");
    const resDeleteUserDonationCenter = await request("DELETE", "users", `/${userIdDonationCenter}`);
    expect(resDeleteUserDonationCenter.status).toBe(200);

    // 26. DELETE: Supprimer le user de hospital
    console.log("[TEST] DELETE hospital user");
    const resDeleteUserHospital = await request("DELETE", "users", `/${userIdHospital}`);
    expect(resDeleteUserHospital.status).toBe(200);

    // 27. DELETE: Supprimer le user de dronist
    console.log("[TEST] DELETE dronist user");
    const resDeleteUserDronist = await request("DELETE", "users", `/${userIdDrone}`);
    expect(resDeleteUserDronist.status).toBe(200);

    // 28. DELETE: Supprimer le donation center
    console.log("[TEST] DELETE donation center");
    const resDeleteDonationCenter = await request("DELETE", "donation-centers", `/${centerId}`);
    expect(resDeleteDonationCenter.status).toBe(200);

    // 29. DELETE: Supprimer l'hospital
    console.log("[TEST] DELETE hospital");
    const resDeleteHospital = await request("DELETE", "hospitals", `/${hospitalId}`);
    expect(resDeleteHospital.status).toBe(200);

    // 30. DELETE: Supprimer le blood
    console.log("[TEST] DELETE blood sample");
    const resDeleteBlood = await request("DELETE", "blood", `/${bloodId}`);
    expect(resDeleteBlood.status).toBe(200);

    console.log("[TEST] All resources successfully deleted");

    console.log("[TEST] CRUD delivery test completed successfully");
});