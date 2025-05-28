import { useLocation } from "wouter";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [location] = useLocation();

  const getPageTitle = () => {
    switch (location) {
      case "/":
      case "/dashboard":
        return {
          title: "Panel Principal",
          description: "Gestión integral de documentación equina"
        };
      case "/caballos":
        return {
          title: "Caballos",
          description: "Gestión del registro de equinos"
        };
      case "/explotaciones":
        return {
          title: "Explotaciones",
          description: "Gestión de centros y fincas ganaderas"
        };
      default:
        if (location.startsWith("/documentos")) {
          return {
            title: "Documentos",
            description: "Gestión de documentación oficial"
          };
        }
        return {
          title: "AGDE",
          description: "Sistema de gestión equina"
        };
    }
  };

  const { title, description } = getPageTitle();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
