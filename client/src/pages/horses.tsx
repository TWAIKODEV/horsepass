import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Search, Rabbit, Calendar, MapPin, Eye, Edit, Grid, List, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import HorseForm from "@/components/forms/horse-form";
import HorseListView from "@/components/HorseListView";
import PreviewModal from "@/components/PreviewModal";
import TMEForm from "@/components/forms/tme-form";
import { useToast } from "@/hooks/use-toast";
import { downloadPDF, printDocument, DocumentData } from "@/lib/document-utils";

export default function Horses() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<DocumentData | null>(null);
  const [showTMEForm, setShowTMEForm] = useState(false);
  const [selectedHorseForTME, setSelectedHorseForTME] = useState<any>(null);
  const { toast } = useToast();

  const { data: caballos = [], isLoading, error } = useQuery({
    queryKey: ["/api/caballos", user?.id],
    enabled: !!user?.id,
  });

  const { data: explotaciones = [] } = useQuery({
    queryKey: ["/api/explotaciones"],
  });

  const filteredHorses = caballos.filter((caballo: any) =>
    caballo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caballo.ueln.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caballo.raza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExplotacionName = (explotacionId: number) => {
    const explotacion = explotaciones.find((exp: any) => exp.id === explotacionId);
    return explotacion ? explotacion.nombre : "No asignada";
  };

  const getSexoBadgeColor = (sexo: string) => {
    switch (sexo) {
      case "macho": return "bg-blue-100 text-blue-800";
      case "hembra": return "bg-pink-100 text-pink-800";
      case "castrado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handlePreview = (horse: any) => {
    const documentData: DocumentData = {
      title: `Ficha del Caballo - ${horse.nombre}`,
      content: horse,
      type: 'caballo'
    };
    setPreviewData(documentData);
    setShowPreview(true);
  };

  const handleEdit = (horse: any) => {
    setSelectedHorse(horse);
    setShowForm(true);
  };

  const handleDownload = async (horse: any) => {
    try {
      const documentData: DocumentData = {
        title: `Ficha del Caballo - ${horse.nombre}`,
        content: horse,
        type: 'caballo'
      };
      await downloadPDF(documentData);
      toast({
        title: "Descarga completada",
        description: `El documento PDF de ${horse.nombre} se ha descargado exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error en la descarga",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = (horse: any) => {
    try {
      const documentData: DocumentData = {
        title: `Ficha del Caballo - ${horse.nombre}`,
        content: horse,
        type: 'caballo'
      };
      printDocument(documentData);
      toast({
        title: "Impresión iniciada",
        description: `Se ha abierto la ventana de impresión para ${horse.nombre}.`,
      });
    } catch (error) {
      toast({
        title: "Error en la impresión",
        description: "No se pudo iniciar la impresión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTME = (horse: any) => {
    setSelectedHorseForTME(horse);
    setShowTMEForm(true);
    toast({
      title: "Generando TME",
      description: `Iniciando creación de TME para ${horse.nombre} según RD 577/2014`,
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Rabbit className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar caballos</h3>
        <p className="text-gray-600">No se pudieron cargar los datos. Inténtalo de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Caballos</h1>
          <p className="text-gray-600">Administra el registro de tus equinos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Caballo
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, UELN o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                Total: {caballos.length}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Activos: {caballos.filter((c: any) => c.activo).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horses Display */}
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
      ) : filteredHorses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Rabbit className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron caballos" : "No hay caballos registrados"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda"
                : "Comienza registrando tu primer caballo en el sistema"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Registrar Primer Caballo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <HorseListView
          horses={filteredHorses}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onGenerateTME={handleGenerateTME}
          onAdd={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHorses.map((caballo: any) => (
            <Card key={caballo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Rabbit className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{caballo.nombre}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {caballo.ueln}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getSexoBadgeColor(caballo.sexo)} variant="secondary">
                    {caballo.sexo}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Raza</p>
                    <p className="font-medium">{caballo.raza}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capa</p>
                    <p className="font-medium">{caballo.capa}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(caballo.fechaNacimiento), "dd/MM/yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{getExplotacionName(caballo.idExplotacion)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handlePreview(caballo)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleGenerateTME(caballo)}
                    title="Generar TME (RD 577/2014)"
                  >
                    <FileText className="w-4 h-4" />
                    TME
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleEdit(caballo)}
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

      {/* Horse Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <HorseForm 
            horse={selectedHorse}
            onClose={() => {
              setShowForm(false);
              setSelectedHorse(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewData(null);
        }}
        data={previewData}
      />

      {/* TME Form Modal */}
      <Dialog open={showTMEForm} onOpenChange={setShowTMEForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TMEForm 
            caballo={selectedHorseForTME}
            onClose={() => {
              setShowTMEForm(false);
              setSelectedHorseForTME(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
