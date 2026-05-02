import { useEffect } from "react";
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
    icone: "📚",
    titulo: "Educação",
    desc: "Escolas em tempo integral e valorização docente.",
  },
  {
    icone: "🏥",
    titulo: "Saúde",
    desc: "Mais postos abertos e atendimento sem fila.",
  },
  {
    icone: "🛣️",
    titulo: "Infraestrutura",
    desc: "Bairros conectados, ruas iluminadas e seguras.",
  },
];

function CandidatoPage() {
  const { pessoa_id } = Route.useSearch();

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

  function shareWhatsApp() {
    // [N8N - Fluxo 3] Compartilhamento via WhatsApp — registrado no banco via webhook/evento
    track("whatsapp");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      "_blank",
    );
  }

  function shareTelegram() {
    // [N8N - Fluxo 3] Compartilhamento via Telegram — registrado no banco via webhook/evento
    track("telegram");
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
      alert("Link copiado!");
    } catch {
      alert(shareUrl);
    }
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto max-w-[480px]">
        {/* Header gradiente */}
        <header
          className="px-5 py-7 text-white"
          style={{
            backgroundImage: "linear-gradient(135deg, #042C53 0%, #185FA5 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-bold backdrop-blur-sm ring-2 ring-white/30">
              JS
            </div>
            <div className="flex-1">
              <h1 className="text-[26px] font-bold leading-tight">João Silva</h1>
              <p className="text-sm text-white/75">Vereador · Partido XYZ</p>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FAC775] px-3 py-1.5 text-[#633806]">
            <span className="text-xs font-medium">Vote</span>
            <span className="text-lg font-bold">12345</span>
          </div>
        </header>

        <main className="space-y-7 px-5 py-6">
          {/* Propostas */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-[#042C53]">
              Nossas propostas
            </h2>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {propostas.map((p) => (
                <article
                  key={p.titulo}
                  className="min-w-[180px] flex-shrink-0 rounded-xl border border-[#D3D1C7] bg-white p-4 sm:min-w-0"
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F1FB] text-lg">
                    {p.icone}
                  </div>
                  <h3 className="text-sm font-semibold text-[#042C53]">
                    {p.titulo}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5F5E5A]">
                    {p.desc}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Compartilhar */}
          <section>
            <h2 className="text-base font-semibold text-[#042C53]">
              Faça parte da mudança
            </h2>
            <p className="mt-1 text-xs text-[#5F5E5A]">
              Compartilhe e ajude a campanha a chegar mais longe
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={shareWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <span aria-hidden>💬</span>
                Compartilhar no WhatsApp
              </button>
              <button
                onClick={shareTelegram}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <span aria-hidden>✈️</span>
                Compartilhar no Telegram
              </button>
              <button
                onClick={copyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D3D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#444441] transition hover:bg-[#F1EFE8]"
              >
                <span aria-hidden>🔗</span>
                Copiar link
              </button>
            </div>
          </section>

          {pessoa_id && (
            <p className="pt-2 text-center text-[11px] text-[#5F5E5A]">
              Indicado por {pessoa_id}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
