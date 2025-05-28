import { Switch, Route, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, IdCard, Truck, Stethoscope, Plane, Book } from "lucide-react";

function DocumentsOverview() {
  const [, setLocation] = useLocation();

  const documentTypes = [
    {
      id: "pasaportes",
      title: "TIE/Pasaportes Equinos",
      description: "Tarjetas de Identificación Equina y pasaportes oficiales",
      icon: IdCard,
      color: "blue",
      path: "/documentos/pasaportes",
      count: "12 activos"
    },
    {
      id: "guias-movimiento",
      title: "Guías de Movimiento Pecuario",
      description: "Documentos para el traslado de equinos entre explotaciones",
      icon: Truck,
      color: "green", 
      path: "/documentos/guias-movimiento",
      count: "8 emitidas"
    },
    {
      id: "certificados-salud",
      title: "Certificados de Salud",
      description: "Certificados veterinarios de estado sanitario",
      icon: Stethoscope,
      color: "purple",
      path: "/documentos/certificados-salud",
      count: "15 vigentes"
    },
    {
      id: "transporte-ue",
      title: "Documentos Transporte UE",
      description: "Documentos de acompañamiento para transporte en la UE",
      icon: Plane,
      color: "orange",
      path: "/documentos/transporte-ue",
      count: "3 activos"
    },
    {
      id: "libros-registro",
      title: "Libros de Registro",
      description: "Registros obligatorios de explotaciones ganaderas",
      icon: Book,
      color: "indigo",
      path: "/documentos/libros-registro",
      count: "5 libros"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50 hover:bg-blue-100",
          icon: "bg-blue-600 text-white",
          text: "text-blue-600"
        };
      case "green":
        return {
          bg: "bg-green-50 hover:bg-green-100",
          icon: "bg-green-600 text-white",
          text: "text-green-600"
        };
      case "purple":
        return {
          bg: "bg-purple-50 hover:bg-purple-100",
          icon: "bg-purple-600 text-white",
          text: "text-purple-600"
        };
      case "orange":
        return {
          bg: "bg-orange-50 hover:bg-orange-100",
          icon: "bg-orange-600 text-white",
          text: "text-orange-600"
        };
      case "indigo":
        return {
          bg: "bg-indigo-50 hover:bg-indigo-100",
          icon: "bg-indigo-600 text-white",
          text: "text-indigo-600"
        };
      default:
        return {
          bg: "bg-gray-50 hover:bg-gray-100",
          icon: "bg-gray-600 text-white",
          text: "text-gray-600"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Gestión de Documentación Equina
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sistema integral para la gestión de toda la documentación oficial relacionada 
          con caballos en España. Accede a los diferentes tipos de documentos desde aquí.
        </p>
      </div>

      {/* Document Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((docType) => {
          const Icon = docType.icon;
          const colors = getColorClasses(docType.color);
          
          return (
            <Card 
              key={docType.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${colors.bg}`}
              onClick={() => setLocation(docType.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.icon}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {docType.count}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{docType.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {docType.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(docType.path);
                  }}
                >
                  Gestionar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Documentación</CardTitle>
          <CardDescription>
            Estado general de la documentación en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">95%</p>
              <p className="text-sm text-gray-600">Cumplimiento</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-sm text-gray-600">Por vencer</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">43</p>
              <p className="text-sm text-gray-600">Total activos</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600">Este mes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas operaciones realizadas en documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IdCard className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pasaporte TIE-2024-001234 creado</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Guía de movimiento GMP-2024-005678 emitida</p>
                <p className="text-xs text-gray-500">Hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Certificado de salud CSV-2024-009876 aprobado</p>
                <p className="text-xs text-gray-500">Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentTypeList({ type }: { type: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lista de {type} en desarrollo
          </h3>
          <p className="text-gray-600 mb-6">
            Esta sección estará disponible próximamente con funcionalidad completa
            para gestionar {type.toLowerCase()}.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Documents() {
  return (
    <Switch>
      <Route path="/documentos" component={DocumentsOverview} />
      <Route path="/documentos/pasaportes">
        <DocumentTypeList type="Pasaportes" />
      </Route>
      <Route path="/documentos/guias-movimiento">
        <DocumentTypeList type="Guías de Movimiento" />
      </Route>
      <Route path="/documentos/certificados-salud">
        <DocumentTypeList type="Certificados de Salud" />
      </Route>
      <Route path="/documentos/transporte-ue">
        <DocumentTypeList type="Documentos de Transporte UE" />
      </Route>
      <Route path="/documentos/libros-registro">
        <DocumentTypeList type="Libros de Registro" />
      </Route>
    </Switch>
  );
}
