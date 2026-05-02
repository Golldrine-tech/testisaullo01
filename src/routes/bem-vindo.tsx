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

function badgeClasses(cargo: string) {
  if (cargo === "CABEÇA") return "bg-[#E6F1FB] text-[#0C447C]";
  if (cargo === "LIDERANÇA") return "bg-[#E1F5EE] text-[#0F6E56]";
  if (cargo === "ATIVISTA") return "bg-[#FAEEDA] text-[#BA7517]";
  return "bg-[#F1EFE8] text-[#5F5E5A]";
}

function idColor(cargo: string) {
  if (cargo === "CABEÇA") return "text-[#042C53]";
  if (cargo === "LIDERANÇA") return "text-[#0F6E56]";
  if (cargo === "ATIVISTA") return "text-[#BA7517]";
  return "text-[#042C53]";
}

function instrucao(cargo: string) {
  if (cargo === "CABEÇA")
    return {
      bg: "bg-[#FAEEDA] border-[#FAC775]",
      texto:
        "Guarde bem este ID. Entregue cartões NFC às Lideranças e informe seu ID a cada uma no momento do cadastro.",
    };
  if (cargo === "LIDERANÇA")
    return {
      bg: "bg-[#E1F5EE] border-[#A8DFCB]",
      texto:
        "Distribua cartões NFC aos Ativistas e informe seu ID L##### a cada um.",
    };
  if (cargo === "ATIVISTA")
    return {
      bg: "bg-[#EAF3DE] border-[#C4DCA0]",
      texto:
        "Seu cartão está ativo! A partir de agora, cada toque registra uma abordagem em seu nome.",
    };
  return null;
}

function BemVindoPage() {
  const { id, cargo, nome } = Route.useSearch();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(id);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* silencioso */
    }
  }

  const inst = instrucao(cargo);

  return (
    <div
      className="min-h-screen bg-[#E6F1FB] px-5 py-8"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="mx-auto max-w-[480px] space-y-6">
        {/* Sucesso */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F6E56]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#042C53]">Cadastro realizado!</h1>
          {nome && <p className="text-base text-[#444441]">{nome}</p>}
        </div>

        {/* Card de ID */}
        <div className="rounded-xl border border-[#B5D4F4] bg-white p-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-[#5F5E5A]">
            Seu ID de identificação
          </p>
          <p
            className={`mt-2 font-mono text-[36px] font-bold leading-tight ${idColor(cargo)}`}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          >
            {id || "—"}
          </p>
          {cargo && (
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${badgeClasses(cargo)}`}
            >
              {cargo}
            </span>
          )}
          <button
            type="button"
            onClick={copiar}
            disabled={!id}
            className="mt-4 w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-2 text-sm font-medium text-[#185FA5] transition hover:bg-[#F1EFE8] disabled:opacity-50"
          >
            {copiado ? "Copiado! ✓" : "Copiar ID"}
          </button>
        </div>

        {/* Instrução por cargo */}
        {inst && (
          <div
            className={`rounded-lg border ${inst.bg} px-4 py-3 text-sm text-[#444441] leading-relaxed`}
          >
            {inst.texto}
          </div>
        )}

        {/* Botão principal */}
        <button
          onClick={() => navigate({ to: "/candidato", search: { pessoa_id: id } })}
          className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0C447C]"
        >
          Conhecer o candidato
        </button>
      </div>
    </div>
  );
}
