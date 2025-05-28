import { useQuery } from "@tanstack/react-query";
import { Rabbit, FileCheck, AlertTriangle, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  userId: number;
}

export default function StatsCards({ userId }: StatsCardsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", userId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Caballos",
      value: stats?.totalCaballos || 0,
      icon: Rabbit,
      color: "blue",
      trend: "+12% vs mes anterior",
      trendColor: "text-green-600"
    },
    {
      title: "Documentos Activos",
      value: stats?.documentosActivos || 0,
      icon: FileCheck,
      color: "green",
      trend: "98.5% cumplimiento",
      trendColor: "text-green-600"
    },
    {
      title: "Próximos a Vencer",
      value: stats?.proximosVencer || 0,
      icon: AlertTriangle,
      color: "orange",
      trend: "Próximos 30 días",
      trendColor: "text-orange-600"
    },
    {
      title: "Explotaciones",
      value: stats?.explotaciones || 0,
      icon: Building,
      color: "purple",
      trend: "15 provincias",
      trendColor: "text-gray-500"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${stat.trendColor}`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
