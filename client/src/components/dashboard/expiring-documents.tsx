import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rabbit, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpiringDocumentsProps {
  userId: number;
}

export default function ExpiringDocuments({ userId }: ExpiringDocumentsProps) {
  const { data: pasaportes = [], isLoading: loadingPasaportes } = useQuery({
    queryKey: ["/api/pasaportes", { expiring: true }],
  });

  const { data: certificados = [], isLoading: loadingCertificados } = useQuery({
    queryKey: ["/api/certificados-salud", { expiring: true }],
  });

  const { data: caballos = [] } = useQuery({
    queryKey: ["/api/caballos", userId],
  });

  const isLoading = loadingPasaportes || loadingCertificados;

  // Combine documents and get horse names
  const expiringDocuments = [
    ...pasaportes.map((p: any) => ({
      ...p,
      type: "Pasaporte Equino",
      typeColor: "blue",
      documentNumber: p.numeroPasaporte,
      expiryDate: p.fechaValidez,
      horseName: caballos.find((c: any) => c.id === p.idCaballo)?.nombre || "Desconocido",
      horseId: caballos.find((c: any) => c.id === p.idCaballo)?.ueln || "N/A"
    })),
    ...certificados.map((c: any) => ({
      ...c,
      type: "Certificado Salud",
      typeColor: "green",
      documentNumber: c.numeroCertificado,
      expiryDate: c.fechaValidez,
      horseName: caballos.find((h: any) => h.id === c.idCaballo)?.nombre || "Desconocido",
      horseId: caballos.find((h: any) => h.id === c.idCaballo)?.ueln || "N/A"
    }))
  ];

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos por Vencer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documentos por Vencer</CardTitle>
            <CardDescription>
              Documentos que requieren renovación próximamente
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expiringDocuments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay documentos próximos a vencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Caballo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Documento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Vence</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expiringDocuments.map((doc: any) => {
                  const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate);
                  return (
                    <tr key={`${doc.type}-${doc.id}`} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Rabbit className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.horseName}</p>
                            <p className="text-sm text-gray-500">{doc.horseId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">{doc.documentNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={doc.typeColor === "blue" ? "default" : "secondary"}>
                          {doc.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">
                          {format(new Date(doc.expiryDate), "dd/MM/yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-orange-600">
                          En {daysUntilExpiry} días
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Por vencer
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Renovar
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
