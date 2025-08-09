import { Hono } from "hono";
import { db } from "../utils/db";
import { deliveries } from "../schemas/delivery";
import { authMiddleware, type JWTPayload } from "../utils/auth";
import { count, eq, sql, and } from "drizzle-orm";
import { userHospital } from "../schemas/user_hospital";
import { userDonationCenter } from "../schemas/user_donation_center";

type Variables = {
  user: JWTPayload;
};

export const dashboardRouter = new Hono<{ Variables: Variables }>();

dashboardRouter.use('/*', authMiddleware);

dashboardRouter.get("/delivery-stats", async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(user.userId);

    const hospitalUser = await db
      .select()
      .from(userHospital)
      .where(eq(userHospital.userId, userId))
      .limit(1);

    const centerUser = await db
      .select()
      .from(userDonationCenter)
      .where(eq(userDonationCenter.userId, userId))
      .limit(1);

    let whereCondition;
    if (hospitalUser.length > 0 && hospitalUser[0].hospitalId !== null) {
      whereCondition = eq(deliveries.hospitalId, hospitalUser[0].hospitalId);
    } else if (centerUser.length > 0 && centerUser[0].centerId !== null) {
      whereCondition = eq(deliveries.centerId, centerUser[0].centerId);
    } else {
      return c.json({ error: "Utilisateur non associé à une entité" }, 400);
    }

    const statusStats = await db
      .select({
        status: deliveries.deliveryStatus,
        count: count()
      })
      .from(deliveries)
      .where(whereCondition)
      .groupBy(deliveries.deliveryStatus);

    const formattedStats = [
      { 
        name: 'Réussies', 
        value: statusStats.find(s => s.status === 'delivered')?.count || 0, 
        color: '#10b981' 
      },
      { 
        name: 'En attente', 
        value: statusStats.find(s => s.status === 'pending')?.count || 0, 
        color: '#f59e0b' 
      },
      { 
        name: 'En transit', 
        value: statusStats.find(s => s.status === 'in_transit')?.count || 0, 
        color: '#3b82f6' 
      },
      { 
        name: 'Annulées', 
        value: statusStats.find(s => s.status === 'cancelled')?.count || 0, 
        color: '#ef4444' 
      },
    ].filter(stat => stat.value > 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyStats = await db
      .select({
        date: sql<string>`DATE(${deliveries.dteDelivery})`,
        count: count()
      })
      .from(deliveries)
      .where(
        and(
          whereCondition,
          sql`${deliveries.dteDelivery} >= ${sevenDaysAgo.toISOString()}`
        )
      )
      .groupBy(sql`DATE(${deliveries.dteDelivery})`)
      .orderBy(sql`DATE(${deliveries.dteDelivery})`);

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const deliveryData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const stat = weeklyStats.find(s => s.date === dateStr);
      deliveryData.push({
        name: dayName,
        livraisons: stat?.count || 0,
        echecs: 0 // TODOOOOOOOO: ajouter la logique pour les échecs
      });
    }

    return c.json({
      statusStats: formattedStats,
      deliveryData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return c.json({ error: "Erreur serveur" }, 500);
  }
});