import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Truck, AlertTriangle } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "success",
      icon: Check,
      description: "Certificado de salud aprobado",
      details: "Caballo: Andaluz - ES123456789",
      timestamp: "Hace 2 horas"
    },
    {
      id: 2,
      type: "info",
      icon: Plus,
      description: "Nuevo caballo registrado",
      details: "Lusitano - ES987654321",
      timestamp: "Hace 4 horas"
    },
    {
      id: 3,
      type: "warning",
      icon: Truck,
      description: "Guía de movimiento emitida",
      details: "Destino: Explotación Sevilla",
      timestamp: "Hace 6 horas"
    },
    {
      id: 4,
      type: "error",
      icon: AlertTriangle,
      description: "Documento próximo a vencer",
      details: "TIE vence en 15 días",
      timestamp: "Hace 1 día"
    }
  ];

  const getActivityStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "info":
        return "bg-blue-100 text-blue-600";
      case "warning":
        return "bg-orange-100 text-orange-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas operaciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityStyles(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.description}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
