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
import { X, Loader2 } from "lucide-react";

const movementGuideSchema = z.object({
  idCaballo: z.number({ required_error: "Selecciona un caballo" }),
  numeroGuia: z.string().min(1, "Número de guía requerido"),
  fechaEmision: z.string().min(1, "Fecha de emisión requerida"),
  explotacionOrigen: z.number({ required_error: "Selecciona explotación de origen" }),
  explotacionDestino: z.number({ required_error: "Selecciona explotación de destino" }),
  fechaSalida: z.string().min(1, "Fecha de salida requerida"),
  motivoTraslado: z.string().min(1, "Motivo de traslado requerido"),
  medioTransporte: z.string().min(1, "Medio de transporte requerido"),
  matriculaVehiculo: z.string().optional(),
  estado: z.string().min(1, "Estado requerido"),
});

type MovementGuideFormData = z.infer<typeof movementGuideSchema>;

interface MovementGuideFormProps {
  onClose: () => void;
}

export default function MovementGuideForm({ onClose }: MovementGuideFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos", user?.id],
  });

  const { data: explotaciones = [] } = useQuery({
    queryKey: ["/api/explotaciones"],
  });

  const form = useForm<MovementGuideFormData>({
    resolver: zodResolver(movementGuideSchema),
    defaultValues: {
      estado: "emitida",
      medioTransporte: "Camión ganadero",
    },
  });

  const createGuia = useMutation({
    mutationFn: async (data: MovementGuideFormData) => {
      const response = await apiRequest("POST", "/api/guias-movimiento", {
        ...data,
        fechaSalida: new Date(data.fechaSalida).toISOString(),
        idEmisor: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guias-movimiento"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Guía de movimiento creada",
        description: "La guía de movimiento ha sido creada exitosamente",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la guía de movimiento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MovementGuideFormData) => {
    createGuia.mutate(data);
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Nueva Guía de Movimiento Pecuario (GMP)
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="caballo">
              Caballo <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("idCaballo", parseInt(value))}>
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

          <div className="space-y-2">
            <Label htmlFor="numeroGuia">
              Número de Guía <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroGuia"
              {...form.register("numeroGuia")}
              placeholder="GMP-2024-001234"
            />
            {form.formState.errors.numeroGuia && (
              <p className="text-sm text-red-600">{form.formState.errors.numeroGuia.message}</p>
            )}
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
            {form.formState.errors.fechaEmision && (
              <p className="text-sm text-red-600">{form.formState.errors.fechaEmision.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaSalida">
              Fecha de Salida <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fechaSalida"
              type="datetime-local"
              {...form.register("fechaSalida")}
            />
            {form.formState.errors.fechaSalida && (
              <p className="text-sm text-red-600">{form.formState.errors.fechaSalida.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explotacionOrigen">
              Explotación de Origen <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("explotacionOrigen", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar origen..." />
              </SelectTrigger>
              <SelectContent>
                {explotaciones.map((exp: any) => (
                  <SelectItem key={exp.id} value={exp.id.toString()}>
                    {exp.nombre} - {exp.codigoRega}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.explotacionOrigen && (
              <p className="text-sm text-red-600">{form.formState.errors.explotacionOrigen.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explotacionDestino">
              Explotación de Destino <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("explotacionDestino", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar destino..." />
              </SelectTrigger>
              <SelectContent>
                {explotaciones.map((exp: any) => (
                  <SelectItem key={exp.id} value={exp.id.toString()}>
                    {exp.nombre} - {exp.codigoRega}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.explotacionDestino && (
              <p className="text-sm text-red-600">{form.formState.errors.explotacionDestino.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medioTransporte">
              Medio de Transporte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="medioTransporte"
              {...form.register("medioTransporte")}
              placeholder="Camión ganadero"
            />
            {form.formState.errors.medioTransporte && (
              <p className="text-sm text-red-600">{form.formState.errors.medioTransporte.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="matriculaVehiculo">Matrícula del Vehículo</Label>
            <Input
              id="matriculaVehiculo"
              {...form.register("matriculaVehiculo")}
              placeholder="1234-ABC"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="motivoTraslado">
              Motivo del Traslado <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoTraslado"
              {...form.register("motivoTraslado")}
              placeholder="Describe el motivo del traslado..."
              rows={3}
            />
            {form.formState.errors.motivoTraslado && (
              <p className="text-sm text-red-600">{form.formState.errors.motivoTraslado.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createGuia.isPending}>
            {createGuia.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Guía"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
