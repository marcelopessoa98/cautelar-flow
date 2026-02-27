import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Obra } from "@/lib/types";
import { getObras, saveObra, deleteObra, getClientes } from "@/lib/store";
import { toast } from "sonner";

const emptyObra = (): Obra => ({
  id: crypto.randomUUID(),
  nome: "", referencia: "", clienteId: "", filial: "",
  endereco: "", bairro: "", cidade: "", estado: "CE",
  status: "em_andamento",
  dataInicio: new Date().toISOString().split("T")[0],
  previsaoTermino: "",
  createdAt: new Date().toISOString(),
});

const ObrasPage = () => {
  const [obras, setObras] = useState(getObras());
  const clientes = getClientes();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [form, setForm] = useState<Obra>(emptyObra());

  const refresh = () => setObras(getObras());

  const handleSave = () => {
    if (!form.nome || !form.clienteId) {
      toast.error("Nome e Cliente são obrigatórios");
      return;
    }
    saveObra(form);
    toast.success(editing ? "Obra atualizada" : "Obra cadastrada");
    setOpen(false); setEditing(null); setForm(emptyObra());
    refresh();
  };

  const handleEdit = (o: Obra) => { setEditing(o); setForm({ ...o }); setOpen(true); };
  const handleDelete = (id: string) => { deleteObra(id); toast.success("Obra removida"); refresh(); };
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyObra()); }
  };

  const clienteNome = (id: string) => clientes.find(c => c.id === id)?.razaoSocial || "—";

  return (
    <div>
      <PageHeader
        title="Obras"
        description="Cadastro de obras vinculadas a clientes"
        action={
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Nova Obra</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Obra" : "Nova Obra"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Nome da Obra *</Label>
                  <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <Label>Cliente *</Label>
                  <Select value={form.clienteId} onValueChange={v => setForm({ ...form, clienteId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.filter(c => c.status === 'ativo').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.razaoSocial}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Referência Interna</Label>
                  <Input value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
                </div>
                <div>
                  <Label>Filial</Label>
                  <Input value={form.filial} onChange={e => setForm({ ...form, filial: e.target.value })} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Bairro</Label><Input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} /></div>
                  <div><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Estado</Label><Input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Obra['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em_andamento">Em andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="pausada">Pausada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Data de Início</Label><Input type="date" value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} /></div>
                  <div><Label>Previsão Término</Label><Input type="date" value={form.previsaoTermino} onChange={e => setForm({ ...form, previsaoTermino: e.target.value })} /></div>
                </div>
                <Button className="w-full" onClick={handleSave}>
                  {editing ? "Salvar Alterações" : "Cadastrar Obra"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {obras.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhuma obra cadastrada. Cadastre um cliente primeiro.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {obras.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.nome}</TableCell>
                    <TableCell>{clienteNome(o.clienteId)}</TableCell>
                    <TableCell>{o.cidade}/{o.estado}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        o.status === 'em_andamento' ? 'bg-accent/10 text-accent' :
                        o.status === 'concluida' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {o.status === 'em_andamento' ? 'Em andamento' : o.status === 'concluida' ? 'Concluída' : 'Pausada'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(o)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ObrasPage;
