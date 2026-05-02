const BASE_URL = import.meta.env.VITE_N8N_URL || "https://n8n.vota.am";

export type VerificarTokenResponse =
  | { acao: "mostrar_formulario" }
  | { acao: "redirecionar_lp"; pessoa_id: string; nome?: string }
  | { erro: string };

export async function verificarToken(token: string): Promise<VerificarTokenResponse> {
  const res = await fetch(
    `${BASE_URL}/webhook/verificar-token?token=${encodeURIComponent(token)}`,
    { method: "GET" },
  );
  if (!res.ok) {
    if (res.status === 404) return { erro: "Cartão inválido ou não reconhecido." };
    throw new Error("Erro de conexão");
  }
  return (await res.json()) as VerificarTokenResponse;
}

export type CadastrarResponse =
  | { sucesso: true; id_gerado: string; cargo: string; nome: string }
  | { erro: string };

export async function cadastrar(payload: Record<string, unknown>): Promise<CadastrarResponse> {
  const res = await fetch(`${BASE_URL}/webhook/cadastrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Erro de conexão");
  }
  return data as CadastrarResponse;
}

export function registrarEvento(payload: Record<string, unknown>): void {
  // Fire-and-forget
  try {
    fetch(`${BASE_URL}/webhook/evento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* silencioso */
    });
  } catch {
    /* silencioso */
  }
}

export function obterGPS(): Promise<{ latitude: number; longitude: number; gps_ok: boolean }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ latitude: 0, longitude: 0, gps_ok: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          gps_ok: true,
        }),
      () => resolve({ latitude: 0, longitude: 0, gps_ok: false }),
      { timeout: 8000 },
    );
  });
}