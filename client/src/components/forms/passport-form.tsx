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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

const passportSchema = z.object({
  idCaballo: z.number({ required_error: "Selecciona un caballo" }),
  numeroPasaporte: z.string().min(1, "Número de pasaporte requerido"),
  fechaEmision: z.string().min(1, "Fecha de emisión requerida"),
  autoridadEmisora: z.string().min(1, "Autoridad emisora requerida"),
  fechaValidez: z.string().optional(),
  estado: z.string().min(1, "Estado requerido"),
});

type PassportFormData = z.infer<typeof passportSchema>;

interface PassportFormProps {
  onClose: () => void;
}

export default function PassportForm({ onClose }: PassportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos", user?.id],
  });

  const form = useForm<PassportFormData>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      estado: "vigente",
      autoridadEmisora: "SICAB - Servicio de Identificación de Caballos",
    },
  });

  const createPasaporte = useMutation({
    mutationFn: async (data: PassportFormData) => {
      const response = await apiRequest("POST", "/api/pasaportes", {
        ...data,
        idEmisor: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pasaportes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Pasaporte creado",
        description: "El pasaporte equino ha sido creado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el pasaporte",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PassportFormData) => {
    createPasaporte.mutate(data);
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Nuevo Pasaporte Equino (TIE)
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
            <Label htmlFor="numeroPasaporte">
              Número de Pasaporte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroPasaporte"
              {...form.register("numeroPasaporte")}
              placeholder="TIE-2024-001234"
            />
            {form.formState.errors.numeroPasaporte && (
              <p className="text-sm text-red-600">{form.formState.errors.numeroPasaporte.message}</p>
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
            <Label htmlFor="fechaValidez">Fecha de Validez</Label>
            <Input
              id="fechaValidez"
              type="date"
              {...form.register("fechaValidez")}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="autoridadEmisora">
              Autoridad Emisora <span className="text-red-500">*</span>
            </Label>
            <Input
              id="autoridadEmisora"
              {...form.register("autoridadEmisora")}
              placeholder="SICAB - Servicio de Identificación de Caballos"
            />
            {form.formState.errors.autoridadEmisora && (
              <p className="text-sm text-red-600">{form.formState.errors.autoridadEmisora.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("estado", value)} defaultValue="vigente">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="caducado">Caducado</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="extraviado">Extraviado</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.estado && (
              <p className="text-sm text-red-600">{form.formState.errors.estado.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createPasaporte.isPending}>
            {createPasaporte.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Pasaporte"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
