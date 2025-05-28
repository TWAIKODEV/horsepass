import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IdCard, Truck, Stethoscope, Camera } from "lucide-react";
import PassportForm from "@/components/forms/passport-form";
import MovementGuideForm from "@/components/forms/movement-guide-form";
import HealthCertificateForm from "@/components/forms/health-certificate-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      id: "passport",
      title: "Nuevo TIE",
      description: "Pasaporte Equino",
      icon: IdCard,
      color: "blue",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      id: "movement",
      title: "Nueva GMP",
      description: "Guía Movimiento",
      icon: Truck,
      color: "green",
      bgColor: "bg-green-50 hover:bg-green-100"
    },
    {
      id: "health",
      title: "Certificado",
      description: "Salud Veterinaria",
      icon: Stethoscope,
      color: "purple",
      bgColor: "bg-purple-50 hover:bg-purple-100"
    },
    {
      id: "scan",
      title: "Escanear",
      description: "Documento OCR",
      icon: Camera,
      color: "orange",
      bgColor: "bg-orange-50 hover:bg-orange-100"
    }
  ];

  const getIconColorClass = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-600 text-white";
      case "green": return "bg-green-600 text-white";
      case "purple": return "bg-purple-600 text-white";
      case "orange": return "bg-orange-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "passport":
        return <PassportForm onClose={() => setActiveModal(null)} />;
      case "movement":
        return <MovementGuideForm onClose={() => setActiveModal(null)} />;
      case "health":
        return <HealthCertificateForm onClose={() => setActiveModal(null)} />;
      case "scan":
        return (
          <div className="p-6 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funcionalidad OCR</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona documentación equina</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:scale-105 ${action.bgColor}`}
                  onClick={() => setActiveModal(action.id)}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${getIconColorClass(action.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.title}</span>
                  <span className="text-xs text-gray-500">{action.description}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
