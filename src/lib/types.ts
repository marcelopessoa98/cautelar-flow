export interface Cliente {
  id: string;
  razaoSocial: string;
  cpfCnpj: string;
  telefones: string;
  email: string;
  endereco: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
}

export interface Obra {
  id: string;
  nome: string;
  referencia: string;
  clienteId: string;
  filial: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: 'em_andamento' | 'concluida' | 'pausada';
  dataInicio: string;
  previsaoTermino: string;
  createdAt: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  formacao: string;
  crea: string;
  createdAt: string;
}

export interface FotoMemorial {
  id: string;
  numero: number;
  arquivo: string; // base64 data URL
  descricao?: string;
}

export interface CaracteristicasImovel {
  tipoImovel: string;
  padraoConstrutivo: string;
  pavimentos: number;
  estrutura: string[];
  vedacao: string[];
  acabamentoPiso: string[];
  acabamentoParedes: string[];
  cobertura: string[];
}

export interface Laudo {
  id: string;
  obraId: string;
  clienteId: string;
  enderecoImovelVistoriado: string;
  tipoImovel: string;
  objetivo: string;
  tipoOcupacao: string;
  viasAcesso: string;
  caracteristicas: CaracteristicasImovel;
  equipeIds: string[];
  figuraLocalizacao?: string; // base64
  figuraFluxograma?: string; // base64
  fotos: FotoMemorial[];
  avaliacaoFinal: string;
  status: 'rascunho' | 'completo';
  createdAt: string;
  updatedAt: string;
}

// Options for select fields
export const TIPOS_IMOVEL = [
  'Residencial', 'Comercial', 'Industrial', 'Misto', 'Terreno baldio',
];

export const PADROES_CONSTRUTIVOS = [
  'Baixo padrão', 'Médio padrão', 'Alto padrão',
];

export const ESTRUTURAS = [
  'Concreto armado', 'Alvenaria estrutural', 'Estrutura metálica', 'Madeira',
];

export const VEDACOES = [
  'Alvenaria em tijolos cerâmicos furados',
  'Alvenaria em blocos de concreto',
  'Alvenaria em tijolos maciços',
  'Drywall',
];

export const ACABAMENTOS_PISO = [
  'Revestimento cerâmico', 'Porcelanato', 'Cimento queimado',
  'Piso vinílico', 'Madeira', 'Sem revestimento',
];

export const ACABAMENTOS_PAREDE = [
  'Revestimento argamassa e pintura', 'Revestimento cerâmico',
  'Textura', 'Sem revestimento', 'Massa corrida e pintura',
];

export const COBERTURAS = [
  'Telhas cerâmicas', 'Telhas de fibrocimento', 'Telhas metálicas',
  'Laje impermeabilizada', 'Madeira', 'Revestimento gesso',
];

export const TIPOS_OCUPACAO = [
  'Residencial', 'Comercial', 'Industrial', 'Misto', 'Institucional',
];
