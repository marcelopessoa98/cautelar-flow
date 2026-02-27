import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getClientes, getObras, getEquipe, saveLaudo } from "@/lib/store";
import {
  Laudo, FotoMemorial, CaracteristicasImovel,
  TIPOS_IMOVEL, PADROES_CONSTRUTIVOS, ESTRUTURAS, VEDACOES,
  ACABAMENTOS_PISO, ACABAMENTOS_PAREDE, COBERTURAS, TIPOS_OCUPACAO,
} from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Obra & Cliente",
  "Imóvel Vistoriado",
  "Características",
  "Imagens",
  "Equipe & Finalização",
];

const AVALIACAO_PADRAO = `Diante do exposto neste laudo cautelar de vizinhança, conclui-se que foram realizadas todas as vistorias e análises necessárias para identificar possíveis danos e anomalias no imóvel. As informações e resultados obtidos foram descritos de forma clara e objetiva.

Assim, a contratada atesta que realizou todas as atividades previstas neste contrato, e que o proprietário do imóvel vistoriado teve a oportunidade de acompanhar e esclarecer quaisquer dúvidas sobre as informações obtidas.

Por fim, os responsáveis da contratada, contratante e o proprietário do imóvel vistoriado assinam este laudo cautelar de vizinhança, atestando a sua concordância e aceitação das informações apresentadas.`;

