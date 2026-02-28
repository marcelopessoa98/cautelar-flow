import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, Building2, HardHat, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientes, getObras, getEquipe, getLaudos } from "@/lib/store";
import { Cliente, Obra, MembroEquipe, Laudo } from "@/lib/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, o, e, l] = await Promise.all([getClientes(), getObras(), getEquipe(), getLaudos()]);
        setClientes(c); setObras(o); setEquipe(e); setLaudos(l);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const recentLaudos = laudos.slice(0, 5);

  if (loading) return <p className="text-center py-12 text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de laudos cautelares"
        action={
          <Button onClick={() => navigate("/laudos/novo")} className="gap-2">
            <Plus size={16} /> Novo Laudo
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clientes" value={clientes.length} icon={Users} />
        <StatCard label="Obras" value={obras.length} icon={Building2} />
        <StatCard label="Equipe" value={equipe.length} icon={HardHat} />
        <StatCard label="Laudos" value={laudos.length} icon={FileText} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Laudos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLaudos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum laudo cadastrado. Comece criando clientes e obras.
              </p>
            ) : (
              <div className="space-y-3">
                {recentLaudos.map((laudo) => {
                  const obra = obras.find(o => o.id === laudo.obraId);
                  const cliente = clientes.find(c => c.id === laudo.clienteId);
                  return (
                    <div
                      key={laudo.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/laudos/${laudo.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium">{obra?.nome || "Obra"}</p>
                        <p className="text-xs text-muted-foreground">{cliente?.razaoSocial}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        laudo.status === 'completo' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {laudo.status === 'completo' ? 'Completo' : 'Rascunho'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate("/clientes")}>
              <Users size={16} /> Gerenciar Clientes
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate("/obras")}>
              <Building2 size={16} /> Gerenciar Obras
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate("/equipe")}>
              <HardHat size={16} /> Gerenciar Equipe
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate("/laudos/novo")}>
              <FileText size={16} /> Criar Novo Laudo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
