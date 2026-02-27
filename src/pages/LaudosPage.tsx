import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Trash2 } from "lucide-react";
import { getLaudos, getObras, getClientes, deleteLaudo } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

const LaudosPage = () => {
  const navigate = useNavigate();
  const [laudos, setLaudos] = useState(getLaudos());
  const obras = getObras();
  const clientes = getClientes();

  const handleDelete = (id: string) => {
    deleteLaudo(id);
    setLaudos(getLaudos());
    toast.success("Laudo removido");
  };

  return (
    <div>
      <PageHeader
        title="Laudos Cautelares"
        description="Gerenciamento de laudos de vizinhança"
        action={
          <Button className="gap-2" onClick={() => navigate("/laudos/novo")}>
            <Plus size={16} /> Novo Laudo
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {laudos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhum laudo cadastrado. Cadastre clientes e obras primeiro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Endereço Vistoriado</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laudos.map(l => {
                  const obra = obras.find(o => o.id === l.obraId);
                  const cliente = clientes.find(c => c.id === l.clienteId);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{obra?.nome || "—"}</TableCell>
                      <TableCell>{cliente?.razaoSocial || "—"}</TableCell>
                      <TableCell className="text-sm">{l.enderecoImovelVistoriado}</TableCell>
                      <TableCell>{l.fotos.length}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          l.status === 'completo' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>{l.status === 'completo' ? 'Completo' : 'Rascunho'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/laudos/${l.id}`)}><Eye size={14} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaudosPage;
