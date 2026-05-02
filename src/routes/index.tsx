import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "vota.am — Plataforma oficial de campanha NFC" },
      {
        name: "description",
        content:
          "Sistema de identidade digital e engajamento político por NFC. Ative seu cartão e participe da campanha.",
      },
    ],
  }),
  component: Index,
});

const telas = [
  {
    to: "/ativar/$token" as const,
    params: { token: "DEMO123" },
    badge: "Onboarding",
    badgeClass: "bg-[#E6F1FB] text-[#0C447C] ring-1 ring-[#B5D4F4]",
    titulo: "Ativação do cartão",
    descricao:
      "Primeiro acesso após o toque NFC. Validação de identidade e cadastro.",
    rota: "/ativar/:token",
    accent: "from-[#185FA5] to-[#378ADD]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M7 12h.01M11 12h.01M15 9c1.5 1 1.5 5 0 6" />
      </svg>
    ),
  },
  {
    to: "/bem-vindo" as const,
    search: { id: "L67890", cargo: "LIDERANÇA", nome: "Maria Silva" } as const,
    badge: "Confirmação",
    badgeClass: "bg-[#E1F5EE] text-[#0F6E56] ring-1 ring-[#A8DFCB]",
    titulo: "Identidade emitida",
    descricao:
      "Tela de confirmação com ID gerado, cargo e próximos passos.",
    rota: "/bem-vindo",
    accent: "from-[#0F6E56] to-[#2BA383]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    to: "/candidato" as const,
    search: { pessoa_id: "L67890" } as const,
    badge: "Mobilização",
    badgeClass: "bg-[#FAEEDA] text-[#BA7517] ring-1 ring-[#FAC775]",
    titulo: "Página do candidato",
    descricao:
      "Landing pública com plano de governo e ferramentas de compartilhamento.",
    rota: "/candidato",
    accent: "from-[#BA7517] to-[#E0A24F]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

function Index() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#F4F7FB]"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {/* fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-[#042C53] via-[#08376B] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(600px 280px at 85% -10%, rgba(250,199,117,0.28), transparent 60%), radial-gradient(540px 260px at 0% 10%, rgba(55,138,221,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[480px] px-5 pb-14 pt-7">
        {/* HEADER GLASS */}
        <header className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-5 shadow-[0_24px_60px_-25px_rgba(4,44,83,0.65)] backdrop-blur-md">
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
                  Plataforma oficial
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5BE3A2]" />
              SISTEMA OPERACIONAL
            </span>
          </div>
        </header>

        {/* HERO */}
        <section className="relative mt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FAC775]">
            Identidade digital · NFC
          </p>
          <h2 className="mt-2 text-[30px] font-extrabold leading-[1.1] tracking-tight text-white">
            Engajamento político<br />
            com tecnologia<br />
            <span className="bg-gradient-to-r from-[#9CC9F2] to-[#FAC775] bg-clip-text text-transparent">
              de ponta a ponta.
            </span>
          </h2>
          <p className="mt-3 max-w-[400px] text-sm leading-relaxed text-white/75">
            Cada cartão é uma identidade única. Cada toque, um registro
            seguro. Toda a rede da campanha auditável em tempo real.
          </p>

          {/* MÉTRICAS — selo de autoridade */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-white/[0.07] p-1.5 backdrop-blur-md">
            {[
              { v: "256-bit", l: "Criptografia" },
              { v: "100%", l: "LGPD" },
              { v: "24/7", l: "Auditoria" },
            ].map((m) => (
              <div
                key={m.l}
                className="flex flex-col items-center justify-center rounded-xl bg-white/[0.04] px-2 py-3 ring-1 ring-inset ring-white/5"
              >
                <span className="text-[13px] font-extrabold tracking-tight text-white">
                  {m.v}
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {m.l}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CARD INSTRUÇÃO NFC */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#D3D1C7]/70 bg-white shadow-[0_24px_60px_-30px_rgba(4,44,83,0.45)]">
          <div className="h-1 w-full bg-gradient-to-r from-[#042C53] via-[#185FA5] to-[#FAC775]" />
          <div className="px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[#E6F1FB] to-white ring-1 ring-[#B5D4F4]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12c2-3 4-3 6 0s4 3 6 0" />
                  <path d="M3 9c3-4 6-4 9 0s6 4 9 0" />
                  <path d="M7 15c1.5-2 3-2 4.5 0s3 2 4.5 0" />
                </svg>
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-2xl bg-[#378ADD]/20 blur-xl"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#185FA5]">
                  Como começar
                </p>
                <h3 className="mt-1 text-[17px] font-extrabold leading-tight tracking-tight text-[#042C53]">
                  Aproxime seu cartão NFC
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5F5E5A]">
                  Cada cartão abre uma URL única no formato{" "}
                  <code className="rounded-md bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-[12px] font-semibold text-[#042C53]">
                    vota.am/ativar/TOKEN
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#D3D1C7]/60 bg-[#F7F9FC] px-6 py-3 text-[11px] text-[#5F5E5A]">
            <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              CONEXÃO SEGURA · TLS 1.3
            </span>
            <span className="font-mono tracking-wider text-[#042C53]">v1.0</span>
          </div>
        </section>

        {/* TELAS DO SISTEMA */}
        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#185FA5]">
                Demo · navegação
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold tracking-tight text-[#042C53]">
                Telas do sistema
              </h2>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#185FA5] ring-1 ring-[#B5D4F4] shadow-sm">
              {telas.length} ROTAS
            </span>
          </div>

          <div className="space-y-3">
            {telas.map((t) => {
              const linkProps =
                "params" in t
                  ? { to: t.to, params: t.params }
                  : { to: t.to, search: t.search };
              return (
                <Link
                  key={t.rota}
                  {...(linkProps as React.ComponentProps<typeof Link>)}
                  className="group relative block overflow-hidden rounded-2xl border border-[#E2E5EC] bg-white p-5 shadow-[0_2px_4px_rgba(4,44,83,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#185FA5]/40 hover:shadow-[0_18px_40px_-20px_rgba(24,95,165,0.45)]"
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.accent}`}
                  />
                  <div className="flex items-start gap-4 pl-2">
                    <div
                      className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${t.accent} text-white shadow-[0_8px_20px_-8px_rgba(24,95,165,0.55)] ring-1 ring-white/20`}
                    >
                      {t.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${t.badgeClass}`}
                        >
                          {t.badge}
                        </span>
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-[#5F5E5A]/70">
                          {t.rota}
                        </span>
                      </div>
                      <h3 className="mt-2 text-[15px] font-extrabold leading-tight tracking-tight text-[#042C53]">
                        {t.titulo}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#5F5E5A]">
                        {t.descricao}
                      </p>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-1 flex-none text-[#5F5E5A] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#185FA5]"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FOOTER INSTITUCIONAL */}
        <footer className="mt-10 rounded-2xl border border-[#E2E5EC] bg-white/70 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F1FB] text-[#185FA5] ring-1 ring-[#B5D4F4]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-[#042C53]">
                  Dados protegidos · LGPD
                </p>
                <p className="text-[10px] text-[#5F5E5A]">
                  Auditoria contínua · vota.am
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5F5E5A]/70">
              © 2026
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}