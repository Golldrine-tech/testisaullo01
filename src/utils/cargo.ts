export type Cargo = "CABEÇA" | "LIDERANÇA" | "ATIVISTA" | null;
export type ResolucaoCargo = { cargo: Cargo; erro: string | null };

export function resolverCargo(idRecrutador: string): ResolucaoCargo {
  if (!idRecrutador) return { cargo: null, erro: null };
  if (idRecrutador.startsWith("CAND-")) return { cargo: "CABEÇA", erro: null };
  if (/^C\d{5}$/.test(idRecrutador)) return { cargo: "LIDERANÇA", erro: null };
  if (/^L\d{5}$/.test(idRecrutador)) return { cargo: "ATIVISTA", erro: null };
  if (/^A\d{5}$/.test(idRecrutador))
    return { cargo: null, erro: "Ativistas não podem recrutar outras pessoas." };
  return { cargo: null, erro: "Código não reconhecido. Verifique com seu recrutador." };
}