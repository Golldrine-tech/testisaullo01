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

function BemVindoPage() {
  const { id, cargo, nome } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-md mx-auto mt-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Cadastro realizado com sucesso!</h1>
        {nome && <p className="text-lg">{nome}</p>}
        {cargo && (
          <p className="text-sm text-muted-foreground">Cargo: {cargo}</p>
        )}
        {id && (
          <div className="my-6">
            <p className="text-sm text-muted-foreground mb-1">Seu ID:</p>
            <p className="text-3xl font-bold tracking-wider">{id}</p>
          </div>
        )}
        <p className="text-sm">
          Guarde seu ID — você vai precisar dele para recrutar membros da sua
          equipe.
        </p>
        <button
          onClick={() => navigate({ to: "/candidato", search: { ref: id } })}
          className="mt-6 bg-primary text-primary-foreground rounded px-4 py-2 font-medium"
        >
          Ver a página do candidato
        </button>
      </div>
    </div>
  );
}