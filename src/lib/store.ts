import { Cliente, Obra, MembroEquipe, Laudo } from './types';

function getItem<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Clientes
export function getClientes(): Cliente[] {
  return getItem<Cliente>('laudos_clientes', []);
}
export function saveCliente(cliente: Cliente) {
  const all = getClientes();
  const idx = all.findIndex(c => c.id === cliente.id);
  if (idx >= 0) all[idx] = cliente; else all.push(cliente);
  setItem('laudos_clientes', all);
}
export function deleteCliente(id: string) {
  setItem('laudos_clientes', getClientes().filter(c => c.id !== id));
}

// Obras
export function getObras(): Obra[] {
  return getItem<Obra>('laudos_obras', []);
}
export function saveObra(obra: Obra) {
  const all = getObras();
  const idx = all.findIndex(o => o.id === obra.id);
  if (idx >= 0) all[idx] = obra; else all.push(obra);
  setItem('laudos_obras', all);
}
export function deleteObra(id: string) {
  setItem('laudos_obras', getObras().filter(o => o.id !== id));
}

// Equipe
export function getEquipe(): MembroEquipe[] {
  return getItem<MembroEquipe>('laudos_equipe', []);
}
export function saveMembro(membro: MembroEquipe) {
  const all = getEquipe();
  const idx = all.findIndex(m => m.id === membro.id);
  if (idx >= 0) all[idx] = membro; else all.push(membro);
  setItem('laudos_equipe', all);
}
export function deleteMembro(id: string) {
  setItem('laudos_equipe', getEquipe().filter(m => m.id !== id));
}

// Laudos
export function getLaudos(): Laudo[] {
  return getItem<Laudo>('laudos_laudos', []);
}
export function saveLaudo(laudo: Laudo) {
  const all = getLaudos();
  const idx = all.findIndex(l => l.id === laudo.id);
  if (idx >= 0) all[idx] = laudo; else all.push(laudo);
  setItem('laudos_laudos', all);
}
export function deleteLaudo(id: string) {
  setItem('laudos_laudos', getLaudos().filter(l => l.id !== id));
}
