import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Rabbit,
  LayoutDashboard,
  FileText,
  Building,
  Camera,
  RefreshCw,
  ChevronDown,
  Settings,
  LogOut,
  User
} from "lucide-react";

export default function Sidebar() {
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const documentRoutes = [
    { path: "/documentos/pasaportes", label: "TIE/Pasaportes" },
    { path: "/documentos/guias-movimiento", label: "Guías de Movimiento" },
    { path: "/documentos/certificados-salud", label: "Certificados de Salud" },
    { path: "/documentos/transporte-ue", label: "Doc. Transporte UE" },
    { path: "/documentos/libros-registro", label: "Libro de Registro" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg fixed h-full z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Rabbit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AGDE</h1>
            <p className="text-sm text-gray-500">Gestión Equina</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <Link href="/dashboard">
          <a className={`agde-sidebar-item ${isActive("/dashboard") ? "active" : ""}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel Principal</span>
          </a>
        </Link>

        <Link href="/caballos">
          <a className={`agde-sidebar-item ${isActive("/caballos") ? "active" : ""}`}>
            <Rabbit className="w-5 h-5" />
            <span>Caballos</span>
          </a>
        </Link>

        {/* Documents submenu */}
        <div className="space-y-1">
          <button
            className={`w-full agde-sidebar-item ${isActive("/documentos") ? "active" : ""}`}
            onClick={() => setDocumentsExpanded(!documentsExpanded)}
          >
            <FileText className="w-5 h-5" />
            <span className="flex-1 text-left">Documentos</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${documentsExpanded ? "rotate-180" : ""}`} 
            />
          </button>
          
          {documentsExpanded && (
            <div className="ml-10 space-y-1">
              {documentRoutes.map((route) => (
                <Link key={route.path} href={route.path}>
                  <a className={`agde-submenu-item ${isActive(route.path) ? "bg-primary/10 text-primary" : ""}`}>
                    {route.label}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/explotaciones">
          <a className={`agde-sidebar-item ${isActive("/explotaciones") ? "active" : ""}`}>
            <Building className="w-5 h-5" />
            <span>Explotaciones</span>
          </a>
        </Link>

        <Link href="/ocr">
          <a className={`agde-sidebar-item ${isActive("/ocr") ? "active" : ""}`}>
            <Camera className="w-5 h-5" />
            <span>Escanear OCR</span>
          </a>
        </Link>

        <Link href="/sitran">
          <a className={`agde-sidebar-item ${isActive("/sitran") ? "active" : ""}`}>
            <RefreshCw className="w-5 h-5" />
            <span>SITRAN</span>
          </a>
        </Link>
      </nav>

      {/* User info and logout */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombre} {user?.apellidos}
            </p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {user?.tipoUsuario}
            </p>
          </div>
          <div className="flex space-x-1">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
