import { useEffect, useState } from "react";
import { dronesApi } from "@/api/drone";
import type { DroneHistory } from "@/types/delivery";

interface GroupedDrone {
  droneId: number;
  droneName: string | null;
  droneStatus: string | null;
  centerCity: string | null;
  deliveries: {
    deliveryId: number;
    deliveryStatus: string;
    hospitalName: string | null;
    hospitalCity: string | null;
  }[];
}

const AdminDroneManagementPage = () => {
  const [drones, setDrones] = useState<GroupedDrone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const history = await dronesApi.getHistory();
        const grouped: Record<number, GroupedDrone> = {};

        (history as DroneHistory[]).forEach((row) => {
          if (!grouped[row.droneId]) {
            grouped[row.droneId] = {
              droneId: row.droneId,
              droneName: row.droneName,
              droneStatus: row.droneStatus,
              centerCity: row.centerCity,
              deliveries: [],
            };
          }

          if (row.deliveryId) {
            grouped[row.droneId].deliveries.push({
              deliveryId: row.deliveryId,
              deliveryStatus: row.deliveryStatus,
              hospitalName: row.hospitalName,
              hospitalCity: row.hospitalCity,
            });
          }
        });

        setDrones(Object.values(grouped));
      } catch (e) {
        console.error(e);
        setError("Impossible de récupérer les informations des drones");
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des drones</h1>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Centre</th>
            <th className="p-2 border">Statut</th>
            <th className="p-2 border">Livraison en cours</th>
          </tr>
        </thead>
        <tbody>
          {drones.map((drone) => {
            const currentDelivery = drone.deliveries.find(
              (d) => !["completed", "cancelled"].includes((d.deliveryStatus || "").toLowerCase())
            );

            return (
              <tr key={drone.droneId} className="text-center border-t">
                <td className="p-2 border">{drone.droneId}</td>
                <td className="p-2 border">{drone.droneName ?? "N/A"}</td>
                <td className="p-2 border">{drone.centerCity ?? "N/A"}</td>
                <td className="p-2 border">{drone.droneStatus ?? "N/A"}</td>
                <td className="p-2 border">
                  {currentDelivery
                    ? `Vers ${currentDelivery.hospitalName ?? ""} (${currentDelivery.hospitalCity ?? ""})`
                    : "Aucune"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDroneManagementPage;