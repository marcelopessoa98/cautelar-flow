import jsPDF from "jspdf";
import { Laudo, Obra, Cliente, MembroEquipe } from "./types";

// Dimensions in mm (A4)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_L = 25;
const MARGIN_R = 25;
const MARGIN_T = 45; // space below header
const MARGIN_B = 45; // space above footer
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// Fixed image sizes from the template
const FIG1_W = 105; // 10.5cm
const FIG1_H = 169.7; // 16.97cm
const FIG2_W = 53.7; // 5.37cm
const FIG2_H = 134.4; // 13.44cm

// Memorial photo: full width, tall – 2 per page vertically
const PHOTO_W = CONTENT_W;
const PHOTO_H = 100; // each photo ~100mm tall to fit 2 per page with captions

// ─── Header & Footer (all pages except cover) ───

function addHeaderFooter(doc: jsPDF, skipPages: number[] = []) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    if (skipPages.includes(i)) continue;
    doc.setPage(i);

    // Header bar
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, PAGE_W, 28, "F");
    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(0, 28, PAGE_W, 28);

    // Header text
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text("LAUDO CAUTELAR DE VIZINHANÇA", PAGE_W / 2, 18, { align: "center" });

    // Page number
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W - MARGIN_R, 18, { align: "right" });

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    const footerY = PAGE_H - 22;
    doc.text(
      "Todo o resultado prescrito do presente relatório restringe-se às amostras ensaiadas. A reprodução do documento ou reprodução parcial está sendo proibido.",
      PAGE_W / 2, footerY, { align: "center", maxWidth: CONTENT_W + 20 }
    );
  }
}

// ─── Helpers ───

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN_B) {
    doc.addPage();
    return MARGIN_T;
  }
  return y;
}

function sectionTitle(doc: jsPDF, number: string, text: string, y: number): number {
  y = checkPage(doc, y, 14);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  const fullText = `${number}    ${text}`;
  doc.text(fullText, MARGIN_L, y);
  // Underline
  const textW = doc.getTextWidth(fullText);
  doc.setDrawColor(30);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_L, y + 1.5, MARGIN_L + Math.min(textW, CONTENT_W), y + 1.5);
  return y + 10;
}

function bulletItem(doc: jsPDF, label: string, value: string, y: number): number {
  y = checkPage(doc, y, 10);
  doc.setFontSize(10);

  // Bullet arrow
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("➤", MARGIN_L + 5, y);

  // Label bold
  const bulletOffset = 12;
  doc.text(`${label}: `, MARGIN_L + bulletOffset, y);
  const labelW = doc.getTextWidth(`${label}: `);

  // Value normal
  doc.setFont("helvetica", "normal");
  const maxW = CONTENT_W - bulletOffset - labelW;
  const lines = doc.splitTextToSize(value || "—", maxW);
  doc.text(lines, MARGIN_L + bulletOffset + labelW, y);
  return y + lines.length * 5 + 3;
}

function paragraph(doc: jsPDF, text: string, y: number, indent: number = 0): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  const lines = doc.splitTextToSize(text || "—", CONTENT_W - indent);
  for (const line of lines) {
    y = checkPage(doc, y, 6);
    doc.text(line, MARGIN_L + indent, y);
    y += 5;
  }
  return y + 2;
}

