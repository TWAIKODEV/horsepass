import { Eye, Edit, Download, Printer, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Horse {
  id: number;
  nombre: string;
  ueln: string;
  microchip: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  capa: string;
  paisOrigen: string;
  activo: boolean | null;
  idPropietario: number | null;
  idExplotacion: number | null;
  fechaRegistro: Date | null;
}

interface HorseListViewProps {
  horses: Horse[];
  onPreview: (horse: Horse) => void;
  onEdit: (horse: Horse) => void;
  onDownload: (horse: Horse) => void;
  onPrint: (horse: Horse) => void;
  onAdd: () => void;
}

export default function HorseListView({ 
  horses, 
  onPreview, 
  onEdit, 
  onDownload, 
  onPrint,
  onAdd 
}: HorseListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHorses = horses.filter(horse =>
    horse.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.ueln?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.raza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.microchip?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Gestión de Caballos</CardTitle>
            <CardDescription>
              Administra todos los caballos registrados en el sistema
            </CardDescription>
          </div>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caballo
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre, UELN, raza o microchip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>UELN</TableHead>
                <TableHead>Raza</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHorses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron caballos que coincidan con la búsqueda' : 'No hay caballos registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHorses.map((horse) => (
                  <TableRow key={horse.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{horse.nombre}</TableCell>
                    <TableCell className="font-mono text-sm">{horse.ueln}</TableCell>
                    <TableCell>{horse.raza}</TableCell>
                    <TableCell>
                      <Badge variant={horse.sexo === 'Macho' ? 'default' : 'secondary'}>
                        {horse.sexo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {horse.fechaNacimiento ? `${calculateAge(horse.fechaNacimiento)} años` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={horse.activo ? 'default' : 'destructive'}>
                        {horse.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(horse)}
                          title="Previsualizar"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(horse)}
                          title="Editar"
                          className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload(horse)}
                          title="Descargar"
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPrint(horse)}
                          title="Imprimir"
                          className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredHorses.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
              Mostrando {filteredHorses.length} de {horses.length} caballos
            </div>
            <div>
              {searchTerm && `Filtrado por: "${searchTerm}"`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}