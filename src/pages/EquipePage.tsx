import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MembroEquipe } from "@/lib/types";
import { getEquipe, saveMembro, deleteMembro } from "@/lib/store";
import { toast } from "sonner";

const emptyMembro = (): MembroEquipe => ({
  id: crypto.randomUUID(),
  nome: "", cargo: "", formacao: "", crea: "",
  createdAt: new Date().toISOString(),
});

const EquipePage = () => {
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MembroEquipe | null>(null);
  const [form, setForm] = useState<MembroEquipe>(emptyMembro());

  const refresh = async () => {
    try {
      setEquipe(await getEquipe());
    } catch (e: any) {
      toast.error("Erro ao carregar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleSave = async () => {
    if (!form.nome || !form.cargo) { toast.error("Nome e Cargo são obrigatórios"); return; }
    try {
      await saveMembro(form);
      toast.success(editing ? "Membro atualizado" : "Membro cadastrado");
      setOpen(false); setEditing(null); setForm(emptyMembro()); refresh();
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    }
  };

  const handleEdit = (m: MembroEquipe) => { setEditing(m); setForm({ ...m }); setOpen(true); };
  const handleDelete = async (id: string) => {
    try {
      await deleteMembro(id);
      toast.success("Membro removido");
      refresh();
    } catch (e: any) {
      toast.error("Erro ao remover: " + e.message);
    }
  };
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setEditing(null); setForm(emptyMembro()); }
  };

  if (loading) return <p className="text-center py-12 text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <PageHeader
        title="Equipe Técnica"
        description="Cadastro de profissionais reutilizáveis nos laudos"
        action={
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Novo Membro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Membro" : "Novo Membro"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div><Label>Cargo *</Label><Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} /></div>
                <div><Label>Formação</Label><Input value={form.formacao} onChange={e => setForm({ ...form, formacao: e.target.value })} /></div>
                <div><Label>CREA</Label><Input value={form.crea} onChange={e => setForm({ ...form, crea: e.target.value })} /></div>
                <Button className="w-full" onClick={handleSave}>
                  {editing ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {equipe.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Nenhum membro cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Formação</TableHead>
                  <TableHead>CREA</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipe.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell>{m.cargo}</TableCell>
                    <TableCell>{m.formacao}</TableCell>
                    <TableCell className="font-mono text-xs">{m.crea}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></Button>
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

export default EquipePage;
