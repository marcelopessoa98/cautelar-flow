import jsPDF from "jspdf";
import { Laudo, Obra, Cliente, MembroEquipe } from "./types";

// Dimensions in mm
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_L = 25;
const MARGIN_R = 25;
const MARGIN_T = 30;
const MARGIN_B = 25;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// Photo grid settings: 2 columns
const PHOTO_COLS = 2;
const PHOTO_GAP = 6;
const PHOTO_W = (CONTENT_W - PHOTO_GAP) / PHOTO_COLS;
const PHOTO_H = 55; // height per photo cell

function addPageNumber(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, PAGE_W / 2, PAGE_H - 10, { align: "center" });
  }
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN_B) {
    doc.addPage();
    return MARGIN_T;
  }
  return y;
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  y = checkPage(doc, y, 14);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 100);
  doc.text(text, MARGIN_L, y);
  y += 2;
  doc.setDrawColor(30, 58, 100);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_L, y, MARGIN_L + CONTENT_W, y);
  return y + 6;
}

function labelValue(doc: jsPDF, label: string, value: string, y: number): number {
  y = checkPage(doc, y, 8);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50);
  doc.text(label, MARGIN_L, y);
  const labelW = doc.getTextWidth(label + " ");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  const lines = doc.splitTextToSize(value || "—", CONTENT_W - labelW);
  doc.text(lines, MARGIN_L + labelW, y);
  return y + lines.length * 5 + 2;
}

function paragraph(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30);
  const lines = doc.splitTextToSize(text || "—", CONTENT_W);
  for (const line of lines) {
    y = checkPage(doc, y, 6);
    doc.text(line, MARGIN_L, y);
    y += 5;
  }
  return y + 2;
}

