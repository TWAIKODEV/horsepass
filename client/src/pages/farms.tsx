import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/simple-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Search, Building, MapPin, Phone, Mail, Users, Eye, Edit } from "lucide-react";
import FarmForm from "@/components/forms/farm-form";

export default function Farms() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  const { data: explotaciones = [], isLoading, error } = useQuery({
    queryKey: ["/api/explotaciones", user?.id],
    enabled: !!user?.id,
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos"],
  });

  const filteredFarms = explotaciones.filter((explotacion: any) =>
    explotacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    explotacion.codigoRega.toLowerCase().includes(searchTerm.toLowerCase()) ||
    explotacion.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    explotacion.provincia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHorseCount = (farmId: number) => {
    return caballos.filter((caballo: any) => caballo.idExplotacion === farmId).length;
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "cría": return "bg-green-100 text-green-800";
      case "reproducción": return "bg-pink-100 text-pink-800";
      case "cebo": return "bg-orange-100 text-orange-800";
      case "mixta": return "bg-purple-100 text-purple-800";
      case "ocio": return "bg-blue-100 text-blue-800";
      case "deporte": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar explotaciones</h3>
        <p className="text-gray-600">No se pudieron cargar los datos. Inténtalo de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Explotaciones</h1>
          <p className="text-gray-600">Administra tus centros y fincas ganaderas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Explotación
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código REGA, municipio o provincia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                Total: {explotaciones.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Activas: {explotaciones.filter((e: any) => e.activa).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFarms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron explotaciones" : "No hay explotaciones registradas"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda"
                : "Comienza registrando tu primera explotación en el sistema"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Registrar Primera Explotación
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((explotacion: any) => (
            <Card key={explotacion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{explotacion.nombre}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {explotacion.codigoRega}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getTipoColor(explotacion.tipoExplotacion)} variant="secondary">
                    {explotacion.tipoExplotacion}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {explotacion.municipio}, {explotacion.provincia}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{explotacion.telefono}</span>
                  </div>
                  {explotacion.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{explotacion.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Capacidad</p>
                    <p className="font-medium">{explotacion.capacidadMaxima} animales</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Caballos</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{getHorseCount(explotacion.id)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      setSelectedFarm(explotacion);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Farm Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <FarmForm 
            farm={selectedFarm}
            onClose={() => {
              setShowForm(false);
              setSelectedFarm(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


