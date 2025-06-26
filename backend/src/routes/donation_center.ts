import { Hono } from "hono";
import { donationCenters } from "../schemas/donation_center";
import { db } from "../utils/db";
import { eq } from "drizzle-orm";

export const donationCenterRouter = new Hono();

// GET all donation centers
donationCenterRouter.get("/", async (c) => {
  const data = await db.select().from(donationCenters);
  return c.json(data);
});

// GET by center ID
donationCenterRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const data = await db
    .select()
    .from(donationCenters)
    .where(eq(donationCenters.centerId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// POST create donation center
donationCenterRouter.post("/", async (c) => {
  const body = await c.req.json();
  await db.insert(donationCenters).values(body);
  return c.text("Created", 201);
});

// PUT update donation center
donationCenterRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  await db
    .update(donationCenters)
    .set(body)
    .where(eq(donationCenters.centerId, id));
  return c.text("Updated");
});

// DELETE donation center
donationCenterRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  await db.delete(donationCenters).where(eq(donationCenters.centerId, id));
  return c.text("Deleted");
});

// GET donation centers by postal code
donationCenterRouter.get("/postal/:postal", async (c) => {
  const postal = Number(c.req.param("postal"));
  if (isNaN(postal)) return c.text("Invalid postal code", 400);
  const data = await db
    .select()
    .from(donationCenters)
    .where(eq(donationCenters.centerPostal, postal));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});
