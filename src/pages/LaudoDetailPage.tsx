import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLaudos, getObras, getClientes, getEquipe } from "@/lib/store";
import { Laudo, Obra, Cliente, MembroEquipe } from "@/lib/types";
import { ArrowLeft, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateLaudoPdf } from "@/lib/generateLaudoPdf";

const LaudoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laudo, setLaudo] = useState<Laudo | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!laudo) return;
    setExporting(true);
    try {
      await generateLaudoPdf(laudo, obra, cliente, membros);
      toast.success("PDF exportado com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [laudos, obras, clientes, equipe] = await Promise.all([
          getLaudos(), getObras(), getClientes(), getEquipe()
        ]);
        const found = laudos.find(l => l.id === id);
        if (found) {
          setLaudo(found);
          setObra(obras.find(o => o.id === found.obraId) || null);
          setCliente(clientes.find(c => c.id === found.clienteId) || null);
          setMembros(equipe.filter(m => found.equipeIds.includes(m.id)));
        }
      } catch (e: any) {
        toast.error("Erro ao carregar: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="text-center py-12 text-muted-foreground">Carregando...</p>;

  if (!laudo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Laudo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/laudos")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Laudo — ${obra?.nome || "Obra"}`}
        description={`Cliente: ${cliente?.razaoSocial || "—"}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/laudos")} className="gap-2">
              <ArrowLeft size={16} /> Voltar
            </Button>
            <Button onClick={() => navigate(`/laudos/${id}/print`)} className="gap-2">
              <FileDown size={16} /> Exportar PDF
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Identificação do Imóvel Vistoriado</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Endereço:</strong> {laudo.enderecoImovelVistoriado}</p>
            <p><strong>Tipo:</strong> {laudo.tipoImovel}</p>
            <p><strong>Objetivo:</strong> {laudo.objetivo}</p>
            <p><strong>Ocupação:</strong> {laudo.tipoOcupacao}</p>
            <p><strong>Vias de acesso:</strong> {laudo.viasAcesso}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Identificação do Imóvel a Ser Construído</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Proprietário:</strong> {cliente?.razaoSocial}</p>
            <p><strong>CNPJ:</strong> {cliente?.cpfCnpj}</p>
            <p><strong>Endereço da Obra:</strong> {obra?.endereco}, {obra?.bairro} — {obra?.cidade}/{obra?.estado}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Características do Imóvel</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p><strong>Padrão:</strong> {laudo.caracteristicas.padraoConstrutivo}</p>
              <p><strong>Pavimentos:</strong> {laudo.caracteristicas.pavimentos}</p>
              <p><strong>Estrutura:</strong> {laudo.caracteristicas.estrutura.join(", ") || "—"}</p>
              <p><strong>Vedação:</strong> {laudo.caracteristicas.vedacao.join(", ") || "—"}</p>
              <p><strong>Piso:</strong> {laudo.caracteristicas.acabamentoPiso.join(", ") || "—"}</p>
              <p><strong>Paredes:</strong> {laudo.caracteristicas.acabamentoParedes.join(", ") || "—"}</p>
              <p><strong>Cobertura:</strong> {laudo.caracteristicas.cobertura.join(", ") || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {(laudo.figuraLocalizacao || laudo.figuraFluxograma) && (
          <Card>
            <CardHeader><CardTitle className="text-base">Figuras</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {laudo.figuraLocalizacao && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Figura 1 – Localização do imóvel vistoriado</p>
                  <img src={laudo.figuraLocalizacao} alt="Localização" className="max-w-md rounded-md border" />
                  <p className="text-xs text-muted-foreground mt-1">Fonte: Adaptada do Google Maps</p>
                </div>
              )}
              {laudo.figuraFluxograma && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Figura 2 – Fluxograma</p>
                  <img src={laudo.figuraFluxograma} alt="Fluxograma" className="max-w-sm rounded-md border" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {laudo.fotos.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Memorial Fotográfico ({laudo.fotos.length} fotos)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {laudo.fotos.map(f => (
                  <div key={f.id} className="relative">
                    <img src={f.arquivo} alt={`Imagem ${f.numero}`} className="w-full h-32 object-cover rounded-md border" />
                    <span className="absolute bottom-1 left-1 bg-foreground/80 text-background text-xs px-2 py-0.5 rounded font-mono">{f.numero}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {membros.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Equipe Técnica</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {membros.map(m => (
                  <div key={m.id} className="p-3 rounded-md bg-muted/50 text-sm">
                    <p className="font-medium">{m.nome}</p>
                    <p className="text-muted-foreground">{m.cargo} — {m.formacao} — CREA: {m.crea}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Avaliação Final</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{laudo.avaliacaoFinal}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaudoDetailPage;