const NovoLaudoPage = () => {
  const navigate = useNavigate();
  const clientes = getClientes().filter(c => c.status === "ativo");
  const obras = getObras();
  const equipe = getEquipe();

  const [step, setStep] = useState(0);
  const [obraId, setObraId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [enderecoVistoriado, setEnderecoVistoriado] = useState("");
  const [tipoImovel, setTipoImovel] = useState("");
  const [objetivo, setObjetivo] = useState("Identificar danos já existentes.");
  const [tipoOcupacao, setTipoOcupacao] = useState("");
  const [viasAcesso, setViasAcesso] = useState("");
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicasImovel>({
    tipoImovel: "", padraoConstrutivo: "", pavimentos: 1,
    estrutura: [], vedacao: [], acabamentoPiso: [], acabamentoParedes: [], cobertura: [],
  });
  const [equipeIds, setEquipeIds] = useState<string[]>([]);
  const [figLoc, setFigLoc] = useState<string>("");
  const [figFlux, setFigFlux] = useState<string>("");
  const [fotos, setFotos] = useState<FotoMemorial[]>([]);
  const [avaliacao, setAvaliacao] = useState(AVALIACAO_PADRAO);

  const obrasFiltradas = clienteId ? obras.filter(o => o.clienteId === clienteId) : obras;
  const selectedObra = obras.find(o => o.id === obraId);
  const selectedCliente = clientes.find(c => c.id === clienteId);

  const handleObraSelect = (id: string) => {
    setObraId(id);
    const obra = obras.find(o => o.id === id);
    if (obra) setClienteId(obra.clienteId);
  };

  const handleClienteSelect = (id: string) => {
    setClienteId(id);
    setObraId("");
  };

  const toggleMulti = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFotosUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFotos(prev => {
          const num = prev.length + i + 1;
          return [...prev, { id: crypto.randomUUID(), numero: num, arquivo: reader.result as string }];
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFoto = (id: string) => {
    setFotos(prev => prev.filter(f => f.id !== id).map((f, i) => ({ ...f, numero: i + 1 })));
  };

  const handleSave = (status: 'rascunho' | 'completo') => {
    if (!obraId || !clienteId) { toast.error("Selecione obra e cliente"); return; }
    if (status === 'completo' && !enderecoVistoriado) { toast.error("Endereço do imóvel vistoriado é obrigatório"); return; }

    const laudo: Laudo = {
      id: crypto.randomUUID(),
      obraId, clienteId,
      enderecoImovelVistoriado: enderecoVistoriado,
      tipoImovel, objetivo, tipoOcupacao, viasAcesso,
      caracteristicas: { ...caracteristicas, tipoImovel },
      equipeIds,
      figuraLocalizacao: figLoc || undefined,
      figuraFluxograma: figFlux || undefined,
      fotos,
      avaliacaoFinal: avaliacao,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLaudo(laudo);
    toast.success(status === 'completo' ? "Laudo criado com sucesso!" : "Rascunho salvo");
    navigate("/laudos");
  };

  return (
    <div>
      <PageHeader title="Novo Laudo Cautelar" description="Preencha os dados do laudo passo a passo" />

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              i === step ? "bg-primary text-primary-foreground" :
              i < step ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
            )}
          >
            <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Obra & Cliente */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Seleção de Obra e Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={handleClienteSelect}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.razaoSocial} — {c.cpfCnpj}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Obra *</Label>
              <Select value={obraId} onValueChange={handleObraSelect}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>
                  {obrasFiltradas.map(o => <SelectItem key={o.id} value={o.id}>{o.nome} — {o.endereco}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedObra && selectedCliente && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Dados herdados automaticamente:</p>
                <p className="text-sm text-muted-foreground">Contratante: {selectedCliente.razaoSocial}</p>
                <p className="text-sm text-muted-foreground">CNPJ: {selectedCliente.cpfCnpj}</p>
                <p className="text-sm text-muted-foreground">Obra: {selectedObra.nome}</p>
                <p className="text-sm text-muted-foreground">Endereço da Obra: {selectedObra.endereco}, {selectedObra.bairro} — {selectedObra.cidade}/{selectedObra.estado}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Imóvel Vistoriado */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Identificação do Imóvel Vistoriado</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Endereço do Imóvel Vistoriado *</Label>
              <Input value={enderecoVistoriado} onChange={e => setEnderecoVistoriado(e.target.value)} placeholder="Ex: Rua Júlio Pinto, 2080" />
            </div>
            <div>
              <Label>Tipo de Imóvel</Label>
              <Select value={tipoImovel} onValueChange={setTipoImovel}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{TIPOS_IMOVEL.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input value={objetivo} onChange={e => setObjetivo(e.target.value)} />
            </div>
            <div>
              <Label>Tipo de Ocupação</Label>
              <Select value={tipoOcupacao} onValueChange={setTipoOcupacao}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{TIPOS_OCUPACAO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vias de Acesso</Label>
              <Input value={viasAcesso} onChange={e => setViasAcesso(e.target.value)} placeholder="Ex: Av. José Jatahy, Av. Duque de Caxias" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Características */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Características do Imóvel Vistoriado</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Padrão Construtivo</Label>
              <Select value={caracteristicas.padraoConstrutivo} onValueChange={v => setCaracteristicas({ ...caracteristicas, padraoConstrutivo: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{PADROES_CONSTRUTIVOS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pavimentos</Label>
              <Input type="number" min={1} value={caracteristicas.pavimentos} onChange={e => setCaracteristicas({ ...caracteristicas, pavimentos: parseInt(e.target.value) || 1 })} />
            </div>
            <MultiCheckGroup label="Estrutura" options={ESTRUTURAS} selected={caracteristicas.estrutura} onChange={v => setCaracteristicas({ ...caracteristicas, estrutura: toggleMulti(caracteristicas.estrutura, v) })} />
            <MultiCheckGroup label="Vedação" options={VEDACOES} selected={caracteristicas.vedacao} onChange={v => setCaracteristicas({ ...caracteristicas, vedacao: toggleMulti(caracteristicas.vedacao, v) })} />
            <MultiCheckGroup label="Acabamento de Piso" options={ACABAMENTOS_PISO} selected={caracteristicas.acabamentoPiso} onChange={v => setCaracteristicas({ ...caracteristicas, acabamentoPiso: toggleMulti(caracteristicas.acabamentoPiso, v) })} />
            <MultiCheckGroup label="Acabamento de Paredes" options={ACABAMENTOS_PAREDE} selected={caracteristicas.acabamentoParedes} onChange={v => setCaracteristicas({ ...caracteristicas, acabamentoParedes: toggleMulti(caracteristicas.acabamentoParedes, v) })} />
            <MultiCheckGroup label="Cobertura" options={COBERTURAS} selected={caracteristicas.cobertura} onChange={v => setCaracteristicas({ ...caracteristicas, cobertura: toggleMulti(caracteristicas.cobertura, v) })} />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Imagens */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Figura 1 — Localização (Google Maps)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Tamanho fixo: 10,5 cm × 16,97 cm — Legenda automática</p>
              {figLoc ? (
                <div className="relative inline-block">
                  <img src={figLoc} alt="Localização" className="max-w-sm rounded-md border" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setFigLoc("")}><X size={14} /></Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload size={24} className="text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload da imagem de localização</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setFigLoc)} />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Figura 2 — Fluxograma</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Tamanho fixo: 5,37 cm × 13,44 cm</p>
              {figFlux ? (
                <div className="relative inline-block">
                  <img src={figFlux} alt="Fluxograma" className="max-w-sm rounded-md border" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setFigFlux("")}><X size={14} /></Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload size={24} className="text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload do fluxograma (ou usar padrão)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setFigFlux)} />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Memorial Fotográfico</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{fotos.length} foto(s) adicionada(s). Upload múltiplo — ordenação automática.</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-4">
                <ImageIcon size={24} className="text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Clique para adicionar fotos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFotosUpload} />
              </label>
              {fotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {fotos.map(f => (
                    <div key={f.id} className="relative group">
                      <img src={f.arquivo} alt={`Foto ${f.numero}`} className="w-full h-32 object-cover rounded-md border" />
                      <span className="absolute bottom-1 left-1 bg-foreground/80 text-background text-xs px-2 py-0.5 rounded font-mono">
                        {f.numero}
                      </span>
                      <Button
                        variant="destructive" size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFoto(f.id)}
                      ><X size={12} /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Equipe & Finalização */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Equipe Técnica</CardTitle></CardHeader>
            <CardContent>
              {equipe.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cadastre membros na seção Equipe Técnica primeiro.</p>
              ) : (
                <div className="space-y-3">
                  {equipe.map(m => (
                    <label key={m.id} className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox
                        checked={equipeIds.includes(m.id)}
                        onCheckedChange={() => setEquipeIds(prev =>
                          prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">{m.cargo} — {m.formacao} — CREA: {m.crea}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Avaliação Final</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={avaliacao} onChange={e => setAvaliacao(e.target.value)} rows={8} className="text-sm" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="gap-2">
          <ArrowLeft size={16} /> Anterior
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleSave('rascunho')} className="gap-2">
            <Save size={16} /> Salvar Rascunho
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gap-2">
              Próximo <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={() => handleSave('completo')} className="gap-2">
              <Save size={16} /> Finalizar Laudo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

function MultiCheckGroup({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (val: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 cursor-pointer text-sm transition-colors">
            <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default NovoLaudoPage;
