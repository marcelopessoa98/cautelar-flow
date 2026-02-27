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
import { Cliente } from "@/lib/types";
import { getClientes, saveCliente, deleteCliente } from "@/lib/store";
import { toast } from "sonner";

const emptyCliente = (): Cliente => ({
  id: crypto.randomUUID(),
  razaoSocial: "",
  cpfCnpj: "",
  telefones: "",
  email: "",
  endereco: "",
  status: "ativo",
  createdAt: new Date().toISOString(),
});

const ClientesPage = () => {
  const [clientes, setClientes] = useState(getClientes());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Cliente>(emptyCliente());

  const refresh = () => setClientes(getClientes());

  const handleSave = () => {
    if (!form.razaoSocial || !form.cpfCnpj) {
      toast.error("Razão Social e CPF/CNPJ são obrigatórios");
      return;
    }
    saveCliente(form);
    toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
    setOpen(false);
    setEditing(null);
    setForm(emptyCliente());
    refresh();
  };

  const handleEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ ...c });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCliente(id);
    toast.success("Cliente removido");
    refresh();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyCliente()); }
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro mestre de clientes"
        action={
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Razão Social *</Label>
                  <Input value={form.razaoSocial} onChange={e => setForm({ ...form, razaoSocial: e.target.value })} />
                </div>
                <div>
                  <Label>CPF/CNPJ *</Label>
                  <Input value={form.cpfCnpj} onChange={e => setForm({ ...form, cpfCnpj: e.target.value })} />
                </div>
                <div>
                  <Label>Telefones</Label>
                  <Input value={form.telefones} onChange={e => setForm({ ...form, telefones: e.target.value })} />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as 'ativo' | 'inativo' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSave}>
                  {editing ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {clientes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.razaoSocial}</TableCell>
                    <TableCell className="font-mono text-xs">{c.cpfCnpj}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.status === 'ativo' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>{c.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></Button>
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

export default ClientesPage;
