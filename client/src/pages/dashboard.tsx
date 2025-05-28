import { useAuth } from "../lib/simple-auth";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import ExpiringDocuments from "@/components/dashboard/expiring-documents";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando panel principal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards userId={user.id} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* Expiring Documents Table */}
      <ExpiringDocuments userId={user.id} />
    </div>
  );
}
