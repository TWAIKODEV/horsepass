import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, FileText, Shield, Barcode } from "lucide-react";

// Esquema de validación conforme al Real Decreto 577/2014
const tmeSchema = z.object({
  // Datos obligatorios de identificación (no modificables)
  ueln: z.string().length(15, "UELN debe tener exactamente 15 caracteres"),
  codigoTranspondedor: z.string().min(15, "Código de transpondedor debe tener al menos 15 caracteres"),
  nombreEquido: z.string().min(1, "Nombre del équido es obligatorio"),
  sexo: z.enum(["Macho", "Hembra", "Castrado"], { required_error: "Sexo es obligatorio" }),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es obligatoria"),
  capa: z.string().min(1, "Capa es obligatoria"),
  
  // Datos de emisión
  numeroTarjeta: z.string().min(1, "Número de tarjeta es obligatorio"),
  fechaEmision: z.string().min(1, "Fecha de emisión es obligatoria"),
  autoridadEmisora: z.string().min(1, "Autoridad emisora es obligatoria"),
  fechaValidez: z.string().optional(),
  
  // Datos adicionales voluntarios
  raza: z.string().optional(),
  paisNacimiento: z.string().optional(),
  criador: z.string().optional(),
  propietario: z.string().optional(),
  observaciones: z.string().optional(),
  
  // Elementos gráficos
  fotografiaUrl: z.string().optional(),
  
  // Validaciones específicas
  validaMovimientosEspana: z.boolean().default(true),
  validaMovimientosUe: z.boolean().default(false),
  validaMovimientosInternacionales: z.boolean().default(false),
});

type TMEFormData = z.infer<typeof tmeSchema>;

interface TMEFormProps {
  caballo?: any;
  onClose: () => void;
}

export default function TMEForm({ caballo, onClose }: TMEFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TMEFormData>({
    resolver: zodResolver(tmeSchema),
    defaultValues: {
      // Pre-llenar con datos del caballo si existe
      ueln: caballo?.ueln || "",
      codigoTranspondedor: caballo?.microchip || "",
      nombreEquido: caballo?.nombre || "",
      sexo: caballo?.sexo || "",
      fechaNacimiento: caballo?.fechaNacimiento || "",
      capa: caballo?.capa || "",
      raza: caballo?.raza || "",
      paisNacimiento: caballo?.paisOrigen || "España",
      
      // Datos de emisión por defecto
      numeroTarjeta: "",
      fechaEmision: new Date().toISOString().split('T')[0],
      autoridadEmisora: "SITRAN - Sistema Integral de Trazabilidad Animal",
      
      // Validaciones por defecto según normativa
      validaMovimientosEspana: true,
      validaMovimientosUe: false,
      validaMovimientosInternacionales: false,
    },
  });

  const onSubmit = async (data: TMEFormData) => {
    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para crear la TME
      console.log("Datos TME:", data);
      
      toast({
        title: "TME generada exitosamente",
        description: "La Tarjeta de Identificación Equina ha sido creada conforme al Real Decreto 577/2014",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error al generar TME",
        description: "No se pudo crear la Tarjeta de Identificación Equina",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const capasOficiales = [
    "Alazán", "Castaño", "Negro", "Tordo", "Bayo", "Palomino", 
    "Isabelo", "Ruano", "Pío", "Cremello", "Buckskin", "Perlino"
  ];

  const autoridadesEmisoras = [
    "SITRAN - Sistema Integral de Trazabilidad Animal",
    "Comunidad Autónoma - Andalucía",
    "Comunidad Autónoma - Cataluña", 
    "Comunidad Autónoma - Madrid",
    "Comunidad Autónoma - Valencia",
    "Comunidad Autónoma - Galicia",
    "Comunidad Autónoma - Castilla y León",
    "Ministerio de Agricultura, Pesca y Alimentación"
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
              TME - Tarjeta de Identificación Equina
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Conforme al Real Decreto 577/2014
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
        
        {/* Datos Obligatorios de Identificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Datos Obligatorios de Identificación
            </CardTitle>
            <CardDescription>
              Información no modificable según normativa vigente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ueln">
                UELN (Número Único) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ueln"
                {...form.register("ueln")}
                placeholder="ES123456789012345"
                maxLength={15}
                className="font-mono"
              />
              {form.formState.errors.ueln && (
                <p className="text-sm text-red-600">{form.formState.errors.ueln.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoTranspondedor">
                Código Transpondedor (Microchip) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigoTranspondedor"
                {...form.register("codigoTranspondedor")}
                placeholder="982000123456789"
                className="font-mono"
              />
              {form.formState.errors.codigoTranspondedor && (
                <p className="text-sm text-red-600">{form.formState.errors.codigoTranspondedor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreEquido">
                Nombre del Équido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombreEquido"
                {...form.register("nombreEquido")}
                placeholder="Nombre del caballo"
              />
              {form.formState.errors.nombreEquido && (
                <p className="text-sm text-red-600">{form.formState.errors.nombreEquido.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">
                Sexo <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => form.setValue("sexo", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sexo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Hembra">Hembra</SelectItem>
                  <SelectItem value="Castrado">Castrado</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.sexo && (
                <p className="text-sm text-red-600">{form.formState.errors.sexo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fechaNacimiento"
                type="date"
                {...form.register("fechaNacimiento")}
              />
              {form.formState.errors.fechaNacimiento && (
                <p className="text-sm text-red-600">{form.formState.errors.fechaNacimiento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capa">
                Capa (Color del Pelaje) <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => form.setValue("capa", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar capa..." />
                </SelectTrigger>
                <SelectContent>
                  {capasOficiales.map((capa) => (
                    <SelectItem key={capa} value={capa}>
                      {capa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.capa && (
                <p className="text-sm text-red-600">{form.formState.errors.capa.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Elementos Gráficos Obligatorios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Elementos Gráficos Obligatorios
            </CardTitle>
            <CardDescription>
              Fotografía, código de barras y elementos de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Fotografía o Reseña a Color</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Subir fotografía del équido
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: JPG, PNG (máx. 5MB)
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Código de Barras UELN</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Barcode className="w-5 h-5" />
                    <span className="text-sm font-medium">Generación Automática</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Se generará automáticamente basado en el UELN
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <Badge variant="secondary">Escudo de España</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <Badge variant="secondary">Elementos de Seguridad</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos de Emisión */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de Emisión</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numeroTarjeta">
                Número de Tarjeta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numeroTarjeta"
                {...form.register("numeroTarjeta")}
                placeholder="TME-ES-2024-001234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaEmision">
                Fecha de Emisión <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fechaEmision"
                type="date"
                {...form.register("fechaEmision")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="autoridadEmisora">
                Autoridad Emisora <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => form.setValue("autoridadEmisora", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar autoridad emisora..." />
                </SelectTrigger>
                <SelectContent>
                  {autoridadesEmisoras.map((autoridad) => (
                    <SelectItem key={autoridad} value={autoridad}>
                      {autoridad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaValidez">Fecha de Validez</Label>
              <Input
                id="fechaValidez"
                type="date"
                {...form.register("fechaValidez")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Leyenda de Validez */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                "Válida solo para movimientos dentro de España"
              </Badge>
              <p className="text-xs text-gray-600 mt-2">
                Leyenda obligatoria según Real Decreto 577/2014
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generando TME..." : "Generar TME"}
          </Button>
        </div>
      </form>
    </div>
  );
}