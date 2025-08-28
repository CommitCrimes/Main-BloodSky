import { Hono } from "hono";
import { deliveries } from "../schemas/delivery";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { db } from "../utils/db";
import { eq, and } from "drizzle-orm";
import { NotificationService } from "../services/notification.service";
import { DeliveryValidationService } from "../services/delivery-validation.service";


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

// GET by center ID (and include participants for each delivery)
deliveryRouter.get('/center/:centerId', async (c) => {
  const centerId = Number(c.req.param('centerId'));
  if (isNaN(centerId)) return c.text('Invalid center ID', 400);

  const deliveriesData = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.centerId, centerId));

  if (deliveriesData.length === 0) return c.notFound();

  const withParticipants = await Promise.all(
    deliveriesData.map(async (delivery) => {
      const participants = await db
        .select()
        .from(deliveryParticipations)
        .where(eq(deliveryParticipations.deliveryId, delivery.deliveryId));
      return { ...delivery, participants };
    })
  );

  return c.json(withParticipants);
});


// GET by drone ID (and include participants for each delivery)
deliveryRouter.get("/drone/:droneId", async (c) => {
  const droneId = Number(c.req.param("droneId"));
  if (isNaN(droneId)) return c.text("Invalid drone ID", 400);

  const deliveriesData = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.droneId, droneId));
  if (deliveriesData.length === 0) return c.notFound();

  // For each delivery, fetch participants
  const deliveriesWithParticipants = await Promise.all(
    deliveriesData.map(async (delivery) => {
      const participants = await db
        .select()
        .from(deliveryParticipations)
        .where(eq(deliveryParticipations.deliveryId, delivery.deliveryId));
      return { ...delivery, participants };
    })
  );

  return c.json(deliveriesWithParticipants);
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
    const validated = await DeliveryValidationService.validateIfHospitalParticipant(deliveryId, userId);
    if (validated) {
      return c.text("User added to delivery and delivery validated", 201);
    }
    return c.text("User added to delivery (no validation applied)", 201);
  } catch (err) {
    console.error(err);
    return c.text("Failed to add user to delivery", 500);
  }
});

// PUT update delivery (MAJ partielle: status, dteValidation, droneId)
deliveryRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const body = await c.req.json() as Partial<{
    deliveryStatus: string;
    dteValidation: string | null;
    droneId: number | null;
  }>;
  const patch: Record<string, unknown> = {};
  if (typeof body.deliveryStatus === "string") {
    patch.deliveryStatus = body.deliveryStatus;
  }
  // ne modifier la date que si la clé est bien présente dans le body
  if (Object.prototype.hasOwnProperty.call(body, "dteValidation")) {
    patch.dteValidation =
      body.dteValidation === null
        ? null
        : (body.dteValidation !== undefined ? new Date(body.dteValidation) : undefined);
  }
  // assignation / désassignation du drone
  if (Object.prototype.hasOwnProperty.call(body, "droneId")) {
    patch.droneId = body.droneId === null ? null : Number(body.droneId);
  }
  if (Object.keys(patch).length === 0) {
    return c.text("No fields to update", 400);
  }
  await db.update(deliveries).set(patch).where(eq(deliveries.deliveryId, id));
  const [delivery] = await db
    .select({ hospitalId: deliveries.hospitalId, centerId: deliveries.centerId })
    .from(deliveries)
    .where(eq(deliveries.deliveryId, id));

  if (body.deliveryStatus && delivery?.hospitalId && delivery?.centerId) {
    await NotificationService.notifyDeliveryStatusChange(
      id,
      body.deliveryStatus,
      delivery.hospitalId,
      delivery.centerId
    );
  }
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

