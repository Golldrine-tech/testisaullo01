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
    track("whatsapp");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      "_blank",
    );
  }

  function shareTelegram() {
    track("telegram");
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  }

  async function copyLink() {
    track("link");
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copiado!");
    } catch {
      alert(shareUrl);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-3xl font-bold">Candidato</h1>
        <p className="mt-2 opacity-90">Sua voz, nossa força.</p>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Sobre</h2>
          <p className="text-sm text-muted-foreground">
            Conheça as propostas, acompanhe a agenda e ajude a espalhar a
            campanha.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Compartilhar</h2>
          <div className="space-y-2">
            <button
              onClick={shareWhatsApp}
              className="w-full bg-green-600 text-white rounded px-4 py-3 font-medium"
            >
              Compartilhar no WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="w-full bg-blue-500 text-white rounded px-4 py-3 font-medium"
            >
              Compartilhar no Telegram
            </button>
            <button
              onClick={copyLink}
              className="w-full border rounded px-4 py-3 font-medium"
            >
              Copiar link
            </button>
          </div>
        </section>

        {pessoa_id && (
          <p className="text-xs text-muted-foreground text-center">
            Indicado por: {pessoa_id}
          </p>
        )}
      </main>
    </div>
  );
}