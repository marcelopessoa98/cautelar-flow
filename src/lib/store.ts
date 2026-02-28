import { supabase } from "@/integrations/supabase/client";
import { Cliente, Obra, MembroEquipe, Laudo, FotoMemorial, CaracteristicasImovel } from './types';

// Helper to convert DB snake_case to camelCase for Cliente
function dbToCliente(row: any): Cliente {
  return {
    id: row.id,
    razaoSocial: row.razao_social,
    cpfCnpj: row.cpf_cnpj,
    telefones: row.telefones || '',
    email: row.email || '',
    endereco: row.endereco || '',
    status: row.status || 'ativo',
    createdAt: row.created_at,
  };
}

function dbToObra(row: any): Obra {
  return {
    id: row.id,
    nome: row.nome,
    referencia: row.referencia || '',
    clienteId: row.cliente_id,
    filial: '',
    endereco: row.endereco || '',
    bairro: row.bairro || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    status: row.status || 'em_andamento',
    dataInicio: row.data_inicio || '',
    previsaoTermino: row.previsao_termino || '',
    createdAt: row.created_at,
  };
}

function dbToMembro(row: any): MembroEquipe {
  return {
    id: row.id,
    nome: row.nome,
    cargo: row.cargo || '',
    formacao: row.formacao || '',
    crea: row.crea || '',
    createdAt: row.created_at,
  };
}

function dbToLaudo(row: any): Laudo {
  const caract = (row.caracteristicas || {}) as any;
  return {
    id: row.id,
    obraId: row.obra_id,
    clienteId: row.cliente_id,
    enderecoImovelVistoriado: row.endereco_imovel_vistoriado || '',
    tipoImovel: row.tipo_imovel || '',
    objetivo: row.objetivo || '',
    tipoOcupacao: row.tipo_ocupacao || '',
    viasAcesso: row.vias_acesso || '',
    caracteristicas: {
      tipoImovel: caract.tipoImovel || '',
      padraoConstrutivo: caract.padraoConstrutivo || '',
      pavimentos: caract.pavimentos || 1,
      estrutura: caract.estrutura || [],
      vedacao: caract.vedacao || [],
      acabamentoPiso: caract.acabamentoPiso || [],
      acabamentoParedes: caract.acabamentoParedes || [],
      cobertura: caract.cobertura || [],
    },
    equipeIds: row.equipe_ids || [],
    figuraLocalizacao: row.figura_localizacao || undefined,
    figuraFluxograma: row.figura_fluxograma || undefined,
    fotos: (row.fotos || []) as FotoMemorial[],
    avaliacaoFinal: row.avaliacao_final || '',
    status: row.status || 'rascunho',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Upload image to storage, returns public URL
export async function uploadImage(file: File, folder: string): Promise<string> {
  const fileName = `${folder}/${Date.now()}_${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('laudo-images').upload(fileName, file, {
    contentType: file.type,
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('laudo-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Upload base64 image to storage
export async function uploadBase64Image(base64: string, folder: string): Promise<string> {
  const match = base64.match(/^data:(.+);base64,(.+)$/);
  if (!match) return base64; // already a URL
  const contentType = match[1];
  const ext = contentType.split('/')[1] || 'png';
  const byteString = atob(match[2]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: contentType });
  const fileName = `${folder}/${Date.now()}_${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('laudo-images').upload(fileName, blob, {
    contentType,
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('laudo-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// Clientes
export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToCliente);
}

export async function saveCliente(cliente: Cliente): Promise<void> {
  const row = {
    id: cliente.id,
    razao_social: cliente.razaoSocial,
    cpf_cnpj: cliente.cpfCnpj,
    telefones: cliente.telefones,
    email: cliente.email,
    endereco: cliente.endereco,
    status: cliente.status,
  };
  const { error } = await supabase.from('clientes').upsert(row);
  if (error) throw error;
}

export async function deleteCliente(id: string): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

// Obras
export async function getObras(): Promise<Obra[]> {
  const { data, error } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToObra);
}

export async function saveObra(obra: Obra): Promise<void> {
  const row = {
    id: obra.id,
    nome: obra.nome,
    referencia: obra.referencia,
    cliente_id: obra.clienteId,
    endereco: obra.endereco,
    bairro: obra.bairro,
    cidade: obra.cidade,
    estado: obra.estado,
    status: obra.status,
    data_inicio: obra.dataInicio,
    previsao_termino: obra.previsaoTermino,
  };
  const { error } = await supabase.from('obras').upsert(row);
  if (error) throw error;
}

export async function deleteObra(id: string): Promise<void> {
  const { error } = await supabase.from('obras').delete().eq('id', id);
  if (error) throw error;
}

// Equipe
export async function getEquipe(): Promise<MembroEquipe[]> {
  const { data, error } = await supabase.from('equipe').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToMembro);
}

export async function saveMembro(membro: MembroEquipe): Promise<void> {
  const row = {
    id: membro.id,
    nome: membro.nome,
    cargo: membro.cargo,
    formacao: membro.formacao,
    crea: membro.crea,
  };
  const { error } = await supabase.from('equipe').upsert(row);
  if (error) throw error;
}

export async function deleteMembro(id: string): Promise<void> {
  const { error } = await supabase.from('equipe').delete().eq('id', id);
  if (error) throw error;
}

// Laudos
export async function getLaudos(): Promise<Laudo[]> {
  const { data, error } = await supabase.from('laudos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToLaudo);
}

export async function saveLaudo(laudo: Laudo): Promise<void> {
  // Upload images to storage if they are base64
  let figLoc = laudo.figuraLocalizacao || '';
  let figFlux = laudo.figuraFluxograma || '';
  
  if (figLoc && figLoc.startsWith('data:')) {
    figLoc = await uploadBase64Image(figLoc, 'figuras');
  }
  if (figFlux && figFlux.startsWith('data:')) {
    figFlux = await uploadBase64Image(figFlux, 'figuras');
  }

  // Upload memorial photos
  const uploadedFotos: FotoMemorial[] = [];
  for (const foto of laudo.fotos) {
    let arquivo = foto.arquivo;
    if (arquivo.startsWith('data:')) {
      arquivo = await uploadBase64Image(arquivo, 'memorial');
    }
    uploadedFotos.push({ ...foto, arquivo });
  }

  const row = {
    id: laudo.id,
    obra_id: laudo.obraId,
    cliente_id: laudo.clienteId,
    endereco_imovel_vistoriado: laudo.enderecoImovelVistoriado,
    tipo_imovel: laudo.tipoImovel,
    objetivo: laudo.objetivo,
    tipo_ocupacao: laudo.tipoOcupacao,
    vias_acesso: laudo.viasAcesso,
    caracteristicas: laudo.caracteristicas as any,
    equipe_ids: laudo.equipeIds,
    figura_localizacao: figLoc || '',
    figura_fluxograma: figFlux || '',
    fotos: uploadedFotos as any,
    avaliacao_final: laudo.avaliacaoFinal,
    status: laudo.status,
  };
  const { error } = await supabase.from('laudos').upsert(row);
  if (error) throw error;
}

export async function deleteLaudo(id: string): Promise<void> {
  const { error } = await supabase.from('laudos').delete().eq('id', id);
  if (error) throw error;
}
