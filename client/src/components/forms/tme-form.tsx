import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, AlertCircle, Loader2, CreditCard, ExternalLink, MapPin } from "lucide-react";

const tmeSchema = z.object({
  // Datos obligatorios del animal (no modificables una vez creado)
  idCaballo: z.number({ required_error: "Debe seleccionar un caballo" }),
  
  // Datos del veterinario colaborador
  veterinarioNombre: z.string().min(1, "Nombre del veterinario requerido"),
  veterinarioNumColegiado: z.string().min(1, "Número de colegiado requerido"),
  veterinarioTelefono: z.string().min(9, "Teléfono del veterinario requerido"),
  veterinarioEmail: z.string().email("Email del veterinario inválido"),
  
  // Documentación adicional
  motivoSolicitud: z.string().min(1, "Motivo de solicitud requerido"),
  observaciones: z.string().optional(),
  
  // Archivos adjuntos
  fotografiaEquido: z.string().optional(),
  documentoIdentidad: z.string().optional(),
});

type TMEFormData = z.infer<typeof tmeSchema>;

interface TMEFormProps {
  onClose: () => void;
}

export default function TMEForm({ onClose }: TMEFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedHorse, setSelectedHorse] = useState<any>(null);

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos"],
  });

  const form = useForm<TMEFormData>({
    resolver: zodResolver(tmeSchema),
    defaultValues: {
      motivoSolicitud: "",
      observaciones: "",
      veterinarioNombre: "",
      veterinarioNumColegiado: "",
      veterinarioTelefono: "",
      veterinarioEmail: "",
    },
  });

  const createTME = useMutation({
    mutationFn: async (data: TMEFormData) => {
      const response = await apiRequest("POST", "/api/tme", {
        ...data,
        idSolicitante: user?.id,
        fechaSolicitud: new Date().toISOString(),
        estado: "pendiente",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tme"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Solicitud TME enviada",
        description: "Su solicitud de Tarjeta de Movimientos de Équidos ha sido enviada correctamente. Recibirá una confirmación por email.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de TME",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TMEFormData) => {
    createTME.mutate(data);
  };

  const handleHorseSelection = (horseId: string) => {
    const horse = caballos.find((c: any) => c.id.toString() === horseId);
    setSelectedHorse(horse);
    form.setValue("idCaballo", parseInt(horseId));
  };

  const motivosSolicitud = [
    "Primera solicitud de TME",
    "Renovación por pérdida",
    "Renovación por deterioro",
    "Cambio de propietario",
    "Actualización de datos",
    "Sustitución por TME anterior",
  ];

  const comunidadesAutonomas = [
    {
      nombre: "Andalucía",
      url: "https://www.juntadeandalucia.es/organismos/agriculturapescaydesarrollorural/areas/ganaderia/sanidad-animal/paginas/ordenacion-zootecnica-sanitaria-sector-equino.html",
      descripcion: "Ordenación Zootécnica y Sanitaria del sector equino - Junta de Andalucía"
    },
    {
      nombre: "Aragón",
      url: "https://www.aragon.es/tramitador/-/tramite/registro-informatico-equidos-aragon-riequi",
      descripcion: "Registro Informático de Équidos de Aragón (RIEQUI)"
    },
    {
      nombre: "Asturias",
      url: "https://sede.asturias.es/portal/site/Asturias/menuitem.078b7d5ce7f93d26fbac5b52e20142ca/",
      descripcion: "Registro de identificación individual de animales y movimientos - Principado de Asturias"
    },
    {
      nombre: "Islas Baleares",
      url: "https://sede.colveterinariosbaleares.com/",
      descripcion: "Sede Electrónica del Col·legi Oficial de Veterinaris de les Illes Balears"
    },
    {
      nombre: "Canarias",
      url: "https://sede.gobiernodecanarias.org/sede/tramite/3003",
      descripcion: "Expedición de guías sanitarias para el movimiento de animales - Gobierno de Canarias"
    },
    {
      nombre: "Cantabria",
      url: "https://www.colevetcantabria.com/tme",
      descripcion: "Tarjeta de Movimiento Equina - Colegio Veterinario de Cantabria"
    },
    {
      nombre: "Castilla y León",
      url: "https://tramitaenlinea.jcyl.es/web/jcyl/AdministracionElectronica/es/Plantilla100/1246989648173/_/_/_",
      descripcion: "Solicitud de Tarjeta de Movimiento Equina - SIREQUI"
    },
    {
      nombre: "Castilla-La Mancha",
      url: "https://sede.jccm.es/",
      descripcion: "Sede Electrónica de la Junta de Comunidades de Castilla-La Mancha"
    },
    {
      nombre: "Cataluña",
      url: "https://seu.cat/ca/tramits/identificacio-animals",
      descripcion: "Sede Electrónica de la Generalitat de Catalunya"
    },
    {
      nombre: "Comunidad Valenciana",
      url: "https://sede.gva.es/es/tramites",
      descripcion: "Sede Electrónica de la Generalitat Valenciana"
    },
    {
      nombre: "Extremadura",
      url: "https://sede.gobex.es/",
      descripcion: "Sede Electrónica de la Junta de Extremadura"
    },
    {
      nombre: "Galicia",
      url: "https://sede.xunta.gal/",
      descripcion: "Sede Electrónica de la Xunta de Galicia"
    },
    {
      nombre: "Madrid",
      url: "https://gestiona.comunidad.madrid/wps/portal/tramites/home",
      descripcion: "Registro de Identificación de Équidos de la Comunidad de Madrid (RIEQUIMAD)"
    },
    {
      nombre: "Murcia",
      url: "https://sede.carm.es/web/pagina?IDCONTENIDO=1174&IDTIPO=100&RASTRO=c$m40288",
      descripcion: "Tarjeta de Movimiento Equina (TME) - Región de Murcia"
    },
    {
      nombre: "Navarra",
      url: "https://sedeelectronica.navarra.es/eSede/es/tramites",
      descripcion: "Tarjeta de Movimiento Equino - Gobierno de Navarra"
    },
    {
      nombre: "País Vasco",
      url: "https://www.euskadi.eus/tramites/",
      descripción: "Sede Electrónica del Gobierno Vasco"
    },
    {
      nombre: "La Rioja",
      url: "https://www.larioja.org/sede-electronica/es",
      descripcion: "Sede Electrónica del Gobierno de La Rioja"
    },
    {
      nombre: "Ceuta",
      url: "https://sede.ceuta.es/",
      descripcion: "Sede Electrónica de la Ciudad Autónoma de Ceuta"
    },
    {
      nombre: "Melilla",
      url: "https://sede.melilla.es/",
      descripcion: "Sede Electrónica de la Ciudad Autónoma de Melilla"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Solicitud de TME</h3>
        <p className="text-gray-600 mt-2">Tarjeta de Movimientos de Équidos según RD 577/2014</p>
      </div>

      {/* Información importante */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Información Importante
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>• La TME debe ser solicitada a través de un veterinario colaborador autorizado</p>
          <p>• Es válida solo para movimientos dentro de España</p>
          <p>• La tarjeta será emitida por la Fábrica Nacional de Moneda y Timbre</p>
          <p>• Incluye elementos de seguridad gráfica y código de barras</p>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de Caballo */}
        <Card>
          <CardHeader>
            <CardTitle>1. Datos del Équido</CardTitle>
            <CardDescription>Seleccione el caballo para el cual solicita la TME</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caballo">
                Caballo <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleHorseSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar caballo..." />
                </SelectTrigger>
                <SelectContent>
                  {caballos.map((caballo: any) => (
                    <SelectItem key={caballo.id} value={caballo.id.toString()}>
                      {caballo.nombre} - {caballo.ueln}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.idCaballo && (
                <p className="text-sm text-red-600">{form.formState.errors.idCaballo.message}</p>
              )}
            </div>

            {/* Datos del caballo seleccionado */}
            {selectedHorse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Datos que aparecerán en la TME:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">UELN:</span>
                    <p className="font-mono">{selectedHorse.ueln}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Microchip:</span>
                    <p className="font-mono">{selectedHorse.microchip}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <p className="font-medium">{selectedHorse.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sexo:</span>
                    <p>{selectedHorse.sexo}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha de Nacimiento:</span>
                    <p>{selectedHorse.fechaNacimiento}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Capa:</span>
                    <p>{selectedHorse.capa}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline">Datos no modificables</Badge>
                  <Badge variant="secondary">Según registro oficial</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datos del Veterinario */}
        <Card>
          <CardHeader>
            <CardTitle>2. Veterinario Colaborador Autorizado</CardTitle>
            <CardDescription>Datos del veterinario que tramitará la solicitud</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarioNombre">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="veterinarioNombre"
                  {...form.register("veterinarioNombre")}
                  placeholder="Dr. Juan Pérez García"
                />
                {form.formState.errors.veterinarioNombre && (
                  <p className="text-sm text-red-600">{form.formState.errors.veterinarioNombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarioNumColegiado">
                  Número de Colegiado <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="veterinarioNumColegiado"
                  {...form.register("veterinarioNumColegiado")}
                  placeholder="MAD-1234"
                />
                {form.formState.errors.veterinarioNumColegiado && (
                  <p className="text-sm text-red-600">{form.formState.errors.veterinarioNumColegiado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarioTelefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="veterinarioTelefono"
                  {...form.register("veterinarioTelefono")}
                  placeholder="612345678"
                />
                {form.formState.errors.veterinarioTelefono && (
                  <p className="text-sm text-red-600">{form.formState.errors.veterinarioTelefono.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarioEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="veterinarioEmail"
                  type="email"
                  {...form.register("veterinarioEmail")}
                  placeholder="veterinario@colegio.com"
                />
                {form.formState.errors.veterinarioEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.veterinarioEmail.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivo y Documentación */}
        <Card>
          <CardHeader>
            <CardTitle>3. Motivo de la Solicitud</CardTitle>
            <CardDescription>Indique el motivo y adjunte documentación necesaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivoSolicitud">
                Motivo de Solicitud <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => form.setValue("motivoSolicitud", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {motivosSolicitud.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.motivoSolicitud && (
                <p className="text-sm text-red-600">{form.formState.errors.motivoSolicitud.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">
                Observaciones Adicionales
              </Label>
              <Textarea
                id="observaciones"
                {...form.register("observaciones")}
                placeholder="Información adicional relevante para la solicitud..."
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Documentación Adjunta (Opcional)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fotografía del Équido</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Fotografía a color del équido</p>
                    <p className="text-xs text-gray-500">Requerida para la tarjeta</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Documento de Identidad</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">DNI del propietario</p>
                    <p className="text-xs text-gray-500">Para verificación</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tramitación Electrónica por Comunidad Autónoma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              4. Tramitación Electrónica por Comunidad Autónoma
            </CardTitle>
            <CardDescription>
              Enlaces específicos para que el veterinario colaborador realice la tramitación electrónica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {comunidadesAutonomas.map((comunidad, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{comunidad.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {comunidad.descripcion}
                      </p>
                    </div>
                    <a
                      href={comunidad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title={`Acceder a ${comunidad.nombre}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Importante para el veterinario</p>
                  <p className="text-amber-700 mt-1">
                    Estos enlaces son para que el veterinario colaborador autorizado acceda al sistema 
                    de tramitación electrónica correspondiente a su comunidad autónoma y procese la solicitud de TME.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen y confirmación */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Resumen de la Solicitud</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700 space-y-2">
            <p>• <strong>Emisión:</strong> Comunidad Autónoma competente</p>
            <p>• <strong>Producción:</strong> Fábrica Nacional de Moneda y Timbre</p>
            <p>• <strong>Validez:</strong> Solo para movimientos dentro de España</p>
            <p>• <strong>Tramitación:</strong> A través del veterinario colaborador</p>
            <p>• <strong>Tiempo estimado:</strong> 15-30 días laborables</p>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createTME.isPending || !selectedHorse}>
            {createTME.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando Solicitud...
              </>
            ) : (
              "Enviar Solicitud TME"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}