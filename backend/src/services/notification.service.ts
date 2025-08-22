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
      const [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return newNotification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw new Error('Impossible de créer la notification');
    }
  }

  static async createNotificationForCenter(centerId: number, notification: Omit<NewNotification, 'centerId'>) {
    try {
      const centerUsers = await db
        .select({ userId: userDonationCenter.userId })
        .from(userDonationCenter)
        .where(eq(userDonationCenter.centerId, centerId));

      const notificationPromises = centerUsers.map(user => 
        this.createNotification({
          ...notification,
          userId: user.userId,
          centerId
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Erreur lors de la création des notifications pour le centre:', error);
      throw new Error('Impossible de créer les notifications pour le centre');
    }
  }

  static async createNotificationForDronist(notification: Omit<NewNotification, 'userId'>, deliveryId?: number) {
    try {
      let dronistUsers;

      if (deliveryId) {
        dronistUsers = await db
          .select({ userId: deliveryParticipations.userId })
          .from(deliveryParticipations)
          .where(eq(deliveryParticipations.deliveryId, deliveryId));
      } else {
        dronistUsers = await db
          .select({ userId: userDronists.userId })
          .from(userDronists);
      }

      const notificationPromises = dronistUsers.map(user =>
        this.createNotification({
          ...notification,
          userId: user.userId
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("Erreur lors de la création des notifications pour les dronistes:", error);
      throw new Error("Impossible de créer les notifications pour les dronistes");
    }
  }

  static async notifyDeliveryRequest(hospitalId: number, centerId: number, deliveryId: number, bloodType: string, quantity: number, isUrgent: boolean) {
    try {
      const hospital = await db
        .select()
        .from(hospitals)
        .where(eq(hospitals.hospitalId, hospitalId))
        .limit(1);

      if (!hospital.length) {
        throw new Error('Hôpital non trouvé');
      }

      const hospitalInfo = hospital[0];
      const urgentText = isUrgent ? " URGENTE" : "";
      const priorityLevel = isUrgent ? "urgent" : "high";

      await this.createNotificationForCenter(centerId, {
        type: 'delivery_request',
        title: `Nouvelle demande de livraison${urgentText}`,
        message: `L'hôpital ${hospitalInfo.hospitalName} a demandé ${quantity} poche(s) de sang ${bloodType}${urgentText}. Commande #${deliveryId}`,
        priority: priorityLevel,
        deliveryId,
        hospitalId
      });

      await this.createNotificationForDronist({
        type: 'delivery_request',
        title: `Nouvelle demande de livraison${urgentText}`,
        message: `L'hôpital ${hospitalInfo.hospitalName} a demandé ${quantity} poche(s) de sang ${bloodType}${urgentText}. Commande #${deliveryId}`,
        priority: priorityLevel,
        deliveryId,
        hospitalId,
        centerId
      });

      console.log(`Notification envoyée au centre ${centerId} pour la demande de livraison #${deliveryId}`);
    } catch (error) {
      console.error('Erreur lors de la notification de demande de livraison:', error);
      throw error;
    }
  }

  static async notifyDeliveryStatusChange(deliveryId: number, newStatus: string, hospitalId: number, centerId: number) {
    try {
      let title: string;
      let message: string;
      let priority: string = 'medium';

      switch (newStatus) {
        case 'in_transit':
          title = 'Livraison en cours';
          message = `La livraison #${deliveryId} est maintenant en transit vers l'hôpital.`;
          priority = 'high';
          break;
        case 'delivered':
          title = 'Livraison effectuée';
          message = `La livraison #${deliveryId} a été livrée avec succès.`;
          priority = 'medium';
          break;
        case 'cancelled':
          title = 'Livraison annulée';
          message = `La livraison #${deliveryId} a été annulée.`;
          priority = 'high';
          break;
        default:
          title = 'Mise à jour de livraison';
          message = `Le statut de la livraison #${deliveryId} a été mis à jour: ${newStatus}`;
      }

      await this.createNotificationForCenter(centerId, {
        type: 'delivery_status',
        title,
        message,
        priority,
        deliveryId,
        hospitalId
      });

      await this.createNotificationForHospital(hospitalId, {
        type: 'delivery_status',
        title,
        message,
        priority,
        deliveryId,
        centerId
      });

      await this.createNotificationForDronist({
        type: 'delivery_status',
        title,
        message,
        priority,
        deliveryId,
        hospitalId,
        centerId
      }, deliveryId);

    } catch (error) {
      console.error('Erreur lors de la notification de changement de statut:', error);
      throw error;
    }
  }

  static async createNotificationForHospital(hospitalId: number, notification: Omit<NewNotification, 'hospitalId'>) {
    try {
      const hospitalUsers = await db
        .select({ userId: userHospital.userId })
        .from(userHospital)
        .where(eq(userHospital.hospitalId, hospitalId));

      const notificationPromises = hospitalUsers.map(user => 
        this.createNotification({
          ...notification,
          userId: user.userId,
          hospitalId
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Erreur lors de la création des notifications pour l\'hôpital:', error);
      throw new Error('Impossible de créer les notifications pour l\'hôpital');
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
      console.error('Erreur lors de la récupération des notifications:', error);
      throw new Error('Impossible de récupérer les notifications');
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
      console.error('Erreur lors du marquage comme lu:', error);
      throw new Error('Impossible de marquer la notification comme lue');
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
            eq(notifications.isRead, false)
          )
        );
      return result.length;
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      throw new Error('Impossible de compter les notifications non lues');
    }
  }
}