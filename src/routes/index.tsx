import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto max-w-[480px]">
        <header className="bg-[#042C53] px-5 py-6 text-white">
          <h1 className="text-2xl font-bold tracking-tight">vota.am</h1>
          <p className="text-sm text-white/65">
            Sistema de engajamento político por NFC
          </p>
        </header>

        <main className="space-y-6 px-5 py-7">
          <section className="rounded-xl border border-[#B5D4F4] bg-[#E6F1FB] p-5">
            <p className="text-sm leading-relaxed text-[#0C447C]">
              Toque seu cartão NFC para começar. Cada cartão abre uma URL no
              formato <code className="font-mono text-xs">vota.am/ativar/TOKEN</code>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5F5E5A]">
              Telas do sistema
            </h2>
            <div className="space-y-2.5">
              <Link
                to="/ativar/$token"
                params={{ token: "DEMO123" }}
                className="block rounded-lg border border-[#D3D1C7] bg-white p-4 transition hover:border-[#185FA5] hover:bg-[#F1EFE8]"
              >
                <p className="text-sm font-semibold text-[#042C53]">
                  /ativar/:token
                </p>
                <p className="text-xs text-[#5F5E5A]">
                  Formulário de primeiro acesso (cadastro)
                </p>
              </Link>

              <Link
                to="/bem-vindo"
                search={{ id: "L67890", cargo: "LIDERANÇA", nome: "Maria Silva" }}
                className="block rounded-lg border border-[#D3D1C7] bg-white p-4 transition hover:border-[#185FA5] hover:bg-[#F1EFE8]"
              >
                <p className="text-sm font-semibold text-[#042C53]">/bem-vindo</p>
                <p className="text-xs text-[#5F5E5A]">
                  Confirmação de cadastro com ID gerado
                </p>
              </Link>

              <Link
                to="/candidato"
                search={{ pessoa_id: "L67890" }}
                className="block rounded-lg border border-[#D3D1C7] bg-white p-4 transition hover:border-[#185FA5] hover:bg-[#F1EFE8]"
              >
                <p className="text-sm font-semibold text-[#042C53]">/candidato</p>
                <p className="text-xs text-[#5F5E5A]">
                  Landing page do candidato
                </p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
