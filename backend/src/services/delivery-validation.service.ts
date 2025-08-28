// services/delivery-validation.service.ts
import { db } from "../utils/db";
import { deliveries } from "../schemas/delivery";
import { deliveryParticipations } from "../schemas/delivery_participation";
import { userHospital } from "../schemas/user_hospital";
import { eq, and } from "drizzle-orm";
import { NotificationService } from "./notification.service";

export class DeliveryValidationService {
  /**
   * Valide une livraison si:
   * - une participation (deliveryId, userId) existe
   * - l'utilisateur appartient à l'hôpital de la livraison
   * - la livraison n'est pas déjà livrée/annulée
   * Retourne true si une validation a été effectuée.
   */
  static async validateIfHospitalParticipant(deliveryId: number, userId: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [participation] = await tx
        .select()
        .from(deliveryParticipations)
        .where(
          and(
            eq(deliveryParticipations.deliveryId, deliveryId),
            eq(deliveryParticipations.userId, userId)
          )
        );

      if (!participation) return false;
      const [delivery] = await tx
        .select()
        .from(deliveries)
        .where(eq(deliveries.deliveryId, deliveryId));

      if (!delivery) return false;
      if (delivery.deliveryStatus === "delivered" || delivery.deliveryStatus === "cancelled") {
        return false;
      }
      if (!delivery.hospitalId) return false;

      const [hospitalMembership] = await tx
        .select()
        .from(userHospital)
        .where(
          and(
            eq(userHospital.userId, userId),
            eq(userHospital.hospitalId, delivery.hospitalId)
          )
        );

      if (!hospitalMembership) return false;
      await tx
        .update(deliveries)
        .set({ deliveryStatus: "delivered", dteValidation: new Date() })
        .where(eq(deliveries.deliveryId, deliveryId));
      if (delivery.hospitalId && delivery.centerId) {
        await NotificationService.notifyDeliveryStatusChange(
          deliveryId,
          "delivered",
          delivery.hospitalId,
          delivery.centerId
        );
      }

      return true;
    });
  }

  /**
   * repasse toutes les participations et valide les livraisons éligibles.
   * enlevable
   */
  static async reconcileAll(): Promise<{ validated: number }> {
    let count = 0;

    // on parcourt toutes les participations
    const parts = await db.select().from(deliveryParticipations);

    for (const p of parts) {
      if (typeof p.deliveryId === "number" && typeof p.userId === "number") {
        const ok = await this.validateIfHospitalParticipant(p.deliveryId, p.userId);
        if (ok) count++;
      }
    }
    return { validated: count };
  }
}
