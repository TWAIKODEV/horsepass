import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { downloadPDF, printDocument, DocumentData } from "@/lib/document-utils";
import { useToast } from "@/hooks/use-toast";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DocumentData | null;
}

export default function PreviewModal({ isOpen, onClose, data }: PreviewModalProps) {
  const { toast } = useToast();

  if (!data) return null;

  const handleDownload = async () => {
    try {
      await downloadPDF(data);
      toast({
        title: "Descarga completada",
        description: "El documento PDF se ha descargado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error en la descarga",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    try {
      printDocument(data);
      toast({
        title: "Impresión iniciada",
        description: "Se ha abierto la ventana de impresión.",
      });
    } catch (error) {
      toast({
        title: "Error en la impresión",
        description: "No se pudo iniciar la impresión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderPreviewContent = () => {
    const { content, type } = data;

    switch (type) {
      case 'caballo':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-base font-medium">{content.nombre}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">UELN</label>
                <p className="text-base font-mono">{content.ueln}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Microchip</label>
                <p className="text-base font-mono">{content.microchip}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Raza</label>
                <p className="text-base">{content.raza}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Sexo</label>
                <p className="text-base">{content.sexo}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                <p className="text-base">{content.fechaNacimiento}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Capa</label>
                <p className="text-base">{content.capa}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">País de Origen</label>
                <p className="text-base">{content.paisOrigen}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Estado</label>
                <p className={`text-base font-medium ${content.activo ? 'text-green-600' : 'text-red-600'}`}>
                  {content.activo ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'explotacion':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-base font-medium">{content.nombre}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Código REGA</label>
                <p className="text-base font-mono">{content.codigoRega}</p>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-600">Dirección</label>
                <p className="text-base">{content.direccion}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Municipio</label>
                <p className="text-base">{content.municipio}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Provincia</label>
                <p className="text-base">{content.provincia}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Código Postal</label>
                <p className="text-base">{content.codigoPostal}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-base">{content.telefono}</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-base">{String(value)}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Vista Preliminar - {data.title}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="border rounded-lg p-6 bg-white">
          <div className="mb-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">🐎 HorsePass</h1>
                <p className="text-gray-600">Sistema de Gestión Equina</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold">{data.title}</h2>
                <p className="text-gray-600">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>

          {renderPreviewContent()}

          <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
            <p>Documento generado por HorsePass - Sistema de Gestión Equina</p>
            <p>Fecha de generación: {new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}