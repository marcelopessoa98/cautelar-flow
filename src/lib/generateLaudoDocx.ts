import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageBreak,
  BorderStyle,
  SectionType,
  TabStopType,
  TabStopPosition,
  PageNumber,
  convertMillimetersToTwip,
  VerticalAlign,
  TableLayoutType,
} from "docx";
import { saveAs } from "file-saver";
import { Laudo, Obra, Cliente, MembroEquipe } from "./types";
import logoSrc from "@/assets/logo-concrefuji.jpg";
import headerLogoSrc from "@/assets/header-logo-small.jpg";
import cityscapeSrc from "@/assets/footer-cityscape.jpg";

// ─── Image loading helpers ───

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  const res = await fetch(url);
  return res.arrayBuffer();
}

async function loadStaticAsset(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

// ─── Dimension constants (EMU: 1cm = 360000 EMU, 1inch = 914400 EMU) ───
const CM = 360000;

// Page: A4
const PAGE_W = Math.round(21 * CM);
const PAGE_H = Math.round(29.7 * CM);

// Colors
const RED = "B40000";
const DARK = "333333";
const GRAY = "666666";
const LIGHT_GRAY = "F0F0F0";

// ─── Reusable paragraph builders ───

function emptyLine(count = 1): Paragraph[] {
  return Array.from({ length: count }, () => new Paragraph({ children: [] }));
}

function sectionTitleParagraph(number: string, title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    indent: { left: convertMillimetersToTwip(5) },
    children: [
      new TextRun({
        text: `${number}    ${title}`,
        bold: true,
        size: 24,
        font: "Calibri",
        color: DARK,
        underline: { type: "single" },
      }),
    ],
  });
}

function bodyParagraph(text: string, indent = true): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: indent ? { firstLine: convertMillimetersToTwip(10) } : undefined,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: 22,
        font: "Calibri",
        color: DARK,
      }),
    ],
  });
}

function bulletItem(label: string, value: string): Paragraph {
  return new Paragraph({
    indent: { left: convertMillimetersToTwip(10) },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "➤  ", bold: true, size: 22, font: "Calibri", color: DARK }),
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: "Calibri", color: DARK }),
      new TextRun({ text: value || "—", size: 22, font: "Calibri", color: DARK }),
    ],
  });
}

function redItalicCenter(text: string, size = 20): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text, italics: true, size, font: "Calibri", color: RED }),
    ],
  });
}

// ─── Header / Footer builders ───

function createHeader(logoData: ArrayBuffer): Header {
  // Table: [Logo | Title | Page Number]
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: RED },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                  right: { style: BorderStyle.NONE },
                },
                shading: { fill: LIGHT_GRAY },
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: logoData,
                        transformation: { width: 70, height: 35 },
                        type: "jpg",
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 65, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: RED },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                shading: { fill: LIGHT_GRAY },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "LAUDO CAUTELAR DE VIZINHANÇA",
                        bold: true,
                        size: 24,
                        font: "Calibri",
                        color: DARK,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: RED },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
                },
                shading: { fill: LIGHT_GRAY },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: "Página ", size: 20, font: "Calibri" }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        bold: true,
                        size: 20,
                        font: "Calibri",
                      }),
                      new TextRun({ text: " de ", size: 20, font: "Calibri" }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        bold: true,
                        size: 20,
                        font: "Calibri",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createFooter(cityscapeData: ArrayBuffer): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "Todo o resultado prescrito do presente relatório restringe-se às amostras ensaiadas. A reprodução do documento ou reprodução parcial está sendo proibido.",
            size: 14,
            font: "Calibri",
            color: GRAY,
            italics: true,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({ text: "Concrefuji", bold: true, size: 14, font: "Calibri", color: DARK }),
          new TextRun({ text: " – CNPJ: 32.721.991/0001-98", size: 14, font: "Calibri", color: DARK }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: "Rua Nunes Valente 3840, Fortaleza – CE / Brasil- CEP 60120-295 | Fone: (85) 9 9118-0009",
            size: 14,
            font: "Calibri",
            color: DARK,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: "Email: concrefuji@gmail.com", size: 14, font: "Calibri", color: DARK }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: cityscapeData,
            transformation: { width: 600, height: 40 },
            type: "jpg",
          }),
        ],
      }),
    ],
  });
}

