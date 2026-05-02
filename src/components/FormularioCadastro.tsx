import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolverCargo, type Cargo } from "@/utils/cargo";
import { validarCPF, formatarCPF } from "@/utils/cpf";
import { cadastrar, obterGPS } from "@/utils/api";

type Props = { token: string };

const badgeClass: Record<Exclude<Cargo, null>, string> = {
  "CABEÇA": "bg-blue-600 text-white",
  "LIDERANÇA": "bg-green-600 text-white",
  "ATIVISTA": "bg-orange-500 text-white",
};

export function FormularioCadastro({ token }: Props) {
  const navigate = useNavigate();

  const [idRecrutador, setIdRecrutador] = useState("");
  const [cargo, setCargo] = useState<Cargo>(null);
  const [erroRecrutador, setErroRecrutador] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [zonaEleitoral, setZonaEleitoral] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const camposDesabilitados = !cargo;

  function handleBlurRecrutador() {
    const { cargo: c, erro } = resolverCargo(idRecrutador.trim());
    setCargo(c);
    setErroRecrutador(erro);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroForm(null);

    if (!cargo) {
      setErroRecrutador("Informe um código de recrutador válido.");
      return;
    }
    if (!nome.trim()) return setErroForm("Informe o nome.");
    if (!validarCPF(cpf)) return setErroForm("CPF inválido.");
    if (!email.trim()) return setErroForm("Informe o e-mail.");
    if (cargo === "LIDERANÇA" && !zonaEleitoral.trim())
      return setErroForm("Informe a zona eleitoral.");
    if (cargo === "ATIVISTA" && (!telefone.trim() || !endereco.trim()))
      return setErroForm("Informe telefone e endereço.");

    setSubmitting(true);
    const gps = await obterGPS();

    const payload: Record<string, unknown> = {
      token,
      id_recrutador: idRecrutador.trim(),
      cargo_esperado: cargo,
      nome: nome.trim(),
      cpf,
      email: email.trim(),
      latitude: gps.latitude,
      longitude: gps.longitude,
      gps_ok: gps.gps_ok,
    };
    if (cargo === "LIDERANÇA") payload.zona_eleitoral = zonaEleitoral.trim();
    if (cargo === "ATIVISTA") {
      payload.telefone = telefone.trim();
      payload.endereco = endereco.trim();
    }

    try {
      const res = await cadastrar(payload);
      if ("sucesso" in res && res.sucesso) {
        navigate({
          to: "/bem-vindo",
          search: { id: res.id_gerado, cargo: res.cargo, nome: res.nome },
        });
      } else if ("erro" in res) {
        setErroForm(res.erro);
      } else {
        setErroForm("Resposta inesperada do servidor.");
      }
    } catch {
      setErroForm("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">
          Código do recrutador ou código da campanha
        </label>
        <input
          type="text"
          value={idRecrutador}
          onChange={(e) => setIdRecrutador(e.target.value.toUpperCase())}
          onBlur={handleBlurRecrutador}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: C12345 ou CAND-001"
        />
        {erroRecrutador && (
          <p className="text-sm text-red-600 mt-1">{erroRecrutador}</p>
        )}
      </div>

      {cargo && (
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeClass[cargo]}`}
          >
            Cargo detectado: {cargo}
          </span>
        </div>
      )}

      <fieldset disabled={camposDesabilitados} className="space-y-4 disabled:opacity-50">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CPF</label>
          <input
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
            className="w-full border rounded px-3 py-2"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {cargo === "LIDERANÇA" && (
          <div>
            <label className="block text-sm font-medium mb-1">Zona eleitoral</label>
            <input
              type="text"
              value={zonaEleitoral}
              onChange={(e) => setZonaEleitoral(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {cargo === "ATIVISTA" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Endereço (bairro e cidade)
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </>
        )}
      </fieldset>

      {erroForm && <p className="text-sm text-red-600">{erroForm}</p>}

      <button
        type="submit"
        disabled={submitting || camposDesabilitados}
        className="w-full bg-primary text-primary-foreground rounded px-4 py-2 font-medium disabled:opacity-50"
      >
        {submitting ? "Aguarde..." : "Cadastrar"}
      </button>
    </form>
  );
}