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

const horseSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  ueln: z.string().min(15, "UELN debe tener 15 caracteres").max(15, "UELN debe tener 15 caracteres"),
  microchip: z.string().min(15, "Microchip debe tener al menos 15 caracteres"),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento requerida"),
  sexo: z.string().min(1, "Sexo requerido"),
  raza: z.string().min(1, "Raza requerida"),
  capa: z.string().min(1, "Capa requerida"),
  paisOrigen: z.string().min(1, "País de origen requerido"),
  idExplotacion: z.number({ required_error: "Selecciona una explotación" }),
});

type HorseFormData = z.infer<typeof horseSchema>;

interface HorseFormProps {
  horse?: any;
  onClose: () => void;
}

export default function HorseForm({ horse, onClose }: HorseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!horse;

  const { data: explotaciones = [] } = useQuery({
    queryKey: ["/api/explotaciones"],
  });

  const form = useForm<HorseFormData>({
    resolver: zodResolver(horseSchema),
    defaultValues: {
      nombre: horse?.nombre || "",
      ueln: horse?.ueln || "",
      microchip: horse?.microchip || "",
      fechaNacimiento: horse?.fechaNacimiento || "",
      sexo: horse?.sexo || "",
      raza: horse?.raza || "",
      capa: horse?.capa || "",
      paisOrigen: horse?.paisOrigen || "España",
      idExplotacion: horse?.idExplotacion || undefined,
    },
  });

  const createOrUpdateHorse = useMutation({
    mutationFn: async (data: HorseFormData) => {
      const url = isEdit ? `/api/caballos/${horse.id}` : "/api/caballos";
      const method = isEdit ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, {
        ...data,
        idPropietario: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/caballos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: isEdit ? "Caballo actualizado" : "Caballo registrado",
        description: isEdit 
          ? "Los datos del caballo han sido actualizados exitosamente" 
          : "El caballo ha sido registrado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isEdit 
          ? "No se pudo actualizar el caballo" 
          : "No se pudo registrar el caballo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HorseFormData) => {
    createOrUpdateHorse.mutate(data);
  };

  const sexoOptions = [
    { value: "macho", label: "Macho" },
    { value: "hembra", label: "Hembra" },
    { value: "castrado", label: "Castrado" },
  ];

  const razasComunes = [
    "Pura Raza Española",
    "Lusitano",
    "Árabe",
    "Cuarto de Milla",
    "Frisón",
    "Andaluz",
    "Warmblood",
    "Pura Sangre Inglés",
    "Percherón",
    "Hispano-Árabe",
    "Bretón",
    "Asturcón",
    "Gallego",
    "Menorquín",
    "Caballo de Deporte Español",
  ];

  const capasComunes = [
    "Castaño",
    "Alazán",
    "Negro",
    "Tordo",
    "Bayo",
    "Palomino",
    "Isabelo",
    "Ruano",
    "Pío",
    "Cremello",
    "Buckskin",
    "Perlino",
  ];

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar Caballo" : "Nuevo Caballo"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Caballo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              {...form.register("nombre")}
              placeholder="Ej: Andaluz Real"
            />
            {form.formState.errors.nombre && (
              <p className="text-sm text-red-600">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ueln">
              UELN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ueln"
              {...form.register("ueln")}
              placeholder="ES123456789012345"
              maxLength={15}
            />
            {form.formState.errors.ueln && (
              <p className="text-sm text-red-600">{form.formState.errors.ueln.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="microchip">
              Microchip <span className="text-red-500">*</span>
            </Label>
            <Input
              id="microchip"
              {...form.register("microchip")}
              placeholder="982000123456789"
            />
            {form.formState.errors.microchip && (
              <p className="text-sm text-red-600">{form.formState.errors.microchip.message}</p>
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
            <Label htmlFor="sexo">
              Sexo <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("sexo", value)} defaultValue={horse?.sexo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sexo..." />
              </SelectTrigger>
              <SelectContent>
                {sexoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.sexo && (
              <p className="text-sm text-red-600">{form.formState.errors.sexo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="raza">
              Raza <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("raza", value)} defaultValue={horse?.raza}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar raza..." />
              </SelectTrigger>
              <SelectContent>
                {razasComunes.map((raza) => (
                  <SelectItem key={raza} value={raza}>
                    {raza}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.raza && (
              <p className="text-sm text-red-600">{form.formState.errors.raza.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capa">
              Capa <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("capa", value)} defaultValue={horse?.capa}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar capa..." />
              </SelectTrigger>
              <SelectContent>
                {capasComunes.map((capa) => (
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

          <div className="space-y-2">
            <Label htmlFor="paisOrigen">
              País de Origen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paisOrigen"
              {...form.register("paisOrigen")}
              placeholder="España"
            />
            {form.formState.errors.paisOrigen && (
              <p className="text-sm text-red-600">{form.formState.errors.paisOrigen.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explotacion">
              Explotación <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("idExplotacion", parseInt(value))} defaultValue={horse?.idExplotacion?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar explotación..." />
              </SelectTrigger>
              <SelectContent>
                {explotaciones.map((explotacion: any) => (
                  <SelectItem key={explotacion.id} value={explotacion.id.toString()}>
                    {explotacion.nombre} - {explotacion.codigoRega}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.idExplotacion && (
              <p className="text-sm text-red-600">{form.formState.errors.idExplotacion.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createOrUpdateHorse.isPending}>
            {createOrUpdateHorse.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Actualizando..." : "Registrando..."}
              </>
            ) : (
              isEdit ? "Actualizar Caballo" : "Registrar Caballo"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
