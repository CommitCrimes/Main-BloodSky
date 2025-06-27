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

test("CRUD hospital", async () => {
    // 1. GET all hospitals to determine max ID
    console.log("[TEST] GET all hospitals");
    const resAll = await request("GET", "hospitals", "/");
    const all = await resAll.json();
    const maxId = all.reduce(
        (max: number, h: any) => Math.max(max, h.hospitalId),
        0
    );
    const hospitalId = maxId + 1;
    
    // 2. POST: Create a new hospital
    console.log("[TEST] POST create new hospital");
    const hospitalData = {
        hospitalId,
        hospitalName: "Test Hospital",
        hospitalCity: "Test City",
        hospitalPostal: 12345,
        hospitalAdress: "123 Test St",
        hospitalLatitude: null,
        hospitalLongitude: null
    };
    const resCreate = await request("POST", "hospitals", "/", hospitalData);
    expect(resCreate.status).toBe(201);
    console.log("[TEST] Created hospital with ID:", hospitalId);
    
    // 3. GET: Retrieve the hospital by ID
    console.log("[TEST] GET hospital by ID");
    const resGet = await request("GET", "hospitals", `/${hospitalId}`);
    expect(resGet.status).toBe(200);
    const fetched = await resGet.json();
    expect(fetched.hospitalName).toBe("Test Hospital");
    
    // 4. PUT: Update the hospital
    console.log("[TEST] PUT update hospital");
    const updatedHospitalData = {
        ...hospitalData,
        hospitalName: "Updated Hospital",
        hospitalCity: "Updated City",
        hospitalPostal: 54321,
        hospitalAdress: "321 Updated St"
    };
    const resUpdate = await request("PUT", "hospitals", `/${hospitalId}`, updatedHospitalData);
    expect(resUpdate.status).toBe(200);
    
    // 5. GET: Verify the update by retrieving the hospital by postal code
    console.log("[TEST] GET hospital by postal code");
    const resByPostal = await request("GET", "hospitals", `/postal/${updatedHospitalData.hospitalPostal}`);
    expect(resByPostal.status).toBe(200);
    
    const hospitalsByPostal = await resByPostal.json();
    expect(hospitalsByPostal.length).toBeGreaterThan(0);
    
    const postalMatch = hospitalsByPostal.find((h: any) => h.hospitalId === hospitalId);
    expect(postalMatch).toBeDefined();
    console.log("[TEST] Hospital found by postal code");

    // 6. DELETE: Remove the hospital
    console.log("[TEST] DELETE hospital");
    const resDelete = await request("DELETE", "hospitals", `/${hospitalId}`);
    expect(resDelete.status).toBe(200);
    console.log("[TEST] Hospital deleted successfully");

    // 7. GET: Verify deletion by trying to retrieve the hospital by ID
    console.log("[TEST] GET hospital after deletion (should be 404)");
    const resAfterDelete = await request("GET", "hospitals", `/${hospitalId}`);
    expect(resAfterDelete.status).toBe(404);
    console.log("[TEST] Hospital not found after deletion, as expected");

    console.log("[TEST] CRUD hospital test completed successfully");
});