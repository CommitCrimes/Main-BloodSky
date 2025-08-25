import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../hooks/useAuth";

interface OverviewStats {
  totalUsers: number;
  totalHospitals: number;
  totalCenters: number;
  totalDeliveries: number;
  totalDrones: number;
  urgentDeliveries: number;
}
interface Statistics {
  overview: OverviewStats;
  deliveriesByStatus: { status: string; count: number }[];
}

/** Accessible button without <button>, immune to global resets */
const Clickable = ({
  onClick,
  children,
  kind = "primary",
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  kind?: "primary" | "ghost";
  className?: string;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    className={[
      "select-none cursor-pointer rounded-lg font-semibold inline-block",
      kind === "primary"
        ? "text-white transition-colors"
        : "text-slate-700",
      className,
    ].join(" ")}
    style={{
      backgroundColor: kind === "primary" ? "#dc2626" : "transparent",
      border: kind === "primary" ? "1px solid rgba(220,38,38,0.25)" : "1px solid transparent",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      outline: "none",
    }}
  >
    {children}
  </div>
);


const AdminDashboardPage = observer(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user || !auth.isSuperAdmin) {
      navigate("/dashboard");
    } else {
      setIsAdmin(true);
    }
  }, [auth.user, auth.isSuperAdmin, navigate]);

  const handleNavigation = (path: string, message: string) => {
    if (window.confirm(message)) navigate(path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setErrorStats(null);
        const res = await api.get<Statistics>("/superadmin/statistics");
        setStats(res.data);
      } catch (e) {
        console.error(e);
        setErrorStats("Impossible de récupérer les statistiques.");
      } finally {
        setLoadingStats(false);
      }
    };
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen w-full bg-[#eaf4f8]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + Logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/blood-drop.svg"
              alt="BloodSky Logo"
              className="w-12 h-12"
            />
            <h1 className="iceland-font text-4xl sm:text-5xl font-bold text-[#b81f2d]">
              Administration
            </h1>
          </div>

          <Clickable
            kind="primary"
            onClick={() => auth.logout()}
            className="share-tech-font font-bold px-5 py-2"
          >
            Se déconnecter
          </Clickable>
        </div>

        {/* Single main card: stats + actions */}
        <section
          className="bg-white border border-[#e6eef3] rounded-2xl shadow p-6 sm:p-8 space-y-8 isolate relative"
          style={{ overflow: "visible", zIndex: 0 }}
        >
          {/* Stats */}
          <div>
            <h2 className="share-tech-font text-2xl sm:text-3xl font-semibold text-slate-800">
              Bienvenue,{" "}
              <span className="text-[#b81f2d]">
                {auth.user?.userFirstname ?? "Admin"}
              </span>{" "}
              !
            </h2>
            <p className="share-tech-font text-slate-600 mt-2">
              Vous êtes connecté en tant qu’administrateur du système BloodSky.
            </p>

            <div className="mt-8">
              {loadingStats && (
                <p className="text-slate-600">Chargement des statistiques…</p>
              )}
              {errorStats && <p className="text-red-600">{errorStats}</p>}
              {!loadingStats && !errorStats && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <StatCard
                    title="Drones"
                    value={stats.overview.totalDrones}
                    note="Total des drones dans le système"
                  />
                  <StatCard
                    title="Livraisons"
                    value={stats.overview.totalDeliveries}
                    note="Livraisons en cours"
                  />
                  <StatCard
                    title="Utilisateurs"
                    value={stats.overview.totalUsers}
                    note="Utilisateurs actifs"
                  />
                </div>
              )}
            </div>
          </div>

          <hr className="border-[#e6eef3]" />

          {/* Actions */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative"
            style={{ zIndex: 1 }}
          >
            <Clickable
              onClick={() =>
                handleNavigation(
                  "/admin/drones",
                  "Voulez-vous accéder à la gestion des drones ?"
                )
              }
            >
              Gérer les drones
            </Clickable>
            <Clickable
              onClick={() =>
                handleNavigation(
                  "/admin/deliveries",
                  "Voulez-vous accéder à la gestion des livraisons ?"
                )
              }
            >
              Gérer les livraisons
            </Clickable>
            <Clickable
              onClick={() =>
                handleNavigation(
                  "/admin/users",
                  "Voulez-vous accéder à la gestion des utilisateurs ?"
                )
              }
            >
              Gérer les utilisateurs
            </Clickable>
            <Clickable
              onClick={() =>
                handleNavigation(
                  "/admin/statistics",
                  "Voulez-vous voir les statistiques ?"
                )
              }
            >
              Voir les statistiques
            </Clickable>
          </div>
        </section>
      </div>
    </div>
  );
});

/* ---------- UI helpers ---------- */

const StatCard = ({
  title,
  value,
  note,
}: {
  title: string;
  value: string | number;
  note: string;
}) => (
  <div className="rounded-xl border border-[#ffe3e6] bg-[#fff7f8] p-5 sm:p-6">
    <h3 className="share-tech-font text-lg font-semibold text-[#b81f2d] mb-2">
      {title}
    </h3>
    <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">
      {value}
    </p>
    <p className="text-sm text-slate-600">{note}</p>
  </div>
);

export default AdminDashboardPage;
