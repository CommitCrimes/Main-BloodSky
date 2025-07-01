import { Hono } from "hono";
import { bloods } from "../schemas/blood";
import { db } from "../utils/db";
import { eq } from "drizzle-orm";

export const bloodRouter = new Hono();

// GET all blood samples
bloodRouter.get("/", async (c) => {
  const data = await db.select().from(bloods);
  return c.json(data);
});

// GET by blood ID
bloodRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const data = await db.select().from(bloods).where(eq(bloods.bloodId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET by delivery ID
bloodRouter.get("/delivery/:deliveryId", async (c) => {
  const deliveryId = Number(c.req.param("deliveryId"));
  if (isNaN(deliveryId)) return c.text("Invalid delivery ID", 400);
  const data = await db
    .select()
    .from(bloods)
    .where(eq(bloods.deliveryId, deliveryId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET by blood type
bloodRouter.get("/type/:bloodType", async (c) => {
  const bloodType = c.req.param("bloodType");
  if (!bloodType) return c.text("Invalid blood type", 400);
  const data = await db
    .select()
    .from(bloods)
    .where(eq(bloods.bloodType, bloodType));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// POST create blood sample
bloodRouter.post("/", async (c) => {
  const body = await c.req.json();
  await db.insert(bloods).values(body);
  return c.text("Created", 201);
});

// PUT update blood sample
bloodRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  await db.update(bloods).set(body).where(eq(bloods.bloodId, id));
  return c.text("Updated");
});

// DELETE blood sample
bloodRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  await db.delete(bloods).where(eq(bloods.bloodId, id));
  return c.text("Deleted");
});