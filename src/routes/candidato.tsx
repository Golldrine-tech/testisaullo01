import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { registrarEvento, obterGPS } from "@/utils/api";

const searchSchema = z.object({
  pessoa_id: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/candidato")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Candidato — vota.am" },
      { name: "description", content: "Conheça o candidato e participe da campanha." },
      { property: "og:title", content: "Candidato — vota.am" },
      { property: "og:description", content: "Conheça o candidato e participe da campanha." },
    ],
  }),
  component: CandidatoPage,
});

const propostas = [
  {
    titulo: "Educação",
    desc: "Escolas em tempo integral e valorização docente.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10L12 4 2 10l10 6 10-6z" />
        <path d="M6 12v5a6 6 0 0012 0v-5" />
      </svg>
    ),
    bg: "bg-[#E6F1FB] text-[#185FA5]",
  },
  {
    titulo: "Saúde",
    desc: "Mais postos abertos e atendimento sem fila.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 12C19 16.5 12 21 12 21z" />
      </svg>
    ),
    bg: "bg-[#FCEBEB] text-[#A32D2D]",
  },
  {
    titulo: "Infraestrutura",
    desc: "Bairros conectados, ruas iluminadas e seguras.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
    bg: "bg-[#FAEEDA] text-[#BA7517]",
  },
];