async function loadImage(url: string): Promise<string> {
  // If already base64, return as-is
  if (url.startsWith("data:")) return url;
  // Fetch and convert to base64
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateLaudoPdf(
  laudo: Laudo,
  obra: Obra | null,
  cliente: Cliente | null,
  membros: MembroEquipe[]
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===== COVER PAGE =====
  doc.setFillColor(30, 58, 100);
  doc.rect(0, 0, PAGE_W, 80, "F");
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text("LAUDO CAUTELAR", PAGE_W / 2, 35, { align: "center" });
  doc.setFontSize(14);
  doc.text("DE VIZINHANÇA", PAGE_W / 2, 48, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(obra?.nome || "Obra", PAGE_W / 2, 65, { align: "center" });

  let y = 100;
  doc.setTextColor(50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Contratante:", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.text(cliente?.razaoSocial || "—", MARGIN_L + 32, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("CPF/CNPJ:", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.text(cliente?.cpfCnpj || "—", MARGIN_L + 28, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Obra:", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.text(obra?.nome || "—", MARGIN_L + 16, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Endereço:", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  const endObra = obra ? `${obra.endereco}, ${obra.bairro} — ${obra.cidade}/${obra.estado}` : "—";
  doc.text(endObra, MARGIN_L + 26, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Data:", MARGIN_L, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(laudo.createdAt).toLocaleDateString("pt-BR"), MARGIN_L + 16, y);

  // ===== PAGE 2: Identification =====
  doc.addPage();
  y = MARGIN_T;

  y = sectionTitle(doc, "1. IDENTIFICAÇÃO DO IMÓVEL VISTORIADO", y);
  y = labelValue(doc, "Endereço:", laudo.enderecoImovelVistoriado, y);
  y = labelValue(doc, "Tipo de imóvel:", laudo.tipoImovel, y);
  y = labelValue(doc, "Objetivo:", laudo.objetivo, y);
  y = labelValue(doc, "Ocupação:", laudo.tipoOcupacao, y);
  y = labelValue(doc, "Vias de acesso:", laudo.viasAcesso, y);
  y += 4;

  y = sectionTitle(doc, "2. IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO", y);
  y = labelValue(doc, "Proprietário:", cliente?.razaoSocial || "—", y);
  y = labelValue(doc, "CNPJ/CPF:", cliente?.cpfCnpj || "—", y);
  y = labelValue(doc, "Endereço da obra:", endObra, y);
  y += 4;

  y = sectionTitle(doc, "3. CARACTERÍSTICAS DO IMÓVEL VISTORIADO", y);
  y = labelValue(doc, "Padrão construtivo:", laudo.caracteristicas.padraoConstrutivo, y);
  y = labelValue(doc, "Pavimentos:", String(laudo.caracteristicas.pavimentos), y);
  y = labelValue(doc, "Estrutura:", laudo.caracteristicas.estrutura.join(", ") || "—", y);
  y = labelValue(doc, "Vedação:", laudo.caracteristicas.vedacao.join(", ") || "—", y);
  y = labelValue(doc, "Piso:", laudo.caracteristicas.acabamentoPiso.join(", ") || "—", y);
  y = labelValue(doc, "Paredes:", laudo.caracteristicas.acabamentoParedes.join(", ") || "—", y);
  y = labelValue(doc, "Cobertura:", laudo.caracteristicas.cobertura.join(", ") || "—", y);
  y += 4;

  // ===== FIGURES =====
  if (laudo.figuraLocalizacao) {
    y = sectionTitle(doc, "4. LOCALIZAÇÃO DO IMÓVEL VISTORIADO", y);
    try {
      const imgData = await loadImage(laudo.figuraLocalizacao);
      // Fixed dimensions from memory: 10.5cm x 16.97cm → 105mm x 169.7mm — scale to fit
      const figW = Math.min(CONTENT_W, 105);
      const figH = (figW / 105) * 169.7;
      y = checkPage(doc, y, figH + 12);
      doc.addImage(imgData, "JPEG", MARGIN_L + (CONTENT_W - figW) / 2, y, figW, figH);
      y += figH + 4;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Figura 1 – Localização do imóvel vistoriado. Fonte: Adaptada do Google Maps", PAGE_W / 2, y, { align: "center" });
      y += 8;
    } catch {
      y = labelValue(doc, "Figura 1:", "(erro ao carregar imagem)", y);
    }
  }

  if (laudo.figuraFluxograma) {
    y = checkPage(doc, y, 80);
    if (!laudo.figuraLocalizacao) {
      y = sectionTitle(doc, "4. FIGURAS", y);
    }
    try {
      const imgData = await loadImage(laudo.figuraFluxograma);
      // 5.37cm x 13.44cm → 53.7mm x 134.4mm
      const figW = Math.min(CONTENT_W * 0.5, 53.7);
      const figH = (figW / 53.7) * 134.4;
      y = checkPage(doc, y, figH + 12);
      doc.addImage(imgData, "JPEG", MARGIN_L + (CONTENT_W - figW) / 2, y, figW, figH);
      y += figH + 4;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Figura 2 – Fluxograma", PAGE_W / 2, y, { align: "center" });
      y += 8;
    } catch {
      y = labelValue(doc, "Figura 2:", "(erro ao carregar imagem)", y);
    }
  }

  // ===== MEMORIAL FOTOGRÁFICO =====
  if (laudo.fotos.length > 0) {
    doc.addPage();
    y = MARGIN_T;
    y = sectionTitle(doc, "5. MEMORIAL FOTOGRÁFICO", y);

    // Sort photos by number
    const sortedFotos = [...laudo.fotos].sort((a, b) => a.numero - b.numero);

    for (let i = 0; i < sortedFotos.length; i++) {
      const foto = sortedFotos[i];
      const col = i % PHOTO_COLS;
      const isNewRow = col === 0;

      if (isNewRow) {
        y = checkPage(doc, y, PHOTO_H + 12);
      }

      const x = MARGIN_L + col * (PHOTO_W + PHOTO_GAP);

      try {
        const imgData = await loadImage(foto.arquivo);
        // Draw photo with border
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.rect(x, y, PHOTO_W, PHOTO_H);
        doc.addImage(imgData, "JPEG", x + 1, y + 1, PHOTO_W - 2, PHOTO_H - 6, undefined, "MEDIUM");
        // Caption
        doc.setFontSize(7);
        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");
        const caption = foto.descricao ? `Imagem ${foto.numero} – ${foto.descricao}` : `Imagem ${foto.numero}`;
        doc.text(caption, x + PHOTO_W / 2, y + PHOTO_H - 1, { align: "center" });
      } catch {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`[Imagem ${foto.numero} indisponível]`, x + PHOTO_W / 2, y + PHOTO_H / 2, { align: "center" });
      }

      // Move to next row after second column
      if (col === PHOTO_COLS - 1 || i === sortedFotos.length - 1) {
        y += PHOTO_H + 6;
      }
    }
  }

  // ===== EQUIPE TÉCNICA =====
  y = checkPage(doc, y, 30);
  y += 4;
  y = sectionTitle(doc, "6. EQUIPE TÉCNICA", y);
  if (membros.length > 0) {
    for (const m of membros) {
      y = checkPage(doc, y, 16);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30);
      doc.text(m.nome, MARGIN_L, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`${m.cargo} — ${m.formacao} — CREA: ${m.crea}`, MARGIN_L, y);
      y += 8;
    }
  } else {
    y = paragraph(doc, "Nenhum membro atribuído.", y);
  }

  // ===== AVALIAÇÃO FINAL =====
  y += 4;
  y = sectionTitle(doc, "7. AVALIAÇÃO FINAL / CONSIDERAÇÕES", y);
  y = paragraph(doc, laudo.avaliacaoFinal, y);

  // ===== ASSINATURAS =====
  y += 10;
  y = checkPage(doc, y, 40);
  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  const sigW = 65;
  const sig1X = MARGIN_L + 5;
  const sig2X = MARGIN_L + CONTENT_W - sigW - 5;
  doc.line(sig1X, y, sig1X + sigW, y);
  doc.line(sig2X, y, sig2X + sigW, y);
  doc.setFontSize(9);
  doc.setTextColor(50);
  doc.setFont("helvetica", "normal");
  doc.text("Contratante", sig1X + sigW / 2, y + 5, { align: "center" });
  doc.text("Responsável Técnico", sig2X + sigW / 2, y + 5, { align: "center" });

  // Page numbers
  addPageNumber(doc);

  // Save
  const nomeCliente = cliente?.razaoSocial?.replace(/[^a-zA-Z0-9]/g, "_") || "Cliente";
  const nomeObra = obra?.nome?.replace(/[^a-zA-Z0-9]/g, "_") || "Obra";
  const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  doc.save(`Laudo_Cautelar_${nomeCliente}_${nomeObra}_${dataStr}.pdf`);
}
