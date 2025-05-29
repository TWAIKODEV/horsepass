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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Plus, 
  Trash2, 
  Loader2,
  Home,
  AlertCircle
} from "lucide-react";

const farmSchema = z.object({
  nombre: z.string().min(1, "Nombre de la explotación requerido"),
  codigoRega: z.string().min(1, "Código REGA requerido"),
  direccion: z.string().min(1, "Dirección requerida"),
  municipio: z.string().min(1, "Municipio requerido"),
  provincia: z.string().min(1, "Provincia requerida"),
  codigoPostal: z.string().min(5, "Código postal debe tener 5 dígitos").max(5, "Código postal debe tener 5 dígitos"),
  telefono: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  email: z.string().email("Email inválido").optional(),
  tipoExplotacion: z.string().min(1, "Tipo de explotación requerido"),
  capacidadMaxima: z.number().min(1, "La capacidad máxima debe ser mayor a 0"),
  numeroAnimalesActual: z.number().min(0, "El número actual no puede ser negativo"),
  descripcion: z.string().optional(),
  serviciosDisponibles: z.array(z.string()).optional(),
  responsableTecnico: z.string().optional(),
  telefonoEmergencia: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

interface AnimalInventario {
  id?: number;
  nombre: string;
  ueln: string;
  microchip: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  estado: string;
}

interface FarmFormProps {
  farm?: any;
  onClose: () => void;
}

export default function FarmForm({ farm, onClose }: FarmFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!farm;
  
  const [inventarioAnimales, setInventarioAnimales] = useState<AnimalInventario[]>(
    farm?.animales || []
  );
  const [nuevoAnimal, setNuevoAnimal] = useState<AnimalInventario>({
    nombre: "",
    ueln: "",
    microchip: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    estado: "activo"
  });
  const [mostrarFormularioAnimal, setMostrarFormularioAnimal] = useState(false);

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos"],
  });

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      nombre: farm?.nombre || "",
      codigoRega: farm?.codigoRega || "",
      direccion: farm?.direccion || "",
      municipio: farm?.municipio || "",
      provincia: farm?.provincia || "",
      codigoPostal: farm?.codigoPostal || "",
      telefono: farm?.telefono || "",
      email: farm?.email || "",
      tipoExplotacion: farm?.tipoExplotacion || "",
      capacidadMaxima: farm?.capacidadMaxima || 1,
      numeroAnimalesActual: farm?.numeroAnimalesActual || 0,
      descripcion: farm?.descripcion || "",
      responsableTecnico: farm?.responsableTecnico || "",
      telefonoEmergencia: farm?.telefonoEmergencia || "",
      serviciosDisponibles: farm?.serviciosDisponibles || [],
    },
  });

  const createOrUpdateFarm = useMutation({
    mutationFn: async (data: FarmFormData & { inventarioAnimales: AnimalInventario[] }) => {
      const url = isEdit ? `/api/explotaciones/${farm.id}` : "/api/explotaciones";
      const method = isEdit ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, {
        ...data,
        idPropietario: user?.id,
        fechaRegistro: new Date().toISOString(),
        activa: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/explotaciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: isEdit ? "Explotación actualizada" : "Explotación registrada",
        description: isEdit 
          ? "Los datos de la explotación han sido actualizados exitosamente" 
          : "La explotación ha sido registrada exitosamente en el sistema",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEdit 
          ? "No se pudo actualizar la explotación" 
          : "No se pudo registrar la explotación",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FarmFormData) => {
    createOrUpdateFarm.mutate({
      ...data,
      inventarioAnimales
    });
  };

  const tiposExplotacion = [
    "Cría y reproducción",
    "Entrenamiento deportivo",
    "Pensión y cuidado",
    "Centro ecuestre",
    "Terapia equina",
    "Exhibición y espectáculos",
    "Trabajo agrícola",
    "Mixta (varios usos)",
    "Cuarentena",
    "Investigación"
  ];

  const serviciosDisponibles = [
    "Veterinario permanente",
    "Herrador profesional",
    "Pista de entrenamiento",
    "Picadero cubierto",
    "Boxes individuales",
    "Paddocks exteriores",
    "Almacén de piensos",
    "Transporte especializado",
    "Cuidado 24/7",
    "Servicios de limpieza"
  ];

  const provinciasEspañolas = [
    "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
    "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real",
    "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca",
    "Islas Baleares", "Jaén", "La Rioja", "Las Palmas", "León", "Lérida", "Lugo", "Madrid",
    "Málaga", "Melilla", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca",
    "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
    "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
  ];

  const agregarAnimal = () => {
    if (nuevoAnimal.nombre && nuevoAnimal.ueln && nuevoAnimal.microchip) {
      setInventarioAnimales([...inventarioAnimales, { ...nuevoAnimal }]);
      setNuevoAnimal({
        nombre: "",
        ueln: "",
        microchip: "",
        raza: "",
        sexo: "",
        fechaNacimiento: "",
        estado: "activo"
      });
      setMostrarFormularioAnimal(false);
      
      // Actualizar el número actual de animales
      form.setValue("numeroAnimalesActual", inventarioAnimales.length + 1);
      
      toast({
        title: "Animal agregado",
        description: "El animal ha sido agregado al inventario de la explotación",
      });
    }
  };

  const eliminarAnimal = (index: number) => {
    const nuevosAnimales = inventarioAnimales.filter((_, i) => i !== index);
    setInventarioAnimales(nuevosAnimales);
    form.setValue("numeroAnimalesActual", nuevosAnimales.length);
    
    toast({
      title: "Animal eliminado",
      description: "El animal ha sido eliminado del inventario",
    });
  };

  const agregarCaballoExistente = (caballoId: string) => {
    const caballo = caballos.find((c: any) => c.id.toString() === caballoId);
    if (caballo) {
      const animalExistente = inventarioAnimales.find(a => a.ueln === caballo.ueln);
      if (!animalExistente) {
        setInventarioAnimales([...inventarioAnimales, {
          nombre: caballo.nombre,
          ueln: caballo.ueln,
          microchip: caballo.microchip,
          raza: caballo.raza,
          sexo: caballo.sexo,
          fechaNacimiento: caballo.fechaNacimiento,
          estado: "activo"
        }]);
        form.setValue("numeroAnimalesActual", inventarioAnimales.length + 1);
        
        toast({
          title: "Caballo agregado",
          description: `${caballo.nombre} ha sido agregado al inventario`,
        });
      } else {
        toast({
          title: "Animal ya existe",
          description: "Este caballo ya está en el inventario de la explotación",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {isEdit ? "Editar Explotación" : "Nueva Explotación"}
        </h3>
        <p className="text-gray-600 mt-2">
          {isEdit ? "Actualiza los datos de la explotación" : "Registra una nueva explotación equina"}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              1. Información Básica
            </CardTitle>
            <CardDescription>Datos generales de la explotación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre de la Explotación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...form.register("nombre")}
                  placeholder="Ej: Hacienda Los Álamos"
                />
                {form.formState.errors.nombre && (
                  <p className="text-sm text-red-600">{form.formState.errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoRega">
                  Código REGA <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigoRega"
                  {...form.register("codigoRega")}
                  placeholder="ES123456789"
                />
                {form.formState.errors.codigoRega && (
                  <p className="text-sm text-red-600">{form.formState.errors.codigoRega.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoExplotacion">
                  Tipo de Explotación <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("tipoExplotacion", value)} defaultValue={farm?.tipoExplotacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposExplotacion.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.tipoExplotacion && (
                  <p className="text-sm text-red-600">{form.formState.errors.tipoExplotacion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsableTecnico">
                  Responsable Técnico
                </Label>
                <Input
                  id="responsableTecnico"
                  {...form.register("responsableTecnico")}
                  placeholder="Dr. Juan Pérez García"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción de la Explotación
              </Label>
              <Textarea
                id="descripcion"
                {...form.register("descripcion")}
                placeholder="Descripción general de las instalaciones y actividades..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ubicación y Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              2. Ubicación y Contacto
            </CardTitle>
            <CardDescription>Dirección y datos de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">
                Dirección Completa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="direccion"
                {...form.register("direccion")}
                placeholder="Calle, número, urbanización..."
              />
              {form.formState.errors.direccion && (
                <p className="text-sm text-red-600">{form.formState.errors.direccion.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">
                  Municipio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="municipio"
                  {...form.register("municipio")}
                  placeholder="Nombre del municipio"
                />
                {form.formState.errors.municipio && (
                  <p className="text-sm text-red-600">{form.formState.errors.municipio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">
                  Provincia <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("provincia", value)} defaultValue={farm?.provincia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar provincia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasEspañolas.map((provincia) => (
                      <SelectItem key={provincia} value={provincia}>
                        {provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.provincia && (
                  <p className="text-sm text-red-600">{form.formState.errors.provincia.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigoPostal">
                  Código Postal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigoPostal"
                  {...form.register("codigoPostal")}
                  placeholder="28001"
                  maxLength={5}
                />
                {form.formState.errors.codigoPostal && (
                  <p className="text-sm text-red-600">{form.formState.errors.codigoPostal.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  {...form.register("telefono")}
                  placeholder="612345678"
                />
                {form.formState.errors.telefono && (
                  <p className="text-sm text-red-600">{form.formState.errors.telefono.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoEmergencia">
                  Teléfono de Emergencia
                </Label>
                <Input
                  id="telefonoEmergencia"
                  {...form.register("telefonoEmergencia")}
                  placeholder="612345679"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="contacto@explotacion.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacidad y Servicios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              3. Capacidad y Servicios
            </CardTitle>
            <CardDescription>Información sobre capacidad y servicios disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidadMaxima">
                  Capacidad Máxima (animales) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="capacidadMaxima"
                  type="number"
                  min="1"
                  {...form.register("capacidadMaxima", { valueAsNumber: true })}
                  placeholder="50"
                />
                {form.formState.errors.capacidadMaxima && (
                  <p className="text-sm text-red-600">{form.formState.errors.capacidadMaxima.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroAnimalesActual">
                  Número Actual de Animales
                </Label>
                <Input
                  id="numeroAnimalesActual"
                  type="number"
                  min="0"
                  {...form.register("numeroAnimalesActual", { valueAsNumber: true })}
                  placeholder="0"
                  readOnly
                />
                <p className="text-xs text-gray-500">Se actualiza automáticamente con el inventario</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Servicios Disponibles</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {serviciosDisponibles.map((servicio) => (
                  <div key={servicio} className="flex items-center space-x-2">
                    <Checkbox
                      id={servicio}
                      defaultChecked={farm?.serviciosDisponibles?.includes(servicio)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues("serviciosDisponibles") || [];
                        if (checked) {
                          form.setValue("serviciosDisponibles", [...current, servicio]);
                        } else {
                          form.setValue("serviciosDisponibles", current.filter(s => s !== servicio));
                        }
                      }}
                    />
                    <Label htmlFor={servicio} className="text-sm">
                      {servicio}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventario de Animales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              4. Inventario de Animales
            </CardTitle>
            <CardDescription>Gestiona los animales de la explotación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agregar desde caballos existentes */}
            <div className="space-y-2">
              <Label>Agregar Caballo Existente</Label>
              <Select onValueChange={agregarCaballoExistente}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar caballo del sistema..." />
                </SelectTrigger>
                <SelectContent>
                  {caballos.map((caballo: any) => (
                    <SelectItem key={caballo.id} value={caballo.id.toString()}>
                      {caballo.nombre} - {caballo.ueln}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Formulario para nuevo animal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Agregar Nuevo Animal</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarFormularioAnimal(!mostrarFormularioAnimal)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Animal
                </Button>
              </div>

              {mostrarFormularioAnimal && (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Nombre"
                      value={nuevoAnimal.nombre}
                      onChange={(e) => setNuevoAnimal({...nuevoAnimal, nombre: e.target.value})}
                    />
                    <Input
                      placeholder="UELN"
                      value={nuevoAnimal.ueln}
                      onChange={(e) => setNuevoAnimal({...nuevoAnimal, ueln: e.target.value})}
                    />
                    <Input
                      placeholder="Microchip"
                      value={nuevoAnimal.microchip}
                      onChange={(e) => setNuevoAnimal({...nuevoAnimal, microchip: e.target.value})}
                    />
                    <Input
                      placeholder="Raza"
                      value={nuevoAnimal.raza}
                      onChange={(e) => setNuevoAnimal({...nuevoAnimal, raza: e.target.value})}
                    />
                    <Select value={nuevoAnimal.sexo} onValueChange={(value) => setNuevoAnimal({...nuevoAnimal, sexo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Macho">Macho</SelectItem>
                        <SelectItem value="Hembra">Hembra</SelectItem>
                        <SelectItem value="Castrado">Castrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="Fecha Nacimiento"
                      value={nuevoAnimal.fechaNacimiento}
                      onChange={(e) => setNuevoAnimal({...nuevoAnimal, fechaNacimiento: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={agregarAnimal} size="sm">
                      Agregar Animal
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setMostrarFormularioAnimal(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de animales en inventario */}
            {inventarioAnimales.length > 0 && (
              <div className="space-y-2">
                <Label>Animales en la Explotación ({inventarioAnimales.length})</Label>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {inventarioAnimales.map((animal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{animal.nombre}</p>
                            <p className="text-sm text-gray-600">{animal.ueln}</p>
                          </div>
                          <Badge variant="outline">{animal.raza}</Badge>
                          <Badge variant={animal.sexo === 'Macho' ? 'default' : 'secondary'}>
                            {animal.sexo}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarAnimal(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inventarioAnimales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay animales en el inventario</p>
                <p className="text-sm">Agrega caballos existentes o registra nuevos animales</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createOrUpdateFarm.isPending}>
            {createOrUpdateFarm.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Actualizando..." : "Registrando..."}
              </>
            ) : (
              isEdit ? "Actualizar Explotación" : "Registrar Explotación"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}