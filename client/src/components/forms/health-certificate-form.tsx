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

const healthCertificateSchema = z.object({
  idCaballo: z.number({ required_error: "Selecciona un caballo" }),
  numeroCertificado: z.string().min(1, "Número de certificado requerido"),
  fechaEmision: z.string().min(1, "Fecha de emisión requerida"),
  fechaValidez: z.string().min(1, "Fecha de validez requerida"),
  resultado: z.string().min(1, "Resultado requerido"),
  observaciones: z.string().optional(),
  vacunasAplicadas: z.string().optional(),
  pruebasRealizadas: z.string().optional(),
});

type HealthCertificateFormData = z.infer<typeof healthCertificateSchema>;

interface HealthCertificateFormProps {
  onClose: () => void;
}

export default function HealthCertificateForm({ onClose }: HealthCertificateFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos", user?.id],
  });

  const form = useForm<HealthCertificateFormData>({
    resolver: zodResolver(healthCertificateSchema),
    defaultValues: {
      resultado: "apto",
    },
  });

  const createCertificado = useMutation({
    mutationFn: async (data: HealthCertificateFormData) => {
      const response = await apiRequest("POST", "/api/certificados-salud", {
        ...data,
        idVeterinario: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificados-salud"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Certificado de salud creado",
        description: "El certificado de salud ha sido creado exitosamente",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el certificado de salud",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HealthCertificateFormData) => {
    createCertificado.mutate(data);
  };

  const resultadoOptions = [
    { value: "apto", label: "Apto", color: "text-green-600" },
    { value: "no_apto", label: "No Apto", color: "text-red-600" },
    { value: "apto_con_restricciones", label: "Apto con Restricciones", color: "text-orange-600" },
  ];

  const vacunasComunes = [
    "Influenza Equina",
    "Rinoneumonitis Equina",
    "Tétanos",
    "Encefalomielitis del Oeste",
    "Encefalomielitis del Este",
    "Encefalomielitis Venezolana",
    "Rabia",
    "Estrangles",
    "Fiebre del Nilo Occidental",
    "Arteritis Viral Equina",
  ];

  const pruebasComunes = [
    "Análisis de sangre completo",
    "Prueba de Coggins (AIE)",
    "Examen físico general",
    "Auscultación cardiopulmonar",
    "Examen oftalmológico",
    "Examen dental",
    "Palpación abdominal",
    "Examen de extremidades",
    "Prueba de flexión",
    "Examen neurológico",
  ];

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Nuevo Certificado de Salud Veterinaria
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
            <Label htmlFor="numeroCertificado">
              Número de Certificado <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroCertificado"
              {...form.register("numeroCertificado")}
              placeholder="CSV-2024-001234"
            />
            {form.formState.errors.numeroCertificado && (
              <p className="text-sm text-red-600">{form.formState.errors.numeroCertificado.message}</p>
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
            <Label htmlFor="fechaValidez">
              Fecha de Validez <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fechaValidez"
              type="date"
              {...form.register("fechaValidez")}
            />
            {form.formState.errors.fechaValidez && (
              <p className="text-sm text-red-600">{form.formState.errors.fechaValidez.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="resultado">
              Resultado del Examen <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("resultado", value)} defaultValue="apto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resultadoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.resultado && (
              <p className="text-sm text-red-600">{form.formState.errors.resultado.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...form.register("observaciones")}
              placeholder="Observaciones generales sobre el estado de salud del animal..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacunasAplicadas">Vacunas Aplicadas</Label>
            <Textarea
              id="vacunasAplicadas"
              {...form.register("vacunasAplicadas")}
              placeholder="Lista de vacunas administradas..."
              rows={4}
            />
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Vacunas comunes:</p>
              <p>{vacunasComunes.slice(0, 5).join(", ")}, etc.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pruebasRealizadas">Pruebas Realizadas</Label>
            <Textarea
              id="pruebasRealizadas"
              {...form.register("pruebasRealizadas")}
              placeholder="Lista de pruebas y exámenes realizados..."
              rows={4}
            />
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Pruebas comunes:</p>
              <p>{pruebasComunes.slice(0, 5).join(", ")}, etc.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Información del Veterinario</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Nombre:</strong> {user?.nombre} {user?.apellidos}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {user?.numColegiado && (
              <p><strong>Número de Colegiado:</strong> {user.numColegiado}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createCertificado.isPending}>
            {createCertificado.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Certificado"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
