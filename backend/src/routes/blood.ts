import { Hono } from "hono";
import { bloods } from "../schemas/blood";
import { deliveries } from "../schemas/delivery";
import { db } from "../utils/db";
import { eq, isNull, count, sql, inArray } from "drizzle-orm";
import { NotificationService } from "../services/notification.service";

export const bloodRouter = new Hono();

bloodRouter.get("/available", async (c) => {
  try {
    const availableBlood = await db
      .select()
      .from(bloods)
      .where(isNull(bloods.deliveryId));

    const stockByType = availableBlood.reduce((acc, blood) => {
      const type = blood.bloodType || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          bloodType: type,
          availableQuantity: 0,
          bloodIds: []
        };
      }
      acc[type].availableQuantity++;
      acc[type].bloodIds.push(blood.bloodId);
      return acc;
    }, {} as Record<string, { bloodType: string; availableQuantity: number; bloodIds: number[] }>);

    const stockArray = Object.values(stockByType);
    
    return c.json(stockArray);
  } catch (error) {
    console.error('Erreur lors de la récupération du stock disponible:', error);
    return c.text("Erreur serveur", 500);
  }
});

bloodRouter.get("/stats", async (c) => {
  try {
    const stats = await db
      .select({
        bloodType: bloods.bloodType,
        count: count()
      })
      .from(bloods)
      .where(isNull(bloods.deliveryId))
      .groupBy(bloods.bloodType);
    
    return c.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return c.text("Erreur serveur", 500);
  }
});

// GET all blood samples
bloodRouter.get("/", async (c) => {
  const data = await db.select().from(bloods);
  return c.json(data);
});

bloodRouter.get("/center/:centerId", async (c) => {
  try {
    const centerId = Number(c.req.param("centerId"));
    if (isNaN(centerId)) return c.text("Invalid center ID", 400);
    const bloodStock = await db
      .select()
      .from(bloods)
      .where(isNull(bloods.deliveryId));
    
    const stockByType = bloodStock.reduce((acc, blood) => {
      const type = blood.bloodType || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          bloodType: type,
          quantity: 0,
          bloodIds: []
        };
      }
      acc[type].quantity++;
      acc[type].bloodIds.push(blood.bloodId);
      return acc;
    }, {} as Record<string, { bloodType: string; quantity: number; bloodIds: number[] }>);
    
    return c.json(Object.values(stockByType));
  } catch (error) {
    console.error('Erreur lors de la récupération du stock du centre:', error);
    return c.text("Erreur serveur", 500);
  }
});

