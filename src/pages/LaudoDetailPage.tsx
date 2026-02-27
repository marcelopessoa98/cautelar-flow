import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLaudos, getObras, getClientes, getEquipe } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

const LaudoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const laudo = getLaudos().find(l => l.id === id);
  const obra = laudo ? getObras().find(o => o.id === laudo.obraId) : null;
  const cliente = laudo ? getClientes().find(c => c.id === laudo.clienteId) : null;
  const equipe = getEquipe();

  if (!laudo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Laudo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/laudos")}>Voltar</Button>
      </div>
    );
  }

  const membros = equipe.filter(m => laudo.equipeIds.includes(m.id));

  return (
    <div>
      <PageHeader
        title={`Laudo — ${obra?.nome || "Obra"}`}
        description={`Cliente: ${cliente?.razaoSocial || "—"}`}
        action={
          <Button variant="outline" onClick={() => navigate("/laudos")} className="gap-2">
            <ArrowLeft size={16} /> Voltar
          </Button>
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