// ─── Main generator ───

export async function generateLaudoDocx(
  laudo: Laudo,
  obra: Obra | null,
  cliente: Cliente | null,
  membros: MembroEquipe[]
): Promise<void> {
  // Load static assets using Vite-resolved imports
  const [logoData, headerLogoData, cityscapeData] = await Promise.all([
    loadStaticAsset(logoSrc),
    loadStaticAsset(headerLogoSrc),
    loadStaticAsset(cityscapeSrc),
  ]);

  const obraNome = obra?.nome || "Obra";
  const endObra = obra ? `${obra.endereco}, ${obra.bairro} — ${obra.cidade}/${obra.estado}` : "—";
  const responsavel = membros.length > 0 ? membros[0].nome : "—";
  const sortedFotos = [...laudo.fotos].sort((a, b) => a.numero - b.numero);

  const header = createHeader(headerLogoData);
  const footer = createFooter(cityscapeData);

  const pageProps = {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: {
        top: convertMillimetersToTwip(25),
        bottom: convertMillimetersToTwip(35),
        left: convertMillimetersToTwip(20),
        right: convertMillimetersToTwip(20),
      },
    },
    headers: { default: header },
    footers: { default: footer },
  };

  // ═══════════════════════════════════════════
  // COVER PAGE (separate section, no header/footer)
  // ═══════════════════════════════════════════
  const coverChildren: (Paragraph | Table)[] = [
    // Logo centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new ImageRun({
          data: logoData,
          transformation: { width: 250, height: 80 },
          type: "jpg",
        }),
      ],
    }),
    ...emptyLine(6),
    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "LAUDO CAUTELAR DE",
          bold: true,
          size: 52,
          font: "Calibri",
          color: DARK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: "VIZINHANÇA",
          bold: true,
          size: 52,
          font: "Calibri",
          color: DARK,
        }),
      ],
    }),
    ...emptyLine(2),
    // Obra name (red bold)
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: obraNome.toUpperCase(),
          bold: true,
          size: 28,
          font: "Calibri",
          color: RED,
        }),
      ],
    }),
    // Address (red bold)
    new Paragraph({
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: laudo.enderecoImovelVistoriado || "",
          bold: true,
          size: 22,
          font: "Calibri",
          color: RED,
        }),
      ],
    }),
    ...emptyLine(4),
    // Empresa contratante
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "Empresa contratante: ", bold: true, size: 22, font: "Calibri", color: DARK }),
        new TextRun({ text: cliente?.razaoSocial || "—", bold: true, size: 22, font: "Calibri", color: RED }),
      ],
    }),
    // Responsável
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "Responsável: ", bold: true, size: 22, font: "Calibri", color: DARK }),
        new TextRun({ text: responsavel, size: 22, font: "Calibri", color: RED }),
      ],
    }),
  ];

  // ═══════════════════════════════════════════
  // PAGE 2: EQUIPE TÉCNICA
  // ═══════════════════════════════════════════
  const equipeChildren: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: "Equipe Técnica", bold: true, size: 28, font: "Calibri", color: DARK }),
      ],
    }),
  ];

  for (const m of membros) {
    // If member has signature, add signature image (placeholder)
    equipeChildren.push(
      ...emptyLine(1),
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: m.nome, size: 22, font: "Calibri", color: DARK })],
      }),
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: `${m.cargo}`, size: 22, font: "Calibri", color: DARK })],
      }),
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: m.formacao, size: 22, font: "Calibri", color: DARK })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: `CREA: ${m.crea}`, size: 22, font: "Calibri", color: DARK })],
      }),
    );
  }

  if (membros.length === 0) {
    equipeChildren.push(bodyParagraph("Nenhum membro atribuído.", false));
  }

  // ═══════════════════════════════════════════
  // PAGE 3: NOTA PRÉVIA
  // ═══════════════════════════════════════════
  const notaPrevia = `O documento apresenta o Laudo Cautelar de Vizinhança realizado nos confrontantes do lote do ${obraNome} (${cliente?.razaoSocial || "Cliente"}), ${obra?.bairro || "Bairro"}, ${obra?.cidade || "Cidade"}-${obra?.estado || "UF"}.`;

  const notaPreviaChildren: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: "Nota Prévia", bold: true, size: 28, font: "Calibri", color: DARK }),
      ],
    }),
    bodyParagraph(notaPrevia),
  ];

  // ═══════════════════════════════════════════
  // PAGE 4: SUMÁRIO
  // ═══════════════════════════════════════════
  const sumarioChildren: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({ text: "SUMÁRIO", bold: true, size: 32, font: "Calibri", color: DARK }),
      ],
    }),
  ];

  const sumarioItems = [
    "OBJETIVO",
    "IDENTIFICAÇÃO DO IMÓVEL VISTORIADO",
    "IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO",
    "METODOLOGIA",
    "CARACTERÍSTICAS DO IMÓVEL VISTORIADO",
    "MEMORIAL FOTOGRÁFICO",
    "AVALIAÇÃO FINAL",
  ];

  for (let i = 0; i < sumarioItems.length; i++) {
    sumarioChildren.push(
      new Paragraph({
        spacing: { after: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: "dot" }],
        children: [
          new TextRun({ text: `${i + 1}.    `, bold: true, size: 22, font: "Calibri", color: DARK }),
          new TextRun({ text: sumarioItems[i], bold: true, size: 22, font: "Calibri", color: DARK }),
        ],
      }),
    );
  }

  // ═══════════════════════════════════════════
  // PAGE 5: OBJETIVO + IDENTIFICAÇÕES (seções 1, 2, 3)
  // ═══════════════════════════════════════════
  const objetivoTexto = "Este laudo cautelar de vizinhança tem como objetivo constatar as condições das propriedades adjacentes à obra em construção e já identificar possíveis danos existentes nestas. Essa avaliação é essencial para verificar a integridade das edificações em questão. O resultado é decorrente de uma vistoria técnica realizada por um profissional habilitado e experiente, que avalia minuciosamente as propriedades vizinhas à obra em construção.";

  const sec1_2_3_Children: Paragraph[] = [
    sectionTitleParagraph("1.", "OBJETIVO"),
    bodyParagraph(objetivoTexto),
    ...emptyLine(1),
    sectionTitleParagraph("2.", "IDENTIFICAÇÃO DO IMÓVEL VISTORIADO"),
    bodyParagraph("Segue as informações coletadas:", false),
    ...emptyLine(1),
    bulletItem("Solicitante", cliente?.razaoSocial || "—"),
    bulletItem("Objeto", laudo.tipoImovel || "—"),
    bulletItem("Objetivo", laudo.objetivo || "—"),
    bulletItem("Endereço", laudo.enderecoImovelVistoriado || "—"),
    ...emptyLine(1),
    sectionTitleParagraph("3.", "IDENTIFICAÇÃO DO IMÓVEL A SER CONSTRUÍDO"),
    bodyParagraph("Segue as informações coletadas:", false),
    ...emptyLine(1),
    bulletItem("Proprietário", cliente?.razaoSocial || "—"),
    bulletItem("Tipo de ocupação", laudo.tipoOcupacao || "—"),
    bulletItem("Características da edificação", "Constituído por unidades autônomas distribuídas em blocos."),
    bulletItem("Vias de acesso", `A principal via de acesso é: ${laudo.viasAcesso || "—"}`),
    bulletItem("Endereço", endObra),
  ];

  // ═══════════════════════════════════════════
  // PAGE 6: FIGURA 1 + METODOLOGIA (seção 4)
  // ═══════════════════════════════════════════
  const fig1_metod_Children: Paragraph[] = [];

  if (laudo.figuraLocalizacao) {
    try {
      const fig1Data = await fetchAsArrayBuffer(laudo.figuraLocalizacao);
      fig1_metod_Children.push(
        redItalicCenter("Figura 1"),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new ImageRun({
              data: fig1Data,
              transformation: { width: 380, height: 280 },
              type: "jpg",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Fonte: Adaptada Google Earth", size: 18, font: "Calibri", color: GRAY }),
          ],
        }),
      );
    } catch {
      fig1_metod_Children.push(bodyParagraph("[Figura 1 – Erro ao carregar imagem]", false));
    }
  }

  const metodologia = "O presente documento é baseado na ABNT (Associação Brasileira de Normas Técnicas) e IBAPE (Instituto Brasileiro de Avaliação e Perícias de Engenharia), seguindo todas as aplicações práticas de vistoria cautelar de vizinhança, metodologia e parâmetros, de forma que atendam os pré-requisitos mínimos estabelecidos para o perfeito funcionamento de todo o sistema existente.";

  fig1_metod_Children.push(
    sectionTitleParagraph("4.", "METODOLOGIA"),
    bodyParagraph(metodologia),
  );

  // ═══════════════════════════════════════════
  // PAGE 7: FIGURA 2 + CARACTERÍSTICAS (seção 5)
  // ═══════════════════════════════════════════
  const fig2_carac_Children: Paragraph[] = [];

  if (laudo.figuraFluxograma) {
    fig2_carac_Children.push(
      bodyParagraph("A Figura 2 a seguir exemplifica o fluxograma considerado para a avaliação.", false),
    );
    try {
      const fig2Data = await fetchAsArrayBuffer(laudo.figuraFluxograma);
      fig2_carac_Children.push(
        redItalicCenter("Figura 2 - Fluxograma de vistoria"),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new ImageRun({
              data: fig2Data,
              transformation: { width: 400, height: 180 },
              type: "jpg",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Fonte: Adaptada de Burin ", size: 16, font: "Calibri", color: GRAY }),
            new TextRun({ text: "et al.", italics: true, size: 16, font: "Calibri", color: GRAY }),
            new TextRun({ text: " (2009)", size: 16, font: "Calibri", color: GRAY }),
          ],
        }),
      );
    } catch {
      fig2_carac_Children.push(bodyParagraph("[Figura 2 – Erro ao carregar imagem]", false));
    }
  }

  fig2_carac_Children.push(
    ...emptyLine(1),
    sectionTitleParagraph("5.", "CARACTERÍSTICAS DO IMÓVEL VISTORIADO"),
    ...emptyLine(1),
    bulletItem("Padrão construtivo", laudo.caracteristicas.padraoConstrutivo),
    bulletItem("Quantidade de pavimentos", String(laudo.caracteristicas.pavimentos)),
    bulletItem("Estruturas", laudo.caracteristicas.estrutura.join(", ") || "—"),
    bulletItem("Vedação", laudo.caracteristicas.vedacao.join(", ") || "—"),
    bulletItem("Acabamento de piso", laudo.caracteristicas.acabamentoPiso.join(", ") || "—"),
    bulletItem("Acabamento de paredes", laudo.caracteristicas.acabamentoParedes.join(", ") || "—"),
    bulletItem("Cobertura", laudo.caracteristicas.cobertura.join(", ") || "—"),
    ...emptyLine(1),
    bodyParagraph("O proprietário autorizou a entrada no imóvel e permitiu o registro fotográfico dos cômodos de sua residência. Ele está ciente da garantia pela qual o laudo representa."),
  );

  // ═══════════════════════════════════════════
  // MEMORIAL FOTOGRÁFICO (seção 6)
  // 2 fotos por página, Imagem X acima de cada foto
  // ═══════════════════════════════════════════
  const memorialChildren: (Paragraph | Table)[] = [
    sectionTitleParagraph("6.", "MEMORIAL FOTOGRÁFICO"),
    bodyParagraph("Segue imagens para constatação do estado atual do imóvel.", false),
    ...emptyLine(1),
  ];

  // Load all photos
  const photoDataMap: Map<string, ArrayBuffer> = new Map();
  for (const foto of sortedFotos) {
    try {
      const data = await fetchAsArrayBuffer(foto.arquivo);
      photoDataMap.set(foto.id, data);
    } catch {
      // skip failed photos
    }
  }

  // First page of memorial: Imagem 1 + Imagem 2 label (matching template page 8)
  // After that: 2 photos per page
  for (let i = 0; i < sortedFotos.length; i++) {
    const foto = sortedFotos[i];
    const data = photoDataMap.get(foto.id);

    // Add page break before every pair after the first page
    // First page: items 0 and 1
    // Subsequent pages: items 2-3, 4-5, etc.
    if (i > 0 && i % 2 === 0) {
      memorialChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        }),
      );
    }

    // "Imagem X" label
    memorialChildren.push(redItalicCenter(`Imagem ${foto.numero}`));

    if (data) {
      memorialChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new ImageRun({
              data,
              transformation: { width: 450, height: 300 },
              type: "jpg",
            }),
          ],
        }),
      );
    } else {
      memorialChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({ text: `[Imagem ${foto.numero} indisponível]`, size: 18, font: "Calibri", color: GRAY, italics: true }),
          ],
        }),
      );
    }
  }

  // Total photos note
  memorialChildren.push(
    ...emptyLine(1),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Para este imóvel, foram tiradas ${sortedFotos.length} fotos, todas dispostas e enviadas.`,
          bold: true,
          italics: true,
          size: 22,
          font: "Calibri",
          color: RED,
        }),
      ],
    }),
  );

  // ═══════════════════════════════════════════
  // AVALIAÇÃO FINAL (seção 7) + ASSINATURAS
  // ═══════════════════════════════════════════
  const avaliacaoDefault = "Diante do exposto neste laudo cautelar de vizinhança, conclui-se que foram realizadas todas as vistorias e análises necessárias para identificar possíveis danos e anomalias no imóvel. As informações e resultados obtidos foram descritos de forma clara e objetiva.\n\nAssim, a contratada atesta que realizou todas as atividades previstas neste contrato, e que o proprietário do imóvel vistoriado teve a oportunidade de acompanhar e esclarecer quaisquer dúvidas sobre as informações obtidas.\n\nPor fim, os responsáveis da contratada, contratante e o proprietário do imóvel vistoriado assinam este laudo cautelar de vizinhança, atestando a sua concordância e aceitação das informações apresentadas.";

  const avaliacaoTexto = laudo.avaliacaoFinal || avaliacaoDefault;
  const avaliacaoParas = avaliacaoTexto.split("\n").filter(Boolean);

  const avaliacaoChildren: (Paragraph | Table)[] = [
    sectionTitleParagraph("7.", "AVALIAÇÃO FINAL"),
    ...avaliacaoParas.map(p => bodyParagraph(p)),
    ...emptyLine(6),
    // Signatures table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: DARK },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 60 },
                  children: [
                    new TextRun({ text: "Proprietário do imóvel vistoriado", size: 18, font: "Calibri", color: DARK }),
                  ],
                }),
              ],
            }),
            // Spacer
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: DARK },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 60 },
                  children: [
                    new TextRun({ text: "Contratante", size: 18, font: "Calibri", color: DARK }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  // ═══════════════════════════════════════════
  // BUILD DOCUMENT
  // ═══════════════════════════════════════════
  const doc = new Document({
    sections: [
      // Cover page (no header/footer)
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: {
              top: convertMillimetersToTwip(20),
              bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
            },
            borders: {
              pageBorderLeft: {
                style: BorderStyle.SINGLE,
                size: 24,
                color: RED,
                space: 10,
              },
            },
          },
          titlePage: true,
        },
        children: coverChildren,
      },
      // Page 2: Equipe Técnica
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: equipeChildren,
      },
      // Page 3: Nota Prévia
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: notaPreviaChildren,
      },
      // Page 4: Sumário
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: sumarioChildren,
      },
      // Page 5: Seções 1, 2, 3
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: sec1_2_3_Children,
      },
      // Page 6: Figura 1 + Metodologia
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: fig1_metod_Children,
      },
      // Page 7: Figura 2 + Características
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: fig2_carac_Children,
      },
      // Memorial Fotográfico
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: memorialChildren,
      },
      // Avaliação Final + Assinaturas
      {
        properties: {
          ...pageProps,
          type: SectionType.NEXT_PAGE,
        },
        children: avaliacaoChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const clienteName = (cliente?.razaoSocial || "Cliente").replace(/\s+/g, "_");
  const obraName = (obra?.nome || "Obra").replace(/\s+/g, "_");
  const date = new Date().toISOString().split("T")[0];
  saveAs(blob, `Laudo_Cautelar_${clienteName}_${obraName}_${date}.docx`);
}
