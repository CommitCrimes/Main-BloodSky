import { Hono } from "hono";
import { users } from "../schemas/user";
import { userDonationCenters } from "../schemas/user_donation_center";
import { userDronists } from "../schemas/user_dronist";
import { userSupportCenters } from "../schemas/user_support_center";
import { userHospitals } from "../schemas/user_hospital";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { db } from "../utils/db";
import { eq, and } from "drizzle-orm";

export const userRouter = new Hono();

//______________GET______________//

// GET all users
userRouter.get("/", async (c) => {
  const data = await db.select().from(users);
  return c.json(data);
});

// GET all users in donation centers
userRouter.get("/donation-  ", async (c) => {
  const data = await db.select().from(userDonationCenters);
  return c.json(data);
});

// GET all users in dronists
userRouter.get("/dronist", async (c) => {
  const data = await db.select().from(userDronists);
  return c.json(data);
});

// GET all users in support centers
userRouter.get("/support-center", async (c) => {
  const data = await db.select().from(userSupportCenters);
  return c.json(data);
});

// GET all users in hospitals
userRouter.get("/hospital", async (c) => {
  const data = await db.select().from(userHospitals);
  return c.json(data);
});

// GET users by ID
userRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const data = await db.select().from(users).where(eq(users.userId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET users by email
userRouter.get("/email/:email", async (c) => {
  const email = c.req.param("email");
  if (!email) return c.text("Email is required", 400);
  const data = await db.select().from(users).where(eq(users.email, email));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET users by name
userRouter.get("/name/:name", async (c) => {
  const name = c.req.param("name");
  if (!name) return c.text("Name is required", 400);
  const data = await db.select().from(users).where(eq(users.userName, name));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET users by donation center ID
userRouter.get("/donation-center/:centerId", async (c) => {
  const centerId = Number(c.req.param("centerId"));
  if (isNaN(centerId)) return c.text("Invalid center ID", 400);
  const data = await db
    .select()
    .from(userDonationCenters)
    .where(eq(userDonationCenters.centerId, centerId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET users by hospital ID
userRouter.get("/hospital/:hospitalId", async (c) => {
  const hospitalId = Number(c.req.param("hospitalId"));
  if (isNaN(hospitalId)) return c.text("Invalid hospital ID", 400);
  const data = await db
    .select()
    .from(userHospitals)
    .where(eq(userHospitals.hospitalId, hospitalId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET admin users in donation center
userRouter.get("/donation-center/:centerId/admins", async (c) => {
  const centerId = Number(c.req.param("centerId"));
  if (isNaN(centerId)) return c.text("Invalid center ID", 400);
  const data = await db
    .select()
    .from(userDonationCenters)
    .where(
      and(
        eq(userDonationCenters.centerId, centerId),
        eq(userDonationCenters.admin, true)
      )
    );
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET admin users in hospital
userRouter.get("/hospital/:hospitalId/admins", async (c) => {
  const hospitalId = Number(c.req.param("hospitalId"));
  if (isNaN(hospitalId)) return c.text("Invalid hospital ID", 400);
  const data = await db
    .select()
    .from(userHospitals)
    .where(
      and(
        eq(userHospitals.hospitalId, hospitalId),
        eq(userHospitals.admin, true)
      )
    );
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET delivery participations by user ID
userRouter.get("/:id/deliveries", async (c) => {
  const userId = Number(c.req.param("id"));
  if (isNaN(userId)) return c.text("Invalid user ID", 400);

  const participations = await db
    .select()
    .from(deliveryParticipations)
    .where(eq(deliveryParticipations.userId, userId));

  return c.json(participations);
});

//_______________POST______________//

// POST create user
userRouter.post("/", async (c) => {
  const user = await c.req.json();

  if (!user || !user.email || !user.userName) {
    return c.text("User data is required", 400);
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email));

  if (existingUser.length > 0) {
    return c.text("User already exists", 409);
  }

  const [newUser] = await db.insert(users).values(user).returning();
  return c.json(newUser, 201);
});

// POST create user then user in donation center
userRouter.post("/donation-center", async (c) => {
  const body = await c.req.json();
  const { user, centerId, admin, info } = body;

  // Insert user
  const [newUser] = await db.insert(users).values(user).returning();

  // Insert user in donation center
  await db.insert(userDonationCenters).values({
    userId: newUser.userId,
    centerId,
    admin,
    info,
  });

  return c.text("User created and added to donation center", 201);
});

// POST create user then user in hospital
userRouter.post("/hospital", async (c) => {
  const body = await c.req.json();
  const { user, hospitalId, admin, info } = body;

  // Insert user
  const [newUser] = await db.insert(users).values(user).returning();

  // Insert user in hospital
  await db.insert(userHospitals).values({
    userId: newUser.userId,
    hospitalId,
    admin,
    info,
  });

  return c.text("User created and added to hospital", 201);
});

// POST create user then user in dronist
userRouter.post("/dronist", async (c) => {
  const body = await c.req.json();
  const { user, info } = body;

  // Insert user
  const [newUser] = await db.insert(users).values(user).returning();

  // Insert user in dronist
  await db.insert(userDronists).values({
    userId: newUser.userId,
    info,
  });

  return c.text("User created and added to dronist", 201);
});

// POST create user then user in support center
userRouter.post("/support-center", async (c) => {
  const body = await c.req.json();
  const { user, info } = body;

  // Insert user
  const [newUser] = await db.insert(users).values(user).returning();

  // Insert user in support center
  await db.insert(userSupportCenters).values({
    userId: newUser.userId,
    info,
  });

  return c.text("User created and added to support center", 201);
});

//_______________PUT______________//

// PUT update user
userRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const user = await c.req.json();

  if (!user.email || !user.userName) {
    return c.text("User data is required", 400);
  }

  const updatedUser = await db
    .update(users)
    .set(user)
    .where(eq(users.userId, id))
    .returning();

  if (updatedUser.length === 0) return c.notFound();

  return c.json(updatedUser[0]);
});

// PUT update user then user in donation center
userRouter.put("/donation-center/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  const { centerId, admin, info } = body;

  // Update user
  await db.update(users).set(body.user).where(eq(users.userId, id));

  // Update user in donation center
  await db
    .update(userDonationCenters)
    .set({ centerId, admin, info })
    .where(eq(userDonationCenters.userId, id));

  return c.text("User and donation center updated");
});

// PUT update user then user in hospital
userRouter.put("/hospital/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  const { hospitalId, admin, info } = body;

  // Update user
  await db.update(users).set(body.user).where(eq(users.userId, id));

  // Update user in hospital
  await db
    .update(userHospitals)
    .set({ hospitalId, admin, info })
    .where(eq(userHospitals.userId, id));

  return c.text("User and hospital updated");
});

// PUT update user then user in dronist
userRouter.put("/dronist/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  const { info } = body;

  // Update user
  await db.update(users).set(body.user).where(eq(users.userId, id));

  // Update user in dronist
  await db
    .update(userDronists)
    .set({ info })
    .where(eq(userDronists.userId, id));

  return c.text("User and dronist updated");
});

// PUT update user then user in support center
userRouter.put("/support-center/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  const { info } = body;

  // Update user
  await db.update(users).set(body.user).where(eq(users.userId, id));

  // Update user in support center
  await db
    .update(userSupportCenters)
    .set({ info })
    .where(eq(userSupportCenters.userId, id));

  return c.text("User and support center updated");
});

//_______________DELETE______________//

// DELETE user by ID (and cascade delete from related tables)
userRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  // Delete user from all related tables
  await db
    .delete(userDonationCenters)
    .where(eq(userDonationCenters.userId, id));
  await db.delete(userDronists).where(eq(userDronists.userId, id));
  await db.delete(userSupportCenters).where(eq(userSupportCenters.userId, id));
  await db.delete(userHospitals).where(eq(userHospitals.userId, id));

  // Finally delete the user
  await db.delete(users).where(eq(users.userId, id));

  return c.text("User and related records deleted");
});
