import { db } from "../utils/db";
import { notifications, type NewNotification } from "../schemas/notification";
import { hospitals } from "../schemas/hospital";
import { donationCenters } from "../schemas/donation_center";
import { userHospital } from "../schemas/user_hospital";
import { userDonationCenter } from "../schemas/user_donation_center";
import { userDronists } from "../schemas/user_dronist";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { eq, and, desc } from "drizzle-orm";

export class NotificationService {
  static async createNotification(notification: NewNotification) {
    try {
      if (notification.type === "cancelled" && notification.deliveryId) {
        const existing = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.deliveryId, notification.deliveryId),
              eq(notifications.type, "cancelled"),
              ...(notification.userId
                ? [eq(notifications.userId, notification.userId)]
                : []),
            ),
          )
          .limit(1);
        if (existing.length > 0) {
          return existing[0];
        }
      }
      const [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return newNotification;
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
      throw new Error("Impossible de créer la notification");
    }
  }

  static async createNotificationForAllDronists(
    notification: Omit<NewNotification, "userId">
  ) {
    try {
      const rows = await db
        .select({ userId: userDronists.userId })
        .from(userDronists);

      const ids = Array.from(new Set(rows.map(r => r.userId)));

      await Promise.all(
        ids.map(userId =>
          this.createNotification({ ...notification, userId })
        )
      );
    } catch (error) {
      console.error("Erreur notifications dronists:", error);
      throw new Error("Impossible de créer les notifications dronists");
    }
  }

  static async createNotificationForCenter(
    centerId: number,
    notification: Omit<NewNotification, "centerId">,
    excludeUserId?: number
  ) {
    try {
      const centerUsers = await db
        .select({ userId: userDonationCenter.userId })
        .from(userDonationCenter)
        .where(eq(userDonationCenter.centerId, centerId));

      const filteredUsers = excludeUserId
        ? centerUsers.filter(user => user.userId !== excludeUserId)
        : centerUsers;

      const notificationPromises = filteredUsers.map((user) =>
        this.createNotification({
          ...notification,
          userId: user.userId,
          centerId,
        }),
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error(
        "Erreur lors de la création des notifications pour le centre:",
        error,
      );
      throw new Error("Impossible de créer les notifications pour le centre");
    }
  }

  static async createNotificationForDronist(
    notification: Omit<NewNotification, "userId">,
    deliveryId?: number,
    excludeUserId?: number
  ) {
    try {
      let dronistUsers;

      if (deliveryId) {
        dronistUsers = await db
          .select({ userId: userDronists.userId })
          .from(userDronists)

        // If no dronists have yet participated in this delivery,
        // fall back to notifying all dronists.
        if (dronistUsers.length === 0) {
          dronistUsers = await db
            .select({ userId: userDronists.userId })
            .from(userDronists);
        }
      } else {
        dronistUsers = await db
          .select({ userId: userDronists.userId })
          .from(userDronists);
      }

      const filteredUsers = excludeUserId
        ? dronistUsers.filter(user => user.userId !== excludeUserId)
        : dronistUsers;

      const notificationPromises = filteredUsers.map((user) =>
        this.createNotification({
          ...notification,
          userId: user.userId,
        }),
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error(
        "Erreur lors de la création des notifications pour les dronistes:",
        error,
      );
      throw new Error(
        "Impossible de créer les notifications pour les dronistes",
      );
    }
  }

  static async notifyDeliveryRequest(
    hospitalId: number,
    centerId: number,
    deliveryId: number,
    bloodType: string,
    quantity: number,
    isUrgent: boolean,
  ) {
    try {
      const hospital = await db
        .select()
        .from(hospitals)
        .where(eq(hospitals.hospitalId, hospitalId))
        .limit(1);

      if (!hospital.length) {
        throw new Error("Hôpital non trouvé");
      }

      const hospitalInfo = hospital[0];
      const urgentText = isUrgent ? " URGENTE" : "";
      const priorityLevel = isUrgent ? "urgent" : "high";

      // Always notify the center
      await this.createNotificationForCenter(centerId, {
        type: "delivery_request",
        title: `Nouvelle demande de livraison${urgentText}`,
        message: `L'hôpital ${hospitalInfo.hospitalName} a demandé ${quantity} poche(s) de sang ${bloodType}${urgentText}. Commande #${deliveryId}`,
        priority: priorityLevel,
        deliveryId,
        hospitalId,
      });

      // Notify dronists: participants-if-any, else all dronists (includes centerId in payload)
      await this.createNotificationForDronist({
        type: "delivery_request",
        title: `Nouvelle demande de livraison${urgentText}`,
        message: `L'hôpital ${hospitalInfo.hospitalName} a demandé ${quantity} poche(s) de sang ${bloodType}${urgentText}. Commande #${deliveryId}`,
        priority: priorityLevel,
        deliveryId,
        hospitalId,
        centerId,
      }, deliveryId);

      console.log(
        `Notification envoyée au centre ${centerId} et aux dronists pour la demande de livraison #${deliveryId}`,
      );
    } catch (error) {
      console.error(
        "Erreur lors de la notification de demande de livraison:",
        error,
      );
      throw error;
    }
  }

  static async notifyDeliveryStatusChange(
    deliveryId: number,
    newStatus: string,
    hospitalId: number,
    centerId: number,
    actingUserId?: number
  ) {
    try {
      let title: string;
      let message: string;
      let priority: string = "medium";

      switch (newStatus) {
        case "in_transit":
          title = "Livraison en cours";
          message = `La livraison #${deliveryId} est maintenant en transit vers l'hôpital.`;
          priority = "high";
          break;
        case "charged":
          title = "Livraison chargée";
          message = `La livraison #${deliveryId} Peut maintenant décoler.`;
          priority = "high";
          break;
        case "delivered":
          title = "Livraison effectuée";
          message = `La livraison #${deliveryId} a été livrée avec succès.`;
          priority = "medium";
          break;
        case "cancelled":
          title = "Livraison annulée";
          message = `La livraison #${deliveryId} a été annulée.`;
          priority = "high";
          break;
        case "accepted_center":
          title = "Demande acceptée par le centre";
          message = `Le centre a accepté la commande #${deliveryId}.`;
          priority = "high";
          break;
        case "refused_center":
          title = "Demande refusée par le centre";
          message = `Le centre a refusé la commande #${deliveryId}.`;
          priority = "high";
          break;
        case "accepted_dronist":
          title = "Livraison acceptée par le droniste";
          message = `Un droniste a accepté la livraison #${deliveryId}.`;
          priority = "medium";
          break;
        case "refused_dronist":
          title = "Livraison refusée par le droniste";
          message = `Un droniste a refusé la livraison #${deliveryId}.`;
          priority = "high";
          break;
        default:
          title = "Mise à jour de livraison";
          message = `Le statut de la livraison #${deliveryId} a été mis à jour: ${newStatus}`;
      }

      const centerActionStatuses = ["accepted_center", "refused_center"];
      const dronistActionStatuses = ["accepted_dronist", "refused_dronist"];

      if (dronistActionStatuses.includes(newStatus)) {
        await this.createNotificationForCenter(centerId, {
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          hospitalId,
        }, actingUserId);

        await this.createNotificationForHospital(hospitalId, {
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          centerId,
        }, actingUserId);

      } else if (centerActionStatuses.includes(newStatus)) {
        await this.createNotificationForHospital(hospitalId, {
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          centerId,
        }, actingUserId);

        await this.createNotificationForDronist({
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          hospitalId,
          centerId,
        }, deliveryId, actingUserId);
      } else {
        await this.createNotificationForCenter(centerId, {
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          hospitalId,
        }, actingUserId);

        await this.createNotificationForHospital(hospitalId, {
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          centerId,
        }, actingUserId);

        await this.createNotificationForDronist({
          type: newStatus,
          title,
          message,
          priority,
          deliveryId,
          hospitalId,
          centerId,
        }, deliveryId, actingUserId);
      }

      // Extra broadcast from dev: when mission gets validated/approved, notify all dronists
      if (newStatus === "validated" || newStatus === "approved") {
        await this.createNotificationForAllDronists({
          type: "mission_update",
          title: "Mission validée",
          message: `Commande #${deliveryId} — mission confirmée.`,
          priority: "high",
          deliveryId,
          hospitalId,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la notification de changement de statut:",
        error,
      );
      throw error;
    }
  }

  static async createNotificationForHospital(
    hospitalId: number,
    notification: Omit<NewNotification, "hospitalId">,
    excludeUserId?: number
  ) {
    try {
      const hospitalUsers = await db
        .select({ userId: userHospital.userId })
        .from(userHospital)
        .where(eq(userHospital.hospitalId, hospitalId));

      const filteredUsers = excludeUserId
        ? hospitalUsers.filter(user => user.userId !== excludeUserId)
        : hospitalUsers;

      const notificationPromises = filteredUsers.map((user) =>
        this.createNotification({
          ...notification,
          userId: user.userId,
          hospitalId,
        }),
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error(
        "Erreur lors de la création des notifications pour l'hôpital:",
        error,
      );
      throw new Error("Impossible de créer les notifications pour l'hôpital");
    }
  }

  static async getUserNotifications(userId: number, limit: number = 20) {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw new Error("Impossible de récupérer les notifications");
    }
  }

  static async markAsRead(notificationId: number, userId: number) {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(
          and(
            eq(notifications.notificationId, notificationId),
            eq(notifications.userId, userId)
          )
        );
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      throw new Error("Impossible de marquer la notification comme lue");
    }
  }

  static async getUnreadCount(userId: number) {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        );
      return result.length;
    } catch (error) {
      console.error(
        "Erreur lors du comptage des notifications non lues:",
        error,
      );
      throw new Error("Impossible de compter les notifications non lues");
    }
  }
}
