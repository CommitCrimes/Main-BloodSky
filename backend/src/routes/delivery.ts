import { Hono } from "hono";
import { deliveries } from "../schemas/delivery";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { db } from "../utils/db";
import { eq, and } from "drizzle-orm";

export const deliveryRouter = new Hono();

// GET all deliveries
deliveryRouter.get("/", async (c) => {
  const data = await db.select().from(deliveries);
  return c.json(data);
});

// GET by delivery ID (and include participants)
deliveryRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.deliveryId, id));
  if (!delivery) return c.notFound();

  const participants = await db
    .select()
    .from(deliveryParticipations)
    .where(eq(deliveryParticipations.deliveryId, id));

  return c.json({ ...delivery, participants });
});

// GET by drone ID
deliveryRouter.get("/drone/:droneId", async (c) => {
  const droneId = Number(c.req.param("droneId"));
  if (isNaN(droneId)) return c.text("Invalid drone ID", 400);
  const data = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.droneId, droneId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// POST create delivery
deliveryRouter.post("/", async (c) => {
  const body = await c.req.json();
  await db.insert(deliveries).values(body);
  return c.text("Created", 201);
});

// POST create delivery participation
deliveryRouter.post("/participation", async (c) => {
  const body = await c.req.json();
  const { deliveryId, userId } = body;

  if (!deliveryId || !userId) {
    return c.text("deliveryId and userId are required", 400);
  }

  try {
    await db.insert(deliveryParticipations).values({ deliveryId, userId });
    return c.text("User added to delivery", 201);
  } catch (err) {
    console.error(err);
    return c.text("Failed to add user to delivery", 500);
  }
});

// PUT update delivery
deliveryRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  await db.update(deliveries).set(body).where(eq(deliveries.deliveryId, id));
  return c.text("Updated");
});

// DELETE delivery participation
deliveryRouter.delete("/participation", async (c) => {
  const body = await c.req.json();
  const { deliveryId, userId } = body;

  if (!deliveryId || !userId) {
    return c.text("deliveryId and userId are required", 400);
  }

  try {
    const existing = await db
      .select()
      .from(deliveryParticipations)
      .where(and(
        eq(deliveryParticipations.deliveryId, deliveryId),
        eq(deliveryParticipations.userId, userId)
      ));

    if (existing.length === 0) {
      return c.text("Participation not found", 404);
    }

    await db
      .delete(deliveryParticipations)
      .where(and(
        eq(deliveryParticipations.deliveryId, deliveryId),
        eq(deliveryParticipations.userId, userId)
      ));

    return c.text("User removed from delivery", 200);
  } catch (err) {
    console.error(err);
    return c.text("Failed to remove user from delivery", 500);
  }
});


// DELETE delivery
deliveryRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  await db.delete(deliveries).where(eq(deliveries.deliveryId, id));
  return c.text("Deleted");
});

