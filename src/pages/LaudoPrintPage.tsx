import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLaudos, getObras, getClientes, getEquipe } from "@/lib/store";
import { Laudo, Obra, Cliente, MembroEquipe } from "@/lib/types";
import { toast } from "sonner";

const LaudoPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laudo, setLaudo] = useState<Laudo | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!loading && laudo) {
      // Small delay to let images load, then trigger print
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, laudo]);

  if (loading) return <p className="text-center py-12 text-muted-foreground">Carregando...</p>;
  if (!laudo) return <p className="text-center py-20 text-muted-foreground">Laudo não encontrado.</p>;

  const endObra = obra ? `${obra.endereco}, ${obra.bairro} — ${obra.cidade}/${obra.estado}` : "—";
  const responsavel = membros.length > 0 ? membros[0].nome : "—";
  const sortedFotos = [...laudo.fotos].sort((a, b) => a.numero - b.numero);

  const objetivoTexto = "Este laudo cautelar de vizinhança tem como objetivo constatar as condições das propriedades adjacentes à obra em construção e já identificar possíveis danos existentes nestas. Essa avaliação é essencial para verificar a integridade das edificações em questão. O resultado é decorrente de uma vistoria técnica realizada por um profissional habilitado e experiente, que avalia minuciosamente as propriedades vizinhas à obra em construção.";

  const metodologia = "O presente documento é baseado na ABNT (Associação Brasileira de Normas Técnicas) e IBAPE (Instituto Brasileiro de Avaliação e Perícias de Engenharia), seguindo todas as aplicações práticas de vistoria cautelar de vizinhança, metodologia e parâmetros, de forma que atendam os pré-requisitos mínimos estabelecidos para o perfeito funcionamento de todo o sistema existente.";

  const notaPrevia = `O documento apresenta o Laudo Cautelar de Vizinhança realizado nos confrontantes do lote do ${obra?.nome || "Obra"} (${cliente?.razaoSocial || "Cliente"}), ${obra?.bairro || "Bairro"}, ${obra?.cidade || "Cidade"}-${obra?.estado || "UF"}.`;

  const avaliacaoDefault = "Diante do exposto neste laudo cautelar de vizinhança, conclui-se que foram realizadas todas as vistorias e análises necessárias para identificar possíveis danos e anomalias no imóvel. As informações e resultados obtidos foram descritos de forma clara e objetiva.\n\nAssim, a contratada atesta que realizou todas as atividades previstas neste contrato, e que o proprietário do imóvel vistoriado teve a oportunidade de acompanhar e esclarecer quaisquer dúvidas sobre as informações obtidas.\n\nPor fim, os responsáveis da contratada, contratante e o proprietário do imóvel vistoriado assinam este laudo cautelar de vizinhança, atestando a sua concordância e aceitação das informações apresentadas.";

  return (
    <div className="print-laudo-container bg-white text-black min-h-screen print-color-adjust-exact">
      {/* Screen-only back button */}
      <div className="print:hidden p-4 bg-gray-100 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800 text-white rounded text-sm">
          ← Voltar
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-red-700 text-white rounded text-sm font-medium">
          🖨 Imprimir / Salvar PDF
        </button>
        <span className="text-sm text-gray-500">Use "Salvar como PDF" na caixa de diálogo de impressão</span>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* FIXED HEADER (print only) */}
      {/* ════════════════════════════════════════════ */}
      <div className="hidden print:block print:fixed print:top-0 print:left-0 print:w-full print:h-[20mm] print:bg-white print:z-50">
        <div className="h-full flex items-center justify-between px-[15mm]" style={{ borderBottom: '2px solid #b40000' }}>
          <div className="flex items-center gap-3">
            <span className="text-[14pt] font-bold text-gray-800 tracking-tight">LAUDO CAUTELAR DE VIZINHANÇA</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* FIXED FOOTER (print only) */}
      {/* ════════════════════════════════════════════ */}
      <div className="hidden print:block print:fixed print:bottom-0 print:left-0 print:w-full print:h-[16mm] print:bg-white print:z-50">
        <div className="h-full flex items-center justify-center px-[15mm] text-center" style={{ borderTop: '1px solid #ccc' }}>
          <p className="text-[7pt] text-gray-500 italic leading-tight">
            Todo o resultado prescrito do presente relatório restringe-se às amostras ensaiadas. A reprodução do documento ou reprodução parcial está sendo proibido.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* MAIN CONTENT (with print margins for header/footer) */}
      {/* ════════════════════════════════════════════ */}
      <div className="print:mt-[24mm] print:mb-[20mm]">

        {/* ── CAPA ── */}
        <section className="print:break-after-page flex flex-col justify-center min-h-[calc(100vh-6rem)] print:min-h-0 print:h-auto px-8 py-16 print:px-0 print:py-0">
          <div className="print:pt-[60mm]">
            <h1 className="text-[28pt] font-bold text-gray-800 leading-tight">
              LAUDO CAUTELAR DE<br />VIZINHANÇA
            </h1>

            <div className="mt-12">
              <p className="text-[14pt] font-bold text-[#b40000]">{(obra?.nome || "Obra").toUpperCase()}</p>
              <p className="text-[11pt] font-bold text-[#b40000] mt-1">{laudo.enderecoImovelVistoriado || ""}</p>
            </div>

            <div className="mt-16 space-y-3">
              <p className="text-[11pt]">
                <span className="font-bold text-gray-800">Empresa contratante: </span>
                <span className="font-normal text-[#b40000]">{cliente?.razaoSocial || "—"}</span>
              </p>
              <p className="text-[11pt]">
                <span className="font-bold text-gray-800">Responsável: </span>
                <span className="font-normal text-[#b40000]">{responsavel}</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── EQUIPE TÉCNICA ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <h2 className="text-[14pt] font-bold text-gray-800 mb-6 print:break-after-avoid">Equipe Técnica</h2>
          {membros.length > 0 ? (
            <div className="space-y-4">
              {membros.map(m => (
                <div key={m.id} className="text-[10pt] leading-relaxed">
                  <p className="font-medium">{m.nome}</p>
                  <p>{m.cargo}</p>
                  <p>{m.formacao}</p>
                  <p>CREA: {m.crea}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10pt] text-gray-500">Nenhum membro atribuído.</p>
          )}
        </section>

        {/* ── NOTA PRÉVIA ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <h2 className="text-[14pt] font-bold text-gray-800 mb-6 print:break-after-avoid">Nota Prévia</h2>
          <p className="text-[10pt] leading-relaxed indent-4">{notaPrevia}</p>
        </section>

        {/* ── SUMÁRIO ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <h2 className="text-[14pt] font-bold text-gray-800 mb-6 print:break-after-avoid">SUMÁRIO</h2>
          <ol className="text-[11pt] space-y-2 list-none">
            {[
              "1. OBJETIVO",
              "2. IDENTIFICAÇÃO DO IMÓVEL VISTORIADO",
              "3. IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO",
              "4. METODOLOGIA",
              "5. CARACTERÍSTICAS DO IMÓVEL VISTORIADO",
              "6. MEMORIAL FOTOGRÁFICO",
              "7. AVALIAÇÃO FINAL",
            ].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        {/* ── 1. OBJETIVO ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <SectionTitle number="1." title="OBJETIVO" />
          <p className="text-[10pt] leading-relaxed indent-4 mt-4">{objetivoTexto}</p>
        </section>

        {/* ── 2. IDENTIFICAÇÃO DO IMÓVEL VISTORIADO ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <SectionTitle number="2." title="IDENTIFICAÇÃO DO IMÓVEL VISTORIADO" />
          <p className="text-[10pt] indent-4 mt-4 mb-3">Segue as informações coletadas:</p>
          <BulletItem label="Solicitante" value={cliente?.razaoSocial || "—"} />
          <BulletItem label="Objeto" value={laudo.tipoImovel || "—"} />
          <BulletItem label="Objetivo" value={laudo.objetivo || "—"} />
          <BulletItem label="Endereço" value={laudo.enderecoImovelVistoriado || "—"} />
        </section>

        {/* ── 3. IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO ── */}
        <section className="px-8 py-4 print:px-0">
          <SectionTitle number="3." title="IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO" />
          <p className="text-[10pt] indent-4 mt-4 mb-3">Segue as informações coletadas:</p>
          <BulletItem label="Proprietário" value={cliente?.razaoSocial || "—"} />
          <BulletItem label="Tipo de ocupação" value={laudo.tipoOcupacao || "—"} />
          <BulletItem label="Características da edificação" value="Constituído por unidades autônomas distribuídas em blocos." />
          <BulletItem label="Vias de acesso" value={`A principal via de acesso é: ${laudo.viasAcesso || "—"}`} />
          <BulletItem label="Endereço" value={endObra} />
        </section>

        {/* ── FIGURA 1 ── */}
        {laudo.figuraLocalizacao && (
          <section className="print:break-before-page px-8 py-8 print:px-0">
            <div className="print:break-inside-avoid text-center">
              <p className="text-[9pt] italic text-[#b40000] mb-2">Figura 1 – Localização do imóvel vistoriado</p>
              <img
                src={laudo.figuraLocalizacao}
                alt="Localização"
                className="mx-auto border border-gray-300 rounded print:border-none print:shadow-none"
                style={{ width: '10.5cm', height: '16.97cm', objectFit: 'contain' }}
              />
              <p className="text-[9pt] text-gray-600 mt-2">Fonte: Adaptada Google Earth</p>
            </div>
          </section>
        )}

        {/* ── 4. METODOLOGIA ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <SectionTitle number="4." title="METODOLOGIA" />
          <p className="text-[10pt] leading-relaxed indent-4 mt-4">{metodologia}</p>
        </section>

        {/* ── FIGURA 2 ── */}
        {laudo.figuraFluxograma && (
          <section className="px-8 py-4 print:px-0">
            <p className="text-[10pt] mb-4 indent-4">A Figura 2 a seguir exemplifica o fluxograma considerado para a avaliação.</p>
            <div className="print:break-inside-avoid text-center">
              <p className="text-[9pt] italic text-[#b40000] mb-2">Figura 2 – Fluxograma de vistoria</p>
              <img
                src={laudo.figuraFluxograma}
                alt="Fluxograma"
                className="mx-auto border border-gray-300 rounded print:border-none print:shadow-none"
                style={{ width: '5.37cm', height: '13.44cm', objectFit: 'contain' }}
              />
              <p className="text-[8pt] italic text-gray-600 mt-2">Fonte: Adaptada de Burin et al. (2009)</p>
            </div>
          </section>
        )}

        {/* ── 5. CARACTERÍSTICAS ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <SectionTitle number="5." title="CARACTERÍSTICAS DO IMÓVEL VISTORIADO" />
          <div className="mt-4">
            <BulletItem label="Padrão construtivo" value={laudo.caracteristicas.padraoConstrutivo} />
            <BulletItem label="Quantidade de pavimentos" value={String(laudo.caracteristicas.pavimentos)} />
            <BulletItem label="Estruturas" value={laudo.caracteristicas.estrutura.join(", ") || "—"} />
            <BulletItem label="Vedação" value={laudo.caracteristicas.vedacao.join(", ") || "—"} />
            <BulletItem label="Acabamento de piso" value={laudo.caracteristicas.acabamentoPiso.join(", ") || "—"} />
            <BulletItem label="Acabamento de paredes" value={laudo.caracteristicas.acabamentoParedes.join(", ") || "—"} />
            <BulletItem label="Cobertura" value={laudo.caracteristicas.cobertura.join(", ") || "—"} />
          </div>
          <p className="text-[10pt] leading-relaxed indent-4 mt-6">
            O proprietário autorizou a entrada no imóvel e permitiu o registro fotográfico dos cômodos de sua residência. Ele está ciente da garantia pela qual o laudo representa.
          </p>
        </section>

        {/* ── 6. MEMORIAL FOTOGRÁFICO ── */}
        {sortedFotos.length > 0 && (
          <section className="print:break-before-page px-8 py-8 print:px-0">
            <SectionTitle number="6." title="MEMORIAL FOTOGRÁFICO" />
            <p className="text-[10pt] indent-4 mt-4 mb-6">Segue imagens para constatação do estado atual do imóvel.</p>

            {sortedFotos.map((foto) => (
              <div key={foto.id} className="print:break-inside-avoid mb-8 text-center">
                <p className="text-[10pt] italic text-[#b40000] mb-2 font-medium">
                  Imagem {foto.numero}
                </p>
                <img
                  src={foto.arquivo}
                  alt={`Imagem ${foto.numero}`}
                  className="w-full h-64 object-contain border border-gray-300 rounded print:border-none print:shadow-none mx-auto"
                  style={{ maxWidth: '160mm', maxHeight: '200mm' }}
                />
                {foto.descricao && (
                  <p className="text-[9pt] text-gray-600 mt-1 italic">{foto.descricao}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── 7. AVALIAÇÃO FINAL ── */}
        <section className="print:break-before-page px-8 py-8 print:px-0">
          <SectionTitle number="7." title="AVALIAÇÃO FINAL" />
          <div className="text-[10pt] leading-relaxed indent-4 mt-4 whitespace-pre-line">
            {laudo.avaliacaoFinal || avaliacaoDefault}
          </div>
        </section>

        {/* ── ASSINATURAS ── */}
        <section className="print:break-inside-avoid px-8 py-8 print:px-0 mt-12">
          <div className="flex flex-row justify-between items-end mt-16">
            <div className="text-center">
              {/* Space for signature image */}
              <div className="h-16"></div>
              <div className="border-t border-black w-64 text-center pt-2">
                <p className="text-[9pt]">Proprietário do imóvel vistoriado</p>
              </div>
            </div>
            <div className="text-center">
              {/* Space for signature image */}
              <div className="h-16"></div>
              <div className="border-t border-black w-64 text-center pt-2">
                <p className="text-[9pt]">Contratante</p>
              </div>
            </div>
          </div>

          {/* Technical team signatures */}
          {membros.length > 0 && (
            <div className="flex flex-wrap justify-center gap-12 mt-16">
              {membros.map(m => (
                <div key={m.id} className="text-center print:break-inside-avoid">
                  <div className="h-16"></div>
                  <div className="border-t border-black w-64 text-center pt-2">
                    <p className="text-[9pt] font-medium">{m.nome}</p>
                    <p className="text-[8pt] text-gray-600">{m.cargo} — CREA: {m.crea}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════ */
/* Sub-components */
/* ═══════════════════════════════════════════ */

const SectionTitle = ({ number, title }: { number: string; title: string }) => (
  <h2 className="text-[12pt] font-bold text-gray-800 print:break-after-avoid" style={{ borderBottom: '1.5px solid #333', paddingBottom: '3px' }}>
    {number}&nbsp;&nbsp;&nbsp;&nbsp;{title}
  </h2>
);

const BulletItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2 text-[10pt] leading-relaxed ml-4 mb-1">
    <span className="font-bold shrink-0">➤</span>
    <p>
      <span className="font-bold">{label}: </span>
      <span>{value}</span>
    </p>
  </div>
);

export default LaudoPrintPage;
