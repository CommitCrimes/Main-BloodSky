// services/delivery-validation.service.ts
import { db } from "../utils/db";
import { deliveries } from "../schemas/delivery";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { userHospital } from "../schemas/user_hospital";
import { userDonationCenter } from "../schemas/user_donation_center";
import { eq, and } from "drizzle-orm";
import { NotificationService } from "./notification.service";

export class DeliveryValidationService {
  /**
   * Hôpital -> passe en delivered si un participant appartient à l’hôpital de la livraison.
   */
  static async validateIfHospitalParticipant(deliveryId: number, userId: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [participation] = await tx
        .select()
        .from(deliveryParticipations)
        .where(and(
          eq(deliveryParticipations.deliveryId, deliveryId),
          eq(deliveryParticipations.userId, userId)
        ));
      if (!participation) return false;

      const [delivery] = await tx.select().from(deliveries).where(eq(deliveries.deliveryId, deliveryId));
      if (!delivery) return false;

      // Ne rien faire si déjà finalisé
      if (delivery.deliveryStatus === "delivered" || delivery.deliveryStatus === "cancelled") return false;
      if (!delivery.hospitalId) return false;

      const [membership] = await tx
        .select()
        .from(userHospital)
        .where(and(
          eq(userHospital.userId, userId),
          eq(userHospital.hospitalId, delivery.hospitalId)
        ));
      if (!membership) return false;

      await tx.update(deliveries)
        .set({ deliveryStatus: "delivered", dteValidation: new Date() })
        .where(eq(deliveries.deliveryId, deliveryId));

      if (delivery.hospitalId && delivery.centerId) {
        await NotificationService.notifyDeliveryStatusChange(
          deliveryId, "delivered", delivery.hospitalId, delivery.centerId
        );
      }
      return true;
    });
  }

  /**
   * Centre de don -> passe en charged si un participant appartient au centre de la livraison.
   */
  static async chargeIfCenterParticipant(deliveryId: number, userId: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [participation] = await tx
        .select()
        .from(deliveryParticipations)
        .where(and(
          eq(deliveryParticipations.deliveryId, deliveryId),
          eq(deliveryParticipations.userId, userId)
        ));
      if (!participation) return false;

      const [delivery] = await tx.select().from(deliveries).where(eq(deliveries.deliveryId, deliveryId));
      if (!delivery) return false;

      if (delivery.deliveryStatus === "delivered" || delivery.deliveryStatus === "cancelled") return false;

      if (delivery.deliveryStatus && delivery.deliveryStatus !== "pending" && delivery.deliveryStatus !== "charged") {
        return false;
      }

      if (!delivery.centerId) return false;

      const [membership] = await tx
        .select()
        .from(userDonationCenter)
        .where(and(
          eq(userDonationCenter.userId, userId),
          eq(userDonationCenter.centerId, delivery.centerId)
        ));
      if (!membership) return false;

      await tx.update(deliveries)
        .set({ deliveryStatus: "charged" }) // on ne touche pas dteValidation ici
        .where(eq(deliveries.deliveryId, deliveryId));

      if (delivery.hospitalId && delivery.centerId) {
        await NotificationService.notifyDeliveryStatusChange(
          deliveryId, "charged", delivery.hospitalId, delivery.centerId
        );
      }
      return true;
    });
  }

  /**
   * Essaie d’abord la validation hôpital (→ delivered), sinon centre (→ charged).
   * Retourne "delivered", "charged" ou null si aucun changement.
   */
  static async validateOnParticipation(deliveryId: number, userId: number): Promise<"delivered" | "charged" | null> {
    if (await this.validateIfHospitalParticipant(deliveryId, userId)) return "delivered";
    if (await this.chargeIfCenterParticipant(deliveryId, userId)) return "charged";
    return null;
  }

  // (optionnel) réconciliation totale pour both côtés
  static async reconcileAll(): Promise<{ validated: number; charged: number }> {
    let validated = 0;
    let charged = 0;
    const parts = await db.select().from(deliveryParticipations);
    for (const p of parts) {
      if (typeof p.deliveryId === "number" && typeof p.userId === "number") {
        const res = await this.validateOnParticipation(p.deliveryId, p.userId);
        if (res === "delivered") validated++;
        else if (res === "charged") charged++;
      }
    }
    return { validated, charged };
  }
}
