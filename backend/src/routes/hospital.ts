import { Hono } from "hono";
import { hospitals } from "../schemas/hospital";
import { db } from "../utils/db";
import { eq, ilike  } from "drizzle-orm";

export const hospitalRouter = new Hono();

// GET all hospitals
hospitalRouter.get("/", async (c) => {
  const data = await db.select().from(hospitals);
  return c.json(data);
});

// POST create hospital
hospitalRouter.post("/", async (c) => {
  const body = await c.req.json();
  await db.insert(hospitals).values(body);
  return c.text("Created", 201);
});

// PUT update hospital
hospitalRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const body = await c.req.json();
  await db.update(hospitals).set(body).where(eq(hospitals.hospitalId, id));
  return c.text("Updated");
});

// DELETE hospital
hospitalRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  await db.delete(hospitals).where(eq(hospitals.hospitalId, id));
  return c.text("Deleted");
});

// GET hospitals by postal code
hospitalRouter.get("/postal/:postal", async (c) => {
  const postal = Number(c.req.param("postal"));
  if (isNaN(postal)) return c.text("Invalid postal code", 400);
  const data = await db
    .select()
    .from(hospitals)
    .where(eq(hospitals.hospitalPostal, postal));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET hospitals by city
hospitalRouter.get("/city/:city", async (c) => {
  const raw = c.req.param("city") ?? "";
  const city = raw.trim();
  if (!city) return c.text("City is required", 400);

  const data = await db
    .select()
    .from(hospitals)
    .where(ilike(hospitals.hospitalCity, `%${city}%`));

  return c.json(data); // [] si aucun résultat
});

// GET by hospital ID
hospitalRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  const data = await db
    .select()
    .from(hospitals)
    .where(eq(hospitals.hospitalId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

