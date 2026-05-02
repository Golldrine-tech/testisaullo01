import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { verificarToken } from "@/utils/api";
import { FormularioCadastro } from "@/components/FormularioCadastro";

export const Route = createFileRoute("/ativar/")({
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
          navigate({ to: "/candidato", search: { pessoa_id: res.pessoa_id } });
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
      className="min-h-screen bg-white"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto max-w-[480px]">
        {/* Topo azul escuro */}
        <header className="bg-[#042C53] px-5 py-5 text-white">
          <h1 className="text-xl font-bold tracking-tight">vota.am</h1>
          <p className="text-sm text-white/65">Ative seu cartão NFC</p>
        </header>

        <main className="px-5 py-6">
          {estado.tipo === "loading" && (
            <div className="mt-12 flex flex-col items-center gap-3 text-[#5F5E5A]">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3D1C7] border-t-[#185FA5]" />
              <p className="text-sm">Verificando cartão...</p>
            </div>
          )}

          {estado.tipo === "erro" && (
            <div className="mt-12 rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] p-5 text-center">
              <h2 className="mb-2 text-lg font-semibold text-[#A32D2D]">Ops!</h2>
              <p className="text-sm text-[#A32D2D]">{estado.msg}</p>
            </div>
          )}

          {estado.tipo === "formulario" && <FormularioCadastro token={token} />}
        </main>
      </div>
    </div>
  );
}