bloodRouter.post("/add-stock", async (c) => {
  try {
    const { bloodType, quantity, centerId } = await c.req.json();
    
    if (!bloodType || !quantity || quantity <= 0) {
      return c.json({ success: false, message: "Données invalides" }, 400);
    }
    
    const newBloods: typeof bloods.$inferSelect[] = [];
    for (let i = 0; i < quantity; i++) {
      const result = await db
        .insert(bloods)
        .values({
          bloodType: bloodType as string,
          deliveryId: null
        })
        .returning();
      newBloods.push(result[0]);
    }
    
    return c.json({
      success: true,
      message: `${quantity} poche(s) de sang ${bloodType} ajoutée(s)`,
      bloods: newBloods
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de stock:', error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
});

bloodRouter.post("/remove-stock", async (c) => {
  try {
    const { bloodType, quantity, centerId, reason } = await c.req.json();
    
    if (!bloodType || !quantity || quantity <= 0) {
      return c.json({ success: false, message: "Données invalides" }, 400);
    }
    
    const availableBlood = await db
      .select()
      .from(bloods)
      .where(sql`${bloods.bloodType} = ${bloodType} AND ${bloods.deliveryId} IS NULL`)
      .limit(quantity);
    
    if (availableBlood.length < quantity) {
      return c.json({
        success: false,
        message: `Stock insuffisant. Disponible: ${availableBlood.length}, Demandé: ${quantity}`
      }, 400);
    }
    
    const bloodIds = availableBlood.map(b => b.bloodId);
    await db
      .delete(bloods)
      .where(inArray(bloods.bloodId, bloodIds));
    
    return c.json({
      success: true,
      message: `${quantity} poche(s) de sang ${bloodType} retirée(s)`,
      reason
    });
  } catch (error) {
    console.error('Erreur lors du retrait de stock:', error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
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

// POST passer une commande
bloodRouter.post("/order", async (c) => {
  try {
    const orderRequest = await c.req.json();
    const { hospitalId, centerId, bloodType, quantity, isUrgent, notes } = orderRequest;

    // Validation des données
    if (!hospitalId || !centerId || !bloodType || !quantity) {
      return c.json({ success: false, message: "Données manquantes" }, 400);
    }

    const availableBlood = await db
      .select()
      .from(bloods)
      .where(sql`${bloods.bloodType} = ${bloodType} AND ${bloods.deliveryId} IS NULL`)
      .limit(quantity);

    if (availableBlood.length < quantity) {
      return c.json({ 
        success: false, 
        message: `Stock insuffisant. Disponible: ${availableBlood.length}, Demandé: ${quantity}` 
      }, 400);
    }

    // Prendre les IDs des poches de sang disponibles
    const bloodIds = availableBlood.map((blood: any) => blood.bloodId);
    
    const deliveryResult = await db
      .insert(deliveries)
      .values({
        droneId: null, // Drone par défaut
        bloodId: null,
        hospitalId,
        centerId,
        dteDelivery: new Date(),
        dteValidation: null,
        deliveryStatus: 'pending',
        deliveryUrgent: isUrgent
      })
      .returning({ deliveryId: deliveries.deliveryId });

    if (!deliveryResult.length) {
      return c.json({ success: false, message: "Erreur lors de la création de la livraison" }, 500);
    }

    const deliveryId = deliveryResult[0].deliveryId;

    await db
      .update(bloods)
      .set({ deliveryId })
      .where(inArray(bloods.bloodId, bloodIds));

    // Envoyer notification au centre de donation et aux dronistes
    try {
      await NotificationService.notifyDeliveryRequest(
        hospitalId,
        centerId,
        deliveryId,
        bloodType,
        quantity,
        isUrgent
      );
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
    }

    return c.json({
      success: true,
      deliveryId,
      message: `Commande créée avec succès. ${quantity} poche(s) de sang ${bloodType} assignée(s).`,
      bloodIds
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
});

// POST annuler une commande en attente
bloodRouter.post("/cancel-order/:deliveryId", async (c) => {
  try {
    const deliveryId = Number(c.req.param("deliveryId"));
    if (isNaN(deliveryId)) {
      return c.json({ success: false, message: "ID de livraison invalide" }, 400);
    }

    // Vérifier que la livraison existe et est en attente
    const delivery = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.deliveryId, deliveryId))
      .limit(1);

    if (!delivery.length) {
      return c.json({ success: false, message: "Livraison non trouvée" }, 404);
    }

    if (delivery[0].deliveryStatus !== 'pending') {
      return c.json({
        success: false,
        message: "Seules les commandes en attente peuvent être annulées"
      }, 400);
    }

    // Notifier l'annulation aux centres, hôpitaux et dronistes
    try {
      await NotificationService.notifyDeliveryStatusChange(
        deliveryId,
        'cancelled',
        delivery[0].hospitalId!,
        delivery[0].centerId!
      );
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification d\'annulation:', notificationError);
    }

    // Remettre les poches de sang dispo
    await db
      .update(bloods)
      .set({ deliveryId: null })
      .where(eq(bloods.deliveryId, deliveryId));

    await db
      .delete(deliveries)
      .where(eq(deliveries.deliveryId, deliveryId));

    return c.json({
      success: true,
      message: "Commande annulée avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
});

// POST accepter ou refuser une commande
bloodRouter.post("/status-update/:deliveryId", async (c) => {
  try {
    const deliveryId = Number(c.req.param("deliveryId"));
    if (isNaN(deliveryId)) {
      return c.json({ success: false, message: "ID de livraison invalide" }, 400);
    }

    const { status } = await c.req.json();
    const validStatuses = ['accepted_center', 'refused_center', 'accepted_dronist', 'refused_dronist'];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, message: "Statut invalide" }, 400);
    }

    const delivery = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.deliveryId, deliveryId))
      .limit(1);

    if (!delivery.length) {
      return c.json({ success: false, message: "Livraison non trouvée" }, 404);
    }

    await db
      .update(deliveries)
      .set({ deliveryStatus: status })
      .where(eq(deliveries.deliveryId, deliveryId));

    try {
      await NotificationService.notifyDeliveryStatusChange(
        deliveryId,
        status,
        delivery[0].hospitalId!,
        delivery[0].centerId!,
      );
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification de statut:', notificationError);
    }

    return c.json({ success: true, message: 'Statut mis à jour', status });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return c.json({ success: false, message: "Erreur serveur" }, 500);
  }
});

// DELETE blood sample
bloodRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);
  await db.delete(bloods).where(eq(bloods.bloodId, id));
  return c.text("Deleted");
});