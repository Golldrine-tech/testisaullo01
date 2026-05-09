import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { registrarEvento, obterGPS } from "@/utils/api";
import saulloPhoto from "@/assets/saullo.jpg";
import saulloPhoto1 from "@/assets/saullo-1.jpg";
import saulloPhoto2 from "@/assets/saullo-2.jpg";
import saulloPhoto3 from "@/assets/saullo-3.jpg";

const searchSchema = z.object({
  ref: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/candidato")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Saullo Vianna — 2x mais entrega pelo Amazonas" },
      { name: "description", content: "R$ 300+ milhões em emendas, 3 milhões de refeições e a Lei do Lúpus. Conheça quem está transformando o Amazonas." },
      { property: "og:title", content: "Saullo Vianna — Transformando o Amazonas" },
      { property: "og:description", content: "R$ 300+ milhões em emendas, 86,3% pagas. Resultado, não promessa." },
    ],
  }),
  component: CandidatoPage,
});

// ──────────────────────────────────────────────────────────
// Hook: counter animation on viewport entry
// ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(target * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, value };
}

// ──────────────────────────────────────────────────────────
// Hook: reveal on scroll
// ──────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

// ──────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────
function CandidatoPage() {
  const { ref } = Route.useSearch();
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);

  // Preloader
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  // Scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setScrollProgress(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track approach
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const gps = await obterGPS();
      if (cancelado) return;
      registrarEvento({
        tipo: "APROXIMACAO",
        canal: "NFC",
        pessoa_id: ref || null,
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
  }, [ref]);

  function trackShare(canal: string) {
    registrarEvento({
      tipo: "COMPARTILHAMENTO",
      canal,
      pessoa_id: ref || null,
      url: typeof window !== "undefined" ? window.location.href : null,
      timestamp: new Date().toISOString(),
    });
  }

  const whatsappUrl =
    "https://wa.me/?text=" +
    encodeURIComponent("Quero apoiar Saullo 2026. Conheça: " + (typeof window !== "undefined" ? window.location.href : "https://saullovianna.com.br"));

  return (
    <>
      {/* PRELOADER */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A2A6B] transition-opacity duration-700 ${
          loading ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-[#FACC15]" />
          <div className="absolute inset-0 animate-ping rounded-full border border-[#1E5BBF]/30" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
          Carregando compromissos...
        </p>
      </div>

      {/* SCROLL PROGRESS */}
      <div className="fixed left-0 right-0 top-0 z-50 h-[3px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#1E5BBF] via-[#FACC15] to-[#1E5BBF] transition-[width] duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        className="relative min-h-screen overflow-x-hidden bg-[#0A2A6B] text-white"
        style={{
          fontFamily:
            "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Ambient background */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 500px at 80% -10%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(700px 500px at -10% 30%, rgba(10,42,107,0.35), transparent 60%), radial-gradient(900px 600px at 50% 110%, rgba(250,204,21,0.10), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* HERO */}
        <Hero />

        {/* SOCIAL PROOF MARQUEE */}
        <Marquee />

        {/* STORY SECTIONS */}
        <main className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 pb-32 sm:space-y-10 sm:px-6">
          <ImpactSocial />
          <ImpactLegislative />
          <ImpactInfra />
          <ImpactEfficiency />
          <Biography />
          <VisionFuture />
          <FinalCTA whatsappUrl={whatsappUrl} onShare={trackShare} />

          {ref && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Indicado por
              </p>
              <p className="mt-1 font-mono text-xs font-bold tracking-wider text-[#FACC15]">
                {ref}
              </p>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="relative z-10 flex min-h-[260px] items-center justify-center overflow-hidden border-t border-white/5 bg-[#061E4F] px-5 py-12 text-center sm:min-h-[40vh] sm:py-20">
          <FooterTyping />
          <div className="relative z-10">
            <a
              href="https://www.saullovianna.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-[#FACC15]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E5BBF]" />
              Site Oficial — saullovianna.com.br
            </a>
            <p className="mt-3 text-[11px] text-white/40">
              © 2026 · Campanha Saullo Vianna · Amazonas
            </p>
          </div>
        </footer>

        {/* FAB */}
        <Fab open={fabOpen} setOpen={setFabOpen} whatsappUrl={whatsappUrl} onShare={trackShare} />
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseHint {
          0%, 100% { transform: translate(-50%, 0) scale(1); box-shadow: 0 0 0 0 rgba(250,204,21,0.7); }
          50%      { transform: translate(-50%, -3px) scale(1.05); box-shadow: 0 0 0 14px rgba(250,204,21,0); }
        }
        @keyframes cursorGuide {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(8px, 14px); }
        }
        @keyframes fadeSwap {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        .reveal-init { opacity: 0; transform: translateY(40px) scale(0.97); }
        .reveal-on   { opacity: 1; transform: translateY(0)    scale(1);    transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
      `}</style>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Hero
// ──────────────────────────────────────────────────────────
function Hero() {
  const personas = [
    {
      photo: saulloPhoto,
      kicker: "DEPUTADO FEDERAL · AMAZONAS",
      title: "SAULLO",
      bigNumber: "2X",
      script: "mais",
      bottom: "TRABALHO",
      side: "2x mais\nentrega",
      desc: "Emendas que chegam aos 62 municípios. Resultado, não promessa.",
    },
    {
      photo: saulloPhoto1,
      kicker: "PRESENÇA NO INTERIOR · AMAZONAS",
      title: "SAULLO",
      bigNumber: "62",
      script: "municípios",
      bottom: "PRESENTE",
      side: "no interior\ndo AM",
      desc: "Cada cidade visitada. Cada comunidade ouvida. Cada demanda anotada.",
    },
    {
      photo: saulloPhoto2,
      kicker: "GESTÃO PÚBLICA · BRASÍLIA",
      title: "SAULLO",
      bigNumber: "300",
      script: "milhões",
      bottom: "EXECUÇÃO",
      side: "em emendas\ngarantidas",
      desc: "R$ 300 milhões em emendas — 86,3% executados. Líder em entrega no AM.",
    },
    {
      photo: saulloPhoto3,
      kicker: "VOZ DO POVO · MANAUS",
      title: "SAULLO",
      bigNumber: "3",
      script: "milhões",
      bottom: "REFEIÇÕES",
      side: "Prato\ndo Povo",
      desc: "3 milhões de refeições servidas. Combate à fome com dignidade.",
    },
  ];

  const [selected, setSelected] = useState(0);
  const [typed, setTyped] = useState("");
  const p = personas[selected];

  // Auto-advance personas every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setSelected((s) => (s + 1) % personas.length);
    }, 5000);
    return () => clearInterval(id);
  }, [personas.length]);

  // Typing effect for background "SAULLO"
  useEffect(() => {
    const word = "SAULLO ";
    let i = 0;
    setTyped("");
    const id = setInterval(() => {
      i = (i + 1) % (word.length + 1);
      setTyped(word.slice(0, i));
    }, 220);
    return () => clearInterval(id);
  }, [selected]);

  // Build the fan of silhouettes (ordered: others first, main last on top)
  const fanOrder = personas
    .map((per, i) => ({ per, i }))
    .filter(({ i }) => i !== selected);

  return (
    <section className="relative z-10 -mx-0 overflow-hidden">
      <div className="relative bg-gradient-to-br from-[#082466] via-[#0A2A6B] to-[#0E3CA0]">
        {/* Animated typing "SAULLO" backdrop, repeated with fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        >
          <div
            className="absolute inset-0 flex flex-col justify-center gap-2 px-4 font-black leading-[0.9] tracking-tighter"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {[0.10, 0.07, 0.05, 0.04, 0.03].map((op, row) => (
              <div
                key={row}
                className="whitespace-nowrap text-[110px] sm:text-[150px]"
                style={{ color: `rgba(255,255,255,${op})` }}
              >
                {typed.repeat(6)}
                <span className="ml-1 inline-block w-[0.08em] animate-pulse bg-white/20 align-middle" style={{ height: "0.7em" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Amazonas outline accent */}
        <svg
          aria-hidden
          viewBox="0 0 200 160"
          className="pointer-events-none absolute right-4 top-4 hidden h-24 w-32 text-[#FACC15] opacity-70 lg:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        >
          <path d="M20 40 L60 25 L110 20 L160 35 L185 60 L180 100 L160 130 L120 140 L80 135 L40 120 L15 90 Z" />
        </svg>

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.15fr_1fr]">
          {/* LEFT: Title + text + socials, centered */}
          <div className="relative z-10 text-center text-white lg:text-left">
            <p className="text-[11px] font-bold tracking-[0.28em] text-[#FACC15]">
              {p.kicker.split(" · ")[0]}
              <span className="ml-3 text-white/80">{p.kicker.split(" · ")[1]}</span>
            </p>

            <h1
              className="mt-4 font-black leading-[0.88] tracking-tight"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              <span className="block text-[58px] sm:text-[78px]">
                {p.title}
                <span className="ml-2 inline-flex translate-y-[-12px] items-center gap-1 text-2xl">
                  <span className="text-[#FACC15]">★</span>
                  <span className="text-[#EF4444]">♥</span>
                </span>
              </span>
              <span className="relative inline-block text-[88px] sm:text-[120px]">
                {p.bigNumber}
                <span
                  className="absolute -right-6 top-2 -rotate-6 text-[44px] font-bold text-[#FACC15] sm:-right-10 sm:text-[64px]"
                  style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}
                >
                  {p.script}
                </span>
              </span>
              <span className="block text-[44px] sm:text-[60px]">{p.bottom}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-base lg:mx-0">
              {p.desc}
            </p>

            {/* Social badges (clique abre guia para o chat) */}
            <SocialBadges />


            {/* Selector dots */}
            <div className="mt-6 flex justify-center gap-2 lg:justify-start">
              {personas.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  aria-label={`Persona ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === selected ? "w-8 bg-[#FACC15]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Photo + fanned silhouettes */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
            <div className="relative aspect-[4/5]">
              {/* Fanned silhouettes — translucent darker copies behind */}
              {fanOrder.map(({ per, i }, idx) => {
                const offset = (idx + 1) * 22;
                const opacity = 0.5 - idx * 0.1;
                return (
                  <div
                    key={i}
                    aria-hidden
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      transform: `translateX(${offset}px) translateY(${idx * 4}px)`,
                      zIndex: 1,
                    }}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        WebkitMaskImage: `url(${per.photo})`,
                        maskImage: `url(${per.photo})`,
                        WebkitMaskSize: "cover",
                        maskSize: "cover",
                        WebkitMaskPosition: "center top",
                        maskPosition: "center top",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        background: `linear-gradient(180deg, #1E5BBF, #0A2A6B)`,
                        opacity,
                        filter: "drop-shadow(0 0 1px rgba(56,189,248,0.6))",
                      }}
                    />
                  </div>
                );
              })}

              {/* Main photo with cyan glow */}
              <div
                key={selected}
                className="relative z-10 h-full w-full"
                style={{ animation: "fadeSwap .7s ease-out" }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage: `url(${p.photo})`,
                    maskImage: `url(${p.photo})`,
                    WebkitMaskSize: "cover",
                    maskSize: "cover",
                    WebkitMaskPosition: "center top",
                    maskPosition: "center top",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    background: "#38BDF8",
                    filter: "blur(8px)",
                    transform: "scale(1.03)",
                  }}
                />
                <img
                  src={p.photo}
                  alt="Saullo Vianna"
                  className="relative h-full w-full object-cover object-top"
                  style={{
                    WebkitMaskImage: `url(${p.photo})`,
                    maskImage: `url(${p.photo})`,
                    WebkitMaskSize: "cover",
                    maskSize: "cover",
                    WebkitMaskPosition: "center top",
                    maskPosition: "center top",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Yellow bottom stripe */}
        <div className="h-3 w-full bg-[#FACC15]" />
      </div>

      {/* CTA row below hero */}
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#apoiar"
            className="inline-flex items-center gap-2 rounded-full bg-[#FACC15] px-7 py-3.5 text-sm font-bold text-[#0A2A6B] shadow-[0_18px_40px_-12px_rgba(250,204,21,0.7)] transition hover:scale-[1.02]"
          >
            Quero apoiar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#bio"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/5"
          >
            Conhecer Saullo
          </a>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────
// Social Badges — clique abre tooltip + cursor guia até o chat
// ──────────────────────────────────────────────────────────
function SocialBadges() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 4500);
    return () => clearTimeout(t);
  }, [active]);

  const badges = [
    { bg: "#38BDF8", fg: "#0A2A6B", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1z"/></svg>
    ) },
    { bg: "#0A2A6B", fg: "#FACC15", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/></svg>
    ) },
    { bg: "#FACC15", fg: "#0A2A6B", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 7c2 0 3-2 5-2s3 1 4 1 1-1 3-1c1.5 0 2.5.5 2.5 2 0 4-3 9-7 9S4 12 4 8c0-.5.3-1 1-1zm3 1.5a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z"/></svg>
    ) },
    { bg: "#FACC15", fg: "#0A2A6B", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.8 3.6L17 4l-.8 3.7L20 9l-3 2.5 1.5 3.5-3.7-1L13 18l-1-3.5L9 18l-1.2-4-3.7 1L5.5 11.5 3 9l3.7-1.3L6 4l3.2 1.6z"/></svg>
    ) },
    { bg: "#0A2A6B", fg: "#FACC15", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 4h6l2 4h6v10H5z"/></svg>
    ) },
  ];

  return (
    <>
      <div className="mt-5 flex items-center justify-center gap-3 lg:justify-start">
        {badges.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(true)}
            aria-label="Fale com a nossa equipe"
            className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#0A1F4F] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition hover:scale-110 active:scale-95"
            style={{ background: b.bg, color: b.fg }}
          >
            {b.icon}
          </button>
        ))}
      </div>

      {/* Tooltip + cursor guia */}
      {active && (
        <>
          <div
            className="fixed bottom-44 right-5 z-[60] max-w-[240px] rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0A2A6B] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]"
            style={{ animation: "fadeSwap .35s ease-out" }}
          >
            Fale com a nossa equipe 👇
            <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 bg-white" />
          </div>
          <div
            aria-hidden
            className="fixed z-[60] pointer-events-none"
            style={{
              right: "44px",
              bottom: "70px",
              animation: "cursorGuide 1.2s ease-in-out infinite",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#0A2A6B" stroke="#FACC15" strokeWidth="1.5">
              <path d="M3 2l7 18 2-7 7-2z" />
            </svg>
          </div>
        </>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Marquee — social proof
// ──────────────────────────────────────────────────────────
function Marquee() {
  const items = [
    "G1 · R$ 300 milhões em emendas para o AM",
    "Folha · Lei do Lúpus aprovada no Congresso",
    "A Crítica · Prato do Povo serve 3 milhões de refeições",
    "Diário · 86,3% das emendas executadas",
    "Portal Amazonas · Porto da Manaus Moderna entregue",
    "UOL · Saullo lidera execução orçamentária do AM",
  ];
  const loop = [...items, ...items];

  return (
    <div className="relative z-10 border-y border-white/5 bg-white/[0.02] py-4 backdrop-blur">
      <div className="overflow-hidden">
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: "marquee 38s linear infinite", width: "max-content" }}
        >
          {loop.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-white/50"
            >
              <span className="h-1 w-1 rounded-full bg-[#FACC15]" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Sticky stacking card wrapper
// ──────────────────────────────────────────────────────────
function StackCard({
  index,
  accent,
  children,
}: {
  index: number;
  accent?: string;
  children: React.ReactNode;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal-init ${shown ? "reveal-on" : ""} sticky`}
      style={{
        top: `${64 + index * 14}px`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#103A8A] to-[#0A2A6B] p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-10"
      >
        {accent && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: accent }}
          />
        )}
        {children}
      </div>
    </div>
  );
}

// Section heading helper
function SectionLabel({ n, label, color }: { n: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black"
        style={{ background: `${color}20`, color }}
      >
        {n}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Social Impact
// ──────────────────────────────────────────────────────────
function ImpactSocial() {
  const { ref, value } = useCountUp(3, 1600);
  return (
    <StackCard index={0} accent="#1E5BBF">
      <SectionLabel n="01" label="Impacto Social" color="#38BDF8" />
      <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-4xl font-black leading-[1] tracking-tight sm:text-5xl">
            <span ref={ref} className="bg-gradient-to-br from-[#38BDF8] to-[#FACC15] bg-clip-text text-transparent tabular-nums">
              {value.toFixed(1)}
            </span>{" "}
            milhões
          </h2>
          <p className="mt-3 text-xl font-bold text-white">
            de refeições servidas pelo <span className="text-[#FACC15]">Prato do Povo</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
            Combate à fome com dignidade. Programa que garante alimentação acessível
            para quem mais precisa, em parceria com comunidades e cozinhas solidárias.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["🍽️", "🤝", "❤️"].map((e, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl backdrop-blur"
              style={{ animation: `floaty ${3 + i * 0.4}s ease-in-out infinite` }}
            >
              {e}
            </div>
          ))}
        </div>
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Legislative
// ──────────────────────────────────────────────────────────
function ImpactLegislative() {
  return (
    <StackCard index={1} accent="#FACC15">
      <SectionLabel n="02" label="Impacto Legislativo" color="#FACC15" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-[#FACC15]/20 bg-gradient-to-br from-[#FACC15]/10 to-transparent p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FACC15]">
            Projeto de Lei
          </p>
          <p className="mt-2 text-5xl font-black tracking-tight text-white">
            PL 1456<span className="text-[#FACC15]">/23</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-white/80">Lei do Lúpus</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#38BDF8]/40 bg-[#1E5BBF]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
            Aprovado
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Direito à medicação <span className="text-[#FACC15]">gratuita</span> para quem vive com lúpus.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Expansão de direitos, acesso garantido pelo SUS e fim da peregrinação por tratamento.
            Uma conquista que beneficia milhares de famílias brasileiras.
          </p>
        </div>
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Infrastructure
// ──────────────────────────────────────────────────────────
function ImpactInfra() {
  const items = [
    {
      title: "Porto da Manaus Moderna",
      desc: "Modernização e dignidade para quem chega e parte da capital.",
      icon: "⚓",
    },
    {
      title: "Campos esportivos em Parintins",
      desc: "Esporte, juventude e oportunidade no coração da ilha.",
      icon: "⚽",
    },
  ];
  return (
    <StackCard index={2} accent="#38BDF8">
      <SectionLabel n="03" label="Infraestrutura & Resultados" color="#38BDF8" />
      <h2 className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
        Obras que <span className="text-[#38BDF8]">se vê</span>, resultados que <span className="text-[#FACC15]">se sente</span>.
      </h2>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-[#38BDF8]/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E5BBF]/20 to-transparent text-2xl ring-1 ring-white/10">
              {it.icon}
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{it.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">{it.desc}</p>
          </div>
        ))}
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Efficiency
// ──────────────────────────────────────────────────────────
function ImpactEfficiency() {
  const { ref, value } = useCountUp(86.3, 1800);
  return (
    <StackCard index={3} accent="#FACC15">
      <SectionLabel n="04" label="Eficiência" color="#FACC15" />
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              ref={ref}
              className="bg-gradient-to-br from-[#FACC15] via-white to-[#38BDF8] bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent tabular-nums sm:text-8xl"
            >
              {value.toFixed(1)}
            </span>
            <span className="text-3xl font-black text-white/80">%</span>
          </div>
          <p className="mt-3 text-xl font-bold text-white">das emendas pagas</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
            Não basta indicar — é preciso executar. A maior taxa de execução
            entre os parlamentares do Amazonas. <strong className="text-white">Resultado, não promessa.</strong>
          </p>
        </div>

        {/* Progress ring */}
        <div className="relative mx-auto h-56 w-56">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(value / 100) * 263.9} 263.9`}
              style={{ transition: "stroke-dasharray .3s linear" }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E5BBF" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Execução</span>
            <span className="text-3xl font-black text-white tabular-nums">{value.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Biography
// ──────────────────────────────────────────────────────────
function Biography() {
  return (
    <StackCard index={4} accent="#1E5BBF">
      <a id="bio" />
      <SectionLabel n="05" label="Biografia" color="#38BDF8" />
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src={saulloPhoto} alt="Saullo Vianna" className="aspect-square w-full object-cover" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">Saullo Vianna</h2>
          <p className="mt-2 text-sm font-semibold text-[#38BDF8]">41 anos · Manaus / AM</p>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Nascido e criado em Manaus, Saullo dedicou sua trajetória pública à
            redução das desigualdades no Amazonas. Foi titular da
            <strong className="text-white"> SEMASC</strong>, onde estruturou políticas de
            assistência social que alcançaram comunidades historicamente esquecidas.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { l: "Idade", v: "41" },
              { l: "Origem", v: "Manaus" },
              { l: "Trajetória", v: "Ex-SEMASC" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">{s.l}</p>
                <p className="mt-1 text-sm font-bold text-white">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Section: Vision 2026
// ──────────────────────────────────────────────────────────
function VisionFuture() {
  return (
    <StackCard index={5} accent="#FACC15">
      <SectionLabel n="06" label="Visão 2026" color="#FACC15" />
      <h2 className="mt-6 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
        Um Amazonas que <span className="bg-gradient-to-r from-[#1E5BBF] to-[#FACC15] bg-clip-text text-transparent">não depende</span> apenas da Zona Franca.
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
        Proposta do <strong className="text-white">Fundo de Diversificação Econômica do Amazonas</strong> —
        um mecanismo permanente para preparar o estado para o futuro: bioeconomia,
        tecnologia, turismo e indústria 4.0.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {["Bioeconomia", "Tecnologia", "Turismo", "Indústria 4.0"].map((t) => (
          <div
            key={t}
            className="rounded-xl border border-[#FACC15]/20 bg-gradient-to-br from-[#FACC15]/10 to-transparent px-4 py-3 text-center text-sm font-bold text-white"
          >
            {t}
          </div>
        ))}
      </div>
    </StackCard>
  );
}

// ──────────────────────────────────────────────────────────
// Final CTA
// ──────────────────────────────────────────────────────────
function FinalCTA({ whatsappUrl, onShare }: { whatsappUrl: string; onShare: (c: string) => void }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div id="apoiar" ref={ref} className={`reveal-init ${shown ? "reveal-on" : ""}`}>
      <div className="relative overflow-hidden rounded-3xl border border-[#FACC15]/30 bg-gradient-to-br from-[#0E3380] via-[#0A2A6B] to-[#1B3A8F] p-10 text-center sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(500px 300px at 50% 0%, rgba(250,204,21,0.25), transparent 60%), radial-gradient(500px 300px at 50% 100%, rgba(56,189,248,0.2), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FACC15]">
            Sua hora · Sua escolha
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            O Amazonas <span className="bg-gradient-to-r from-[#FACC15] to-[#38BDF8] bg-clip-text text-transparent">não pode parar</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/70">
            A transformação só continua com você. Apoie agora e faça parte da próxima entrega.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare("cta_final_whatsapp")}
            className="group mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#FACC15] px-9 py-4 text-base font-black text-[#0A2A6B] shadow-[0_24px_60px_-12px_rgba(250,204,21,0.7)] transition hover:scale-[1.03] active:scale-[0.98]"
          >
            Apoiar agora
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Floating Action Button + chatbot
// ──────────────────────────────────────────────────────────
function Fab({
  open,
  setOpen,
  whatsappUrl,
  onShare,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  whatsappUrl: string;
  onShare: (c: string) => void;
}) {
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Olá! Sou a assistente da campanha. Como posso ajudar?" },
  ]);

  function reply(option: "Propostas" | "Agenda" | "Como votar") {
    setMessages((m) => [...m, { from: "user", text: option }]);
    const answers: Record<typeof option, string> = {
      Propostas:
        "Nossas prioridades: Fundo de Diversificação Econômica, ampliação do Prato do Povo e infraestrutura para os 62 municípios.",
      Agenda:
        "Agenda atualizada toda semana no site oficial: saullovianna.com.br",
      "Como votar":
        "Em 2026, digite o número da campanha na urna. Confirme nos canais oficiais antes de votar!",
    };
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: answers[option] }]);
    }, 500);
  }

  return (
    <>
      {/* Panel */}
      <div
        className={`fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl border border-white/10 bg-[#0E3075]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E5BBF] to-[#0A2A6B] text-xs font-black">
              SV
            </span>
            <div>
              <p className="text-xs font-bold text-white">Campanha Saullo</p>
              <p className="text-[10px] text-[#38BDF8]">● Online agora</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.from === "user"
                    ? "bg-[#FACC15] text-[#0A2A6B]"
                    : "bg-white/5 text-white/85 ring-1 ring-white/10"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
          {(["Propostas", "Agenda", "Como votar"] as const).map((o) => (
            <button
              key={o}
              onClick={() => reply(o)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition hover:border-[#FACC15]/60 hover:text-[#FACC15]"
            >
              {o}
            </button>
          ))}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onShare("fab_whatsapp")}
          className="flex items-center justify-center gap-2 rounded-b-2xl bg-gradient-to-r from-[#1FB958] to-[#25D366] py-3 text-sm font-bold text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.52 3.48A11.94 11.94 0 0012.05 0C5.5 0 .15 5.34.15 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.65a11.9 11.9 0 005.78 1.47h.01c6.55 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.44-8.43z" />
          </svg>
          Falar no WhatsApp
        </a>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir assistente"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B] text-[#0A2A6B] shadow-[0_20px_40px_-10px_rgba(250,204,21,0.7)] transition hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#FACC15]/40" />
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Footer typing "SAULLO" — single-line backdrop
// ──────────────────────────────────────────────────────────
function FooterTyping() {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const word = "SAULLO ";
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % (word.length + 1);
      setTyped(word.slice(0, i));
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex select-none items-center overflow-hidden whitespace-nowrap font-black leading-none tracking-tighter"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "clamp(160px, 38vw, 320px)",
        color: "rgba(255,255,255,0.08)",
      }}
    >
      {typed.repeat(6)}
      <span
        className="ml-1 inline-block w-[0.08em] animate-pulse bg-white/20 align-middle"
        style={{ height: "0.7em" }}
      />
    </div>
  );
}
