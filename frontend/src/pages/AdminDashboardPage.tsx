import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import AdminInviteForm from "../components/AdminInviteForm";
import SearchBar from "@/components/SearchBar";

/* ---------------- Types ---------------- */
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

/* ---------- Reset-proof “button” ---------- */
const Clickable = ({
  onClick,
  children,
  kind = "primary",
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  kind?: "primary" | "neutral";
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
      kind === "primary" ? "text-white transition-colors" : "text-slate-800 transition-colors",
      className,
    ].join(" ")}
    style={{
      backgroundColor: kind === "primary" ? "#dc2626" : "#e5e7eb", // red-600 / gray-200
      border:
        kind === "primary" ? "1px solid rgba(220,38,38,0.25)" : "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      outline: "none",
      padding: kind === "primary" ? "0.75rem 1.5rem" : "0.5rem 1rem",
    }}
  >
    {children}
  </div>
);

/* ---------------- Page ---------------- */
const AdminDashboardPage = observer(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "invite-donation"
    | "invite-hospital"
    | "ajouter-hospital"
    | "ajouter-center"
    | "searchbar"
  >("dashboard");

  const [stats, setStats] = useState<Statistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Keep your email-gate (or switch back to isSuperAdmin if you prefer)
  useEffect(() => {
    if (!auth.user || auth.user.email !== "admin@bloodsky.fr") {
      navigate("/dashboard");
    } else {
      setIsAdmin(true);
    }
  }, [auth.user, navigate]);

  // Fetch stats when dashboard tab is active
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
    if (isAdmin && activeTab === "dashboard") fetchStats();
  }, [isAdmin, activeTab]);

  const handleNavigation = (path: string, message: string) => {
    if (window.confirm(message)) navigate(path);
  };

  if (!isAdmin) return null;

  return (
    <div className="page-container relative">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-center mb-10 relative">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-12 h-12 mr-4 logo-animation" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-600 iceland-font">
            Administration
          </h1>

        {/* Compact logout */}
          <div className="absolute right-0 top-0">
            <Clickable kind="neutral" onClick={() => auth.logout()} className="share-tech-font font-bold">
              Se déconnecter
            </Clickable>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {(
                [
                  ["dashboard", "Tableau de bord"],
                  ["invite-donation", "Inviter Admin Centre"],
                  ["invite-hospital", "Inviter Admin Hôpital"],
                  ["ajouter-hospital", "Ajouter un hôpital"],
                  ["ajouter-center", "Ajouter un centre"],
                  ["searchbar", "Barre de recherche"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveTab(key)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === key
                      ? "border-pink-500 text-pink-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {label}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 share-tech-font">
              Bienvenue, {auth.user?.userFirstname}!
            </h2>
            <p className="mb-8 text-lg share-tech-font">
              Vous êtes connecté en tant qu'administrateur du système BloodSky.
            </p>

            {/* Stats (dynamic) */}
            {loadingStats && <p className="text-slate-600">Chargement des statistiques…</p>}
            {errorStats && <p className="text-red-600">{errorStats}</p>}
            {!loadingStats && !errorStats && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Drones" value={stats.overview.totalDrones} note="Total des drones dans le système" />
                <StatCard title="Livraisons" value={stats.overview.totalDeliveries} note="Livraisons en cours" />
                <StatCard title="Utilisateurs" value={stats.overview.totalUsers} note="Utilisateurs actifs" />
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-xl font-semibold mb-6 share-tech-font">Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Clickable
                  onClick={() =>
                    handleNavigation("/admin/drones", "Voulez-vous accéder à la gestion des drones ?")
                  }
                  className="w-full"
                >
                  Gérer les drones
                </Clickable>
                <Clickable
                  onClick={() =>
                    handleNavigation("/admin/deliveries", "Voulez-vous accéder à la gestion des livraisons ?")
                  }
                  className="w-full"
                >
                  Gérer les livraisons
                </Clickable>
                <Clickable
                  onClick={() =>
                    handleNavigation("/admin/users", "Voulez-vous accéder à la gestion des utilisateurs ?")
                  }
                  className="w-full"
                >
                  Gérer les utilisateurs
                </Clickable>
                <Clickable
                  onClick={() =>
                    handleNavigation("/admin/statistics", "Voulez-vous voir les statistiques ?")
                  }
                  className="w-full"
                >
                  Voir les statistiques
                </Clickable>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === "invite-donation" && <AdminInviteForm type="donation_center" />}
        {activeTab === "invite-hospital" && <AdminInviteForm type="hospital" />}
        {activeTab === "ajouter-hospital" && <AdminInviteForm type="add_hospital" />}
        {activeTab === "ajouter-center" && <AdminInviteForm type="add_center" />}
        {activeTab === "searchbar" && <SearchBar />}
      </div>
    </div>
  );
});

/* ---------- Small UI helper ---------- */
const StatCard = ({
  title,
  value,
  note,
}: {
  title: string;
  value: string | number;
  note: string;
}) => (
  <div className="bg-red-50 p-6 rounded-lg border border-red-100">
    <h3 className="text-xl font-semibold mb-3 share-tech-font text-red-700">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm text-gray-600">{note}</p>
  </div>
);

export default AdminDashboardPage;
