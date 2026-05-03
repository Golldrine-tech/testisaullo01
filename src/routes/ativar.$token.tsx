import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { verificarToken } from "@/utils/api";
import { FormularioCadastro } from "@/components/FormularioCadastro";

export const Route = createFileRoute("/ativar/$token")({
  head: () => ({
    meta: [
      { title: "Ativar cartão — vota.am" },
      { name: "description", content: "Ative seu cartão NFC de campanha." },
    ],
  }),
  component: AtivarPage,
});

type Estado =
  | { tipo: "loading" }
  | { tipo: "formulario" }
  | { tipo: "erro"; msg: string };

function AtivarPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>({ tipo: "loading" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await verificarToken(token);
        if (cancelado) return;
        if ("acao" in res && res.acao === "mostrar_formulario") {
          setEstado({ tipo: "formulario" });
        } else if ("acao" in res && res.acao === "redirecionar_lp") {
          navigate({ to: "/candidato", search: { ref: res.pessoa_id } });
        } else if ("erro" in res) {
          setEstado({ tipo: "erro", msg: res.erro });
        } else {
          setEstado({ tipo: "erro", msg: "Resposta inesperada." });
        }
      } catch {
        if (!cancelado)
          setEstado({ tipo: "erro", msg: "Erro de conexão. Tente novamente." });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token, navigate]);

  return (
    <div
      className="min-h-screen bg-[#F7F5EE]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[420px] bg-gradient-to-b from-[#042C53] via-[#08376B] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[420px] opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(600px 280px at 80% 0%, rgba(55,138,221,0.45), transparent 60%), radial-gradient(500px 240px at 10% 10%, rgba(24,95,165,0.35), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[480px] px-5 pb-12 pt-6">
        {/* Header glass */}
        <header className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-5 shadow-[0_20px_60px_-20px_rgba(4,44,83,0.6)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/30">
                <span className="text-base font-black text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">
                  v
                </span>
                <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
              </div>
              <div>
                <h1 className="text-[17px] font-extrabold tracking-tight text-white">
                  vota<span className="text-[#FAC775]">.</span>am
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
                  Portal de ativação
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5BE3A2]" />
              SISTEMA ATIVO
            </span>
          </div>
        </header>

        {/* Card principal */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-[#D3D1C7]/70 bg-white shadow-[0_24px_60px_-30px_rgba(4,44,83,0.35)]">
          {/* faixa superior gradiente */}
          <div className="h-1 w-full bg-gradient-to-r from-[#042C53] via-[#185FA5] to-[#FAC775]" />

          <div className="px-6 py-7 sm:px-7">
            {estado.tipo === "loading" && (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-[#5F5E5A]">
                <div className="relative">
                  <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#E6F1FB] border-t-[#185FA5]" />
                  <div className="absolute inset-0 animate-pulse rounded-full bg-[#378ADD]/10 blur-xl" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#042C53]">
                    Verificando seu cartão
                  </p>
                  <p className="mt-1 text-xs text-[#5F5E5A]">
                    Validando token de identidade...
                  </p>
                </div>
              </div>
            )}

            {estado.tipo === "erro" && (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCEBEB] text-[#A32D2D] ring-1 ring-[#F7C1C1]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v5M12 16.5v.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#042C53]">
                    Não foi possível continuar
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5F5E5A]">
                    {estado.msg}
                  </p>
                </div>
              </div>
            )}

            {estado.tipo === "formulario" && (
              <>
                <div className="mb-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#185FA5]">
                    Primeiro acesso
                  </p>
                  <h2 className="mt-1.5 text-[22px] font-extrabold leading-tight tracking-tight text-[#042C53]">
                    Ative seu cartão NFC
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5F5E5A]">
                    Complete os passos abaixo para registrar sua identidade na
                    campanha.
                  </p>
                </div>
                <FormularioCadastro token={token} />
              </>
            )}
          </div>

          {/* rodapé do card */}
          <div className="flex items-center justify-between border-t border-[#D3D1C7]/60 bg-[#F7F5EE]/60 px-6 py-3 text-[11px] text-[#5F5E5A]">
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              CONEXÃO SEGURA
            </span>
            <span className="font-mono tracking-wider">
              TOKEN ·{" "}
              <span className="text-[#042C53] font-semibold">
                {token.slice(0, 10)}
                {token.length > 10 ? "…" : ""}
              </span>
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#5F5E5A]/80">
          © vota.am · Plataforma oficial de engajamento político
        </p>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
