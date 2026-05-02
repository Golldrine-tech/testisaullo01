import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  id: fallback(z.string(), "").default(""),
  cargo: fallback(z.string(), "").default(""),
  nome: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/bem-vindo")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Bem-vindo — vota.am" },
      { name: "description", content: "Cadastro realizado com sucesso." },
    ],
  }),
  component: BemVindoPage,
});

function tema(cargo: string) {
  if (cargo === "CABEÇA")
    return {
      badge: "bg-[#E6F1FB] text-[#0C447C] ring-1 ring-[#B5D4F4]",
      idColor: "text-[#042C53]",
      barra: "from-[#042C53] to-[#185FA5]",
      icone: "👑",
      cardBg: "from-[#FFF6E4] to-[#FAEEDA]",
      cardBorder: "border-[#FAC775]/70",
      cardText: "text-[#7A4F0F]",
      instrucao:
        "Guarde bem este ID. Entregue cartões NFC às Lideranças e informe seu ID a cada uma no momento do cadastro.",
    };
  if (cargo === "LIDERANÇA")
    return {
      badge: "bg-[#E1F5EE] text-[#0F6E56] ring-1 ring-[#A8DFCB]",
      idColor: "text-[#0F6E56]",
      barra: "from-[#0F6E56] to-[#2BA383]",
      icone: "🛡️",
      cardBg: "from-[#EAF8F1] to-[#E1F5EE]",
      cardBorder: "border-[#A8DFCB]",
      cardText: "text-[#0F6E56]",
      instrucao:
        "Distribua cartões NFC aos Ativistas e informe seu ID L##### a cada um.",
    };
  if (cargo === "ATIVISTA")
    return {
      badge: "bg-[#FAEEDA] text-[#BA7517] ring-1 ring-[#FAC775]",
      idColor: "text-[#BA7517]",
      barra: "from-[#BA7517] to-[#E0A24F]",
      icone: "⚡",
      cardBg: "from-[#F1F8E2] to-[#EAF3DE]",
      cardBorder: "border-[#C4DCA0]",
      cardText: "text-[#3B6D11]",
      instrucao:
        "Seu cartão está ativo! A partir de agora, cada toque registra uma abordagem em seu nome.",
    };
  return {
    badge: "bg-[#F1EFE8] text-[#5F5E5A] ring-1 ring-[#D3D1C7]",
    idColor: "text-[#042C53]",
    barra: "from-[#042C53] to-[#185FA5]",
    icone: "•",
    cardBg: "from-[#F7F5EE] to-[#F1EFE8]",
    cardBorder: "border-[#D3D1C7]",
    cardText: "text-[#5F5E5A]",
    instrucao: "",
  };
}

function BemVindoPage() {
  const { id, cargo, nome } = Route.useSearch();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);
  const t = tema(cargo);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* silencioso */
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#E6F1FB]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* Fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(800px 400px at 50% -10%, rgba(55,138,221,0.30), transparent 60%), radial-gradient(600px 300px at 90% 100%, rgba(15,110,86,0.15), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[480px] px-5 pb-12 pt-10">
        {/* Animação de sucesso */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#0F6E56]/30"
              style={{ animationDuration: "2.4s" }}
            />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#15876B] to-[#0F6E56] shadow-[0_20px_50px_-15px_rgba(15,110,86,0.6)] ring-4 ring-white">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "checkPop .5s cubic-bezier(.2,1.4,.4,1) both" }}
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F6E56]">
            Identidade confirmada
          </p>
          <h1 className="mt-1.5 text-center text-[26px] font-extrabold leading-tight tracking-tight text-[#042C53]">
            Cadastro realizado!
          </h1>
          {nome && (
            <p className="mt-1 text-sm text-[#444441]">
              Bem-vindo(a), <span className="font-semibold text-[#042C53]">{nome}</span>
            </p>
          )}
        </div>

        {/* ID Card "documento digital" */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_24px_60px_-25px_rgba(4,44,83,0.35)] backdrop-blur-xl ring-1 ring-[#B5D4F4]/60">
          {/* faixa colorida do cargo */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${t.barra}`} />

          {/* watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 select-none text-[10px] font-bold tracking-[0.3em] text-[#042C53]/15"
          >
            VOTA.AM
          </span>

          <div className="px-6 pb-6 pt-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F5E5A]">
                  Identidade Digital
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-[#5F5E5A]/80">
                  Seu ID de identificação
                </p>
              </div>
              <span className="text-2xl">{t.icone}</span>
            </div>

            <p
              className={`mt-4 text-center font-mono text-[40px] font-extrabold leading-none tracking-[0.06em] ${t.idColor}`}
              style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}
            >
              {id || "—"}
            </p>

            <div className="mt-4 flex justify-center">
              {cargo && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wider ${t.badge}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {cargo}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={copiar}
              disabled={!id}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.985] disabled:opacity-50 ${
                copiado
                  ? "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]"
                  : "border-[#D3D1C7] bg-white text-[#185FA5] hover:border-[#185FA5] hover:bg-[#E6F1FB]"
              }`}
            >
              {copiado ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Copiado para área de transferência
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" />
                  </svg>
                  Copiar ID
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[#D3D1C7]/60 bg-[#F7F5EE]/70 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5F5E5A]">
            <span>Emitido em {new Date().toLocaleDateString("pt-BR")}</span>
            <span className="inline-flex items-center gap-1 text-[#0F6E56]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F6E56]" />
              Verificado
            </span>
          </div>
        </div>

        {/* Instrução contextual */}
        {t.instrucao && (
          <div
            className={`mt-6 rounded-2xl border ${t.cardBorder} bg-gradient-to-br ${t.cardBg} px-5 py-4 shadow-[0_8px_20px_-12px_rgba(4,44,83,0.18)]`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
              Próximos passos
            </p>
            <p className={`mt-1.5 text-sm leading-relaxed ${t.cardText}`}>
              {t.instrucao}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate({ to: "/candidato", search: { pessoa_id: id } })}
          className="group relative mt-8 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#185FA5] via-[#2273C2] to-[#378ADD] px-5 py-4 text-[15px] font-bold text-white shadow-[0_14px_32px_-10px_rgba(24,95,165,0.6)] ring-1 ring-[#185FA5]/40 transition-all duration-200 hover:brightness-110 active:scale-[0.985]"
        >
          <span className="inline-flex items-center justify-center gap-2 tracking-wide">
            Conhecer o candidato
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <p className="mt-6 text-center text-[11px] text-[#5F5E5A]/80">
          © vota.am · Plataforma oficial de engajamento político
        </p>
      </div>

      <style>{`
        @keyframes checkPop {
          0%   { transform: scale(.3); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
