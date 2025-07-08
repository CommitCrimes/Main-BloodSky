import { Hono } from "hono";
import { NotificationService } from "../services/notification.service";
import { authMiddleware, type JWTPayload } from "../utils/auth";

type Variables = {
  user: JWTPayload;
};

export const notificationRouter = new Hono<{ Variables: Variables }>();

notificationRouter.use('/*', authMiddleware);

notificationRouter.get("/", async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(user.userId);
    
    const limit = parseInt(c.req.query('limit') || '20');
    const notifications = await NotificationService.getUserNotifications(userId, limit);
    
    return c.json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return c.json({ error: "Erreur serveur" }, 500);
  }
});

// GET nombre de notifications non lues
notificationRouter.get("/unread-count", async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(user.userId);

    const unreadCount = await NotificationService.getUnreadCount(userId);
    
    return c.json({ unreadCount });
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    return c.json({ error: "Erreur serveur" }, 500);
  }
});

// POST marquer une notification comme lue
notificationRouter.post("/:id/read", async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(user.userId);
    const notificationId = parseInt(c.req.param('id'));
    
    if (isNaN(notificationId)) {
      return c.json({ error: "Paramètres invalides" }, 400);
    }

    await NotificationService.markAsRead(notificationId, userId);
    
    return c.json({ success: true, message: "Notification marquée comme lue" });
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    return c.json({ error: "Erreur serveur" }, 500);
  }
});

// POST marquer toutes les notifications comme lues
notificationRouter.post("/mark-all-read", async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(user.userId);
    
    // Récupérer toutes les notifications non lues de l'utilisateur
    const notifications = await NotificationService.getUserNotifications(userId, 1000);
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Marquer chacune comme lue
    await Promise.all(
      unreadNotifications.map(notification => 
        NotificationService.markAsRead(notification.notificationId, userId)
      )
    );
    
    return c.json({ success: true, message: "Toutes les notifications ont été marquées comme lues" });
  } catch (error) {
    console.error('Erreur lors du marquage global comme lu:', error);
    return c.json({ error: "Erreur serveur" }, 500);
  }
});