function CandidatoPage() {
  const { pessoa_id } = Route.useSearch();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const gps = await obterGPS();
      if (cancelado) return;
      registrarEvento({
        tipo: "APROXIMACAO",
        canal: "NFC",
        pessoa_id: pessoa_id || null,
        url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        latitude: gps.latitude,
        longitude: gps.longitude,
        gps_ok: gps.gps_ok,
        timestamp: new Date().toISOString(),
      });
    })();
    return () => {
      cancelado = true;
    };
  }, [pessoa_id]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/candidato${pessoa_id ? `?pessoa_id=${encodeURIComponent(pessoa_id)}` : ""}`
      : "";
  const shareText = "Conheça o candidato e participe da campanha!";

  function track(canal: string) {
    registrarEvento({
      tipo: "COMPARTILHAMENTO",
      canal,
      pessoa_id: pessoa_id || null,
      url: shareUrl,
      timestamp: new Date().toISOString(),
    });
  }

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  }

  function shareWhatsApp() {
    // [N8N - Fluxo 3] Compartilhamento via WhatsApp — registrado no banco via webhook/evento
    track("whatsapp");
    showFeedback("Abrindo WhatsApp...");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      "_blank",
    );
  }

  function shareTelegram() {
    // [N8N - Fluxo 3] Compartilhamento via Telegram — registrado no banco via webhook/evento
    track("telegram");
    showFeedback("Abrindo Telegram...");
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  }

  async function copyLink() {
    // [N8N - Fluxo 3] Compartilhamento via Link — registrado no banco via webhook/evento
    track("link");
    try {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback("Link copiado!");
    } catch {
      alert(shareUrl);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F7F5EE]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <div className="mx-auto max-w-[480px]">
        {/* HERO */}
        <header
          className="relative overflow-hidden px-5 pb-10 pt-7 text-white"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #042C53 0%, #0A3B70 45%, #185FA5 100%)",
          }}
        >
          {/* glow + grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(420px 240px at 90% -20%, rgba(250,199,117,0.35), transparent 60%), radial-gradient(380px 220px at -10% 110%, rgba(55,138,221,0.45), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/85 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5BE3A2]" />
                CAMPANHA OFICIAL
              </span>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-white/60">
                vota.am
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 text-2xl font-black text-white ring-2 ring-white/30 backdrop-blur">
                  JS
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F6E56] ring-2 ring-[#042C53]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Candidato a Vereador
                </p>
                <h1 className="mt-1 text-[28px] font-extrabold leading-[1.05] tracking-tight">
                  João Silva
                </h1>
                <p className="mt-1 text-sm text-white/75">Partido XYZ · Manaus</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#FAC775] to-[#E0A24F] px-4 py-2.5 text-[#5A3A0B] shadow-[0_10px_24px_-10px_rgba(250,199,117,0.7)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">
                  Vote
                </span>
                <span className="text-xl font-extrabold tracking-wider">12345</span>
              </div>
              <span className="text-[11px] text-white/60">
                Eleições 2026
              </span>
            </div>
          </div>
        </header>

        {/* CORPO */}
        <main className="-mt-6 space-y-7 px-5 pb-12">
          {/* PROPOSTAS */}
          <section className="rounded-2xl border border-[#D3D1C7]/70 bg-white p-5 shadow-[0_18px_50px_-25px_rgba(4,44,83,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#185FA5]">
                  Plano de governo
                </p>
                <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-[#042C53]">
                  Nossas prioridades
                </h2>
              </div>
              <span className="rounded-full bg-[#E6F1FB] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#185FA5]">
                3 EIXOS
              </span>
            </div>

            <div className="mt-4 -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {propostas.map((p) => (
                <article
                  key={p.titulo}
                  className="group min-w-[200px] flex-shrink-0 snap-start rounded-xl border border-[#D3D1C7]/70 bg-gradient-to-br from-white to-[#F7F5EE]/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#378ADD]/60 hover:shadow-[0_12px_28px_-14px_rgba(24,95,165,0.45)] sm:min-w-0"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.bg} ring-1 ring-current/10`}
                  >
                    {p.icon}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#042C53]">
                    {p.titulo}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5F5E5A]">
                    {p.desc}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* COMPARTILHAR */}
          <section>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F6E56]">
                Mobilização
              </p>
              <h2 className="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-[#042C53]">
                Faça parte da mudança
              </h2>
              <p className="mt-1.5 text-sm text-[#5F5E5A]">
                Compartilhe e ajude a campanha a chegar mais longe
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {/* WhatsApp action card */}
              <button
                onClick={shareWhatsApp}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[#25D366]/40 bg-gradient-to-r from-[#1FB958] to-[#25D366] p-4 text-left text-white shadow-[0_14px_32px_-14px_rgba(37,211,102,0.7)] transition-all duration-200 hover:brightness-110 active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.52 3.48A11.94 11.94 0 0012.05 0C5.5 0 .15 5.34.15 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.65a11.9 11.9 0 005.78 1.47h.01c6.55 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.44-8.43zM12.06 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.72.98 1-3.62-.24-.37a9.9 9.9 0 01-1.52-5.29c0-5.46 4.45-9.9 9.91-9.9 2.65 0 5.13 1.03 7 2.9a9.83 9.83 0 012.9 7c0 5.46-4.45 9.9-9.92 9.9zm5.43-7.42c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.07 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                    WhatsApp
                  </p>
                  <p className="text-[15px] font-bold leading-tight">
                    Compartilhar com contatos
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 transition group-hover:translate-x-0.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              {/* Telegram */}
              <button
                onClick={shareTelegram}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[#229ED9]/40 bg-gradient-to-r from-[#1A8AC2] to-[#229ED9] p-4 text-left text-white shadow-[0_14px_32px_-14px_rgba(34,158,217,0.7)] transition-all duration-200 hover:brightness-110 active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 11.95c-.88-.25-.89-.86.2-1.3L19.8 4.6c.73-.33 1.43.18 1.15 1.3l-3.26 15.36c-.19.91-.74 1.13-1.5.71l-4.13-3.05-1.99 1.93c-.23.23-.42.42-.86.42z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                    Telegram
                  </p>
                  <p className="text-[15px] font-bold leading-tight">
                    Enviar para canal ou grupo
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 transition group-hover:translate-x-0.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              {/* Copiar link */}
              <button
                onClick={copyLink}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[#D3D1C7] bg-white p-4 text-left text-[#042C53] shadow-[0_8px_20px_-14px_rgba(4,44,83,0.4)] transition-all duration-200 hover:border-[#185FA5]/50 hover:bg-[#F7F5EE] active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[#E6F1FB] text-[#185FA5] ring-1 ring-[#B5D4F4]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
                    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5F5E5A]">
                    Link direto
                  </p>
                  <p className="text-[15px] font-bold leading-tight">
                    Copiar link da campanha
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#5F5E5A] transition group-hover:translate-x-0.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {feedback && (
              <p
                role="status"
                className="mt-4 text-center text-xs font-semibold text-[#0F6E56] animate-[fadeSlide_.25s_ease-out]"
              >
                ✓ {feedback}
              </p>
            )}
          </section>

          {pessoa_id && (
            <div className="rounded-xl border border-[#D3D1C7]/70 bg-white/70 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F5E5A]">
                Indicado por
              </p>
              <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-[#042C53]">
                {pessoa_id}
              </p>
            </div>
          )}

          <p className="pt-2 text-center text-[11px] text-[#5F5E5A]/80">
            © vota.am · Plataforma oficial de engajamento político
          </p>
        </main>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
