import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">vota.am</h1>
        <p className="text-muted-foreground">
          Sistema de engajamento político por NFC. Toque seu cartão para
          começar — ou acesse <code>/ativar/SEU-TOKEN</code>.
        </p>
      </div>
    </div>
  );
}
