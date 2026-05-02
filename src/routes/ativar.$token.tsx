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
    <div className="min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-md mx-auto">
        {estado.tipo === "loading" && (
          <p className="text-center mt-12">Verificando cartão...</p>
        )}
        {estado.tipo === "erro" && (
          <div className="mt-12 text-center">
            <h1 className="text-xl font-semibold mb-2">Ops!</h1>
            <p className="text-red-600">{estado.msg}</p>
          </div>
        )}
        {estado.tipo === "formulario" && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Ativar cartão
            </h1>
            <FormularioCadastro token={token} />
          </>
        )}
      </div>
    </div>
  );
}