async function loadImage(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Main generator ───

export async function generateLaudoPdf(
  laudo: Laudo,
  obra: Obra | null,
  cliente: Cliente | null,
  membros: MembroEquipe[]
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const endObra = obra ? `${obra.endereco}, ${obra.bairro} — ${obra.cidade}/${obra.estado}` : "—";

  // ═══════════════════════════════════════════
  // PAGE 1: COVER (no header/footer)
  // ═══════════════════════════════════════════
  let y = 80;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("LAUDO CAUTELAR DE", PAGE_W / 2, y, { align: "center" });
  y += 14;
  doc.text("VIZINHANÇA", PAGE_W / 2, y, { align: "center" });

  y += 30;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 0, 0);
  const obraNome = obra?.nome || "Obra";
  doc.text(obraNome.toUpperCase(), MARGIN_L, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(laudo.enderecoImovelVistoriado || "", MARGIN_L, y);

  y += 40;
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("Empresa contratante: ", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 0, 0);
  doc.text(cliente?.razaoSocial || "—", MARGIN_L + doc.getTextWidth("Empresa contratante: "), y);

  y += 8;
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("Responsável: ", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 0, 0);
  const responsavel = membros.length > 0 ? membros[0].nome : "—";
  doc.text(responsavel, MARGIN_L + doc.getTextWidth("Responsável: "), y);

  // ═══════════════════════════════════════════
  // PAGE 2: EQUIPE TÉCNICA
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("Equipe Técnica", MARGIN_L, y);
  y += 12;

  if (membros.length > 0) {
    for (const m of membros) {
      y = checkPage(doc, y, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30);
      doc.text(m.nome, MARGIN_L, y);
      y += 5;
      doc.text(`${m.cargo}`, MARGIN_L, y);
      y += 5;
      doc.text(m.formacao, MARGIN_L, y);
      y += 5;
      doc.text(`CREA: ${m.crea}`, MARGIN_L, y);
      y += 10;
    }
  } else {
    y = paragraph(doc, "Nenhum membro atribuído.", y);
  }

  // ═══════════════════════════════════════════
  // PAGE 3: NOTA PRÉVIA
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("Nota Prévia", MARGIN_L, y);
  y += 10;

  const notaPrevia = `O documento apresenta o Laudo Cautelar de Vizinhança realizado nos confrontantes do lote do ${obraNome} (${cliente?.razaoSocial || "Cliente"}), ${obra?.bairro || "Bairro"}, ${obra?.cidade || "Cidade"}-${obra?.estado || "UF"}.`;
  y = paragraph(doc, notaPrevia, y, 5);

  // ═══════════════════════════════════════════
  // PAGE 4: SUMÁRIO
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("SUMÁRIO", MARGIN_L, y);
  y += 12;

  const sumarioItems = [
    "1. OBJETIVO",
    "2. IDENTIFICAÇÃO DO IMÓVEL VISTORIADO",
    "3. IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO",
    "4. METODOLOGIA",
    "5. CARACTERÍSTICAS DO IMÓVEL VISTORIADO",
    "6. MEMORIAL FOTOGRÁFICO",
    "7. AVALIAÇÃO FINAL",
  ];
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  for (const item of sumarioItems) {
    doc.text(item, MARGIN_L, y);
    y += 8;
  }

  // ═══════════════════════════════════════════
  // PAGE 5: OBJETIVO + IDENTIFICAÇÕES
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;

  y = sectionTitle(doc, "1.", "OBJETIVO", y);
  const objetivoTexto = "Este laudo cautelar de vizinhança tem como objetivo constatar as condições das propriedades adjacentes à obra em construção e já identificar possíveis danos existentes nestas. Essa avaliação é essencial para verificar a integridade das edificações em questão. O resultado é decorrente de uma vistoria técnica realizada por um profissional habilitado e experiente, que avalia minuciosamente as propriedades vizinhas à obra em construção.";
  y = paragraph(doc, objetivoTexto, y, 5);
  y += 4;

  y = sectionTitle(doc, "2.", "IDENTIFICAÇÃO DO IMÓVEL VISTORIADO", y);
  y = paragraph(doc, "Segue as informações coletadas:", y, 5);
  y += 2;
  y = bulletItem(doc, "Solicitante", cliente?.razaoSocial || "—", y);
  y = bulletItem(doc, "Objeto", laudo.tipoImovel || "—", y);
  y = bulletItem(doc, "Objetivo", laudo.objetivo || "—", y);
  y = bulletItem(doc, "Endereço", laudo.enderecoImovelVistoriado || "—", y);
  y += 4;

  y = sectionTitle(doc, "3.", "IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO", y);
  y = paragraph(doc, "Segue as informações coletadas:", y, 5);
  y += 2;
  y = bulletItem(doc, "Proprietário", cliente?.razaoSocial || "—", y);
  y = bulletItem(doc, "Tipo de ocupação", laudo.tipoOcupacao || "—", y);
  y = bulletItem(doc, "Características da edificação", "Constituído por unidades autônomas distribuídas em blocos.", y);
  y = bulletItem(doc, "Vias de acesso", `A principal via de acesso é: ${laudo.viasAcesso || "—"}`, y);
  y = bulletItem(doc, "Endereço", endObra, y);

  // ═══════════════════════════════════════════
  // PAGE 6: FIGURA 1 + METODOLOGIA
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;

  if (laudo.figuraLocalizacao) {
    try {
      const imgData = await loadImage(laudo.figuraLocalizacao);
      // Scale to fit page while respecting aspect ratio
      const maxFigH = PAGE_H - MARGIN_T - MARGIN_B - 30; // leave room for caption + methodology
      let figW = FIG1_W;
      let figH = FIG1_H;
      if (figH > maxFigH * 0.6) {
        const scale = (maxFigH * 0.6) / figH;
        figW *= scale;
        figH *= scale;
      }
      if (figW > CONTENT_W) {
        const scale = CONTENT_W / figW;
        figW *= scale;
        figH *= scale;
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 0, 0);
      doc.text("Figura 1", PAGE_W / 2, y, { align: "center" });
      y += 4;

      doc.addImage(imgData, "JPEG", MARGIN_L + (CONTENT_W - figW) / 2, y, figW, figH);
      y += figH + 4;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30);
      doc.text("Fonte: Adaptada Google Earth", PAGE_W / 2, y, { align: "center" });
      y += 10;
    } catch {
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("[Figura 1 – Erro ao carregar imagem]", MARGIN_L, y);
      y += 10;
    }
  }

  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "4.", "METODOLOGIA", y);
  const metodologia = "O presente documento é baseado na ABNT (Associação Brasileira de Normas Técnicas) e IBAPE (Instituto Brasileiro de Avaliação e Perícias de Engenharia), seguindo todas as aplicações práticas de vistoria cautelar de vizinhança, metodologia e parâmetros, de forma que atendam os pré-requisitos mínimos estabelecidos para o perfeito funcionamento de todo o sistema existente.";
  y = paragraph(doc, metodologia, y, 5);

  // ═══════════════════════════════════════════
  // PAGE 7: FIGURA 2 + CARACTERÍSTICAS
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;

  if (laudo.figuraFluxograma) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30);
    doc.text("A Figura 2 a seguir exemplifica o fluxograma considerado para a avaliação.", MARGIN_L, y, { maxWidth: CONTENT_W });
    y += 10;

    try {
      const imgData = await loadImage(laudo.figuraFluxograma);
      let figW = FIG2_W;
      let figH = FIG2_H;
      const maxH = 80;
      if (figH > maxH) {
        const scale = maxH / figH;
        figW *= scale;
        figH *= scale;
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 0, 0);
      doc.text("Figura 2 - Fluxograma de vistoria", PAGE_W / 2, y, { align: "center" });
      y += 4;

      doc.addImage(imgData, "JPEG", MARGIN_L + (CONTENT_W - figW) / 2, y, figW, figH);
      y += figH + 4;

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(30);
      doc.text("Fonte: Adaptada de Burin et al. (2009)", PAGE_W / 2, y, { align: "center" });
      y += 10;
    } catch {
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("[Figura 2 – Erro ao carregar imagem]", MARGIN_L, y);
      y += 10;
    }
  }

  y = checkPage(doc, y, 60);
  y = sectionTitle(doc, "5.", "CARACTERÍSTICAS DO IMÓVEL VISTORIADO", y);
  y += 2;
  y = bulletItem(doc, "Padrão construtivo", laudo.caracteristicas.padraoConstrutivo, y);
  y = bulletItem(doc, "Quantidade de pavimentos", String(laudo.caracteristicas.pavimentos), y);
  y = bulletItem(doc, "Estruturas", laudo.caracteristicas.estrutura.join(", ") || "—", y);
  y = bulletItem(doc, "Vedação", laudo.caracteristicas.vedacao.join(", ") || "—", y);
  y = bulletItem(doc, "Acabamento de piso", laudo.caracteristicas.acabamentoPiso.join(", ") || "—", y);
  y = bulletItem(doc, "Acabamento de paredes", laudo.caracteristicas.acabamentoParedes.join(", ") || "—", y);
  y = bulletItem(doc, "Cobertura", laudo.caracteristicas.cobertura.join(", ") || "—", y);
  y += 4;
  y = paragraph(doc, "O proprietário autorizou a entrada no imóvel e permitiu o registro fotográfico dos cômodos de sua residência. Ele está ciente da garantia pela qual o laudo representa.", y, 5);

  // ═══════════════════════════════════════════
  // MEMORIAL FOTOGRÁFICO
  // ═══════════════════════════════════════════
  if (laudo.fotos.length > 0) {
    doc.addPage();
    y = MARGIN_T + 5;

    y = sectionTitle(doc, "6.", "MEMORIAL FOTOGRÁFICO", y);
    y = paragraph(doc, "Segue imagens para constatação do estado atual do imóvel.", y, 5);
    y += 4;

    // Sort photos by number
    const sortedFotos = [...laudo.fotos].sort((a, b) => a.numero - b.numero);

    for (let i = 0; i < sortedFotos.length; i++) {
      const foto = sortedFotos[i];

      // Check if we need a new page (need space for label + photo + caption)
      const neededH = PHOTO_H + 14;
      y = checkPage(doc, y, neededH);

      // "Imagem X" label in italic centered ABOVE the photo
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(180, 0, 0);
      doc.text(`Imagem ${foto.numero}`, PAGE_W / 2, y, { align: "center" });
      y += 4;

      try {
        const imgData = await loadImage(foto.arquivo);
        doc.addImage(imgData, "JPEG", MARGIN_L, y, PHOTO_W, PHOTO_H, undefined, "MEDIUM");
      } catch {
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.rect(MARGIN_L, y, PHOTO_W, PHOTO_H);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.setFont("helvetica", "normal");
        doc.text(`[Imagem ${foto.numero} indisponível]`, PAGE_W / 2, y + PHOTO_H / 2, { align: "center" });
      }

      y += PHOTO_H + 6;
    }
  }

  // ═══════════════════════════════════════════
  // AVALIAÇÃO FINAL + ASSINATURAS
  // ═══════════════════════════════════════════
  doc.addPage();
  y = MARGIN_T + 5;

  y = sectionTitle(doc, "7.", "AVALIAÇÃO FINAL", y);

  const avaliacaoDefault = "Diante do exposto neste laudo cautelar de vizinhança, conclui-se que foram realizadas todas as vistorias e análises necessárias para identificar possíveis danos e anomalias no imóvel. As informações e resultados obtidos foram descritos de forma clara e objetiva.\n\nAssim, a contratada atesta que realizou todas as atividades previstas neste contrato, e que o proprietário do imóvel vistoriado teve a oportunidade de acompanhar e esclarecer quaisquer dúvidas sobre as informações obtidas.\n\nPor fim, os responsáveis da contratada, contratante e o proprietário do imóvel vistoriado assinam este laudo cautelar de vizinhança, atestando a sua concordância e aceitação das informações apresentadas.";
  const avaliacaoText = laudo.avaliacaoFinal || avaliacaoDefault;
  y = paragraph(doc, avaliacaoText, y, 5);

  // Signatures
  y += 20;
  y = checkPage(doc, y, 30);
  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  const sigW = 65;
  const sig1X = MARGIN_L + 5;
  const sig2X = MARGIN_L + CONTENT_W - sigW - 5;
  doc.line(sig1X, y, sig1X + sigW, y);
  doc.line(sig2X, y, sig2X + sigW, y);
  doc.setFontSize(9);
  doc.setTextColor(30);
  doc.setFont("helvetica", "normal");
  doc.text("Proprietário do imóvel vistoriado", sig1X + sigW / 2, y + 6, { align: "center" });
  doc.text("Contratante", sig2X + sigW / 2, y + 6, { align: "center" });

  // ═══════════════════════════════════════════
  // Add header/footer to all pages except cover (page 1)
  // ═══════════════════════════════════════════
  addHeaderFooter(doc, [1]);

  // Save
  const nomeCliente = cliente?.razaoSocial?.replace(/[^a-zA-Z0-9]/g, "_") || "Cliente";
  const nomeObra = obra?.nome?.replace(/[^a-zA-Z0-9]/g, "_") || "Obra";
  const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  doc.save(`Laudo_Cautelar_${nomeCliente}_${nomeObra}_${dataStr}.pdf`);
}
