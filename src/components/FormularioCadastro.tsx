import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolverCargo, type Cargo } from "@/utils/cargo";
import { validarCPF, formatarCPF } from "@/utils/cpf";
import { cadastrar, obterGPS } from "@/utils/api";

type Props = { token: string };

const cargoBadge: Record<Exclude<Cargo, null>, string> = {
  "CABEÇA": "bg-[#E6F1FB] text-[#0C447C]",
  "LIDERANÇA": "bg-[#E1F5EE] text-[#0F6E56]",
  "ATIVISTA": "bg-[#FAEEDA] text-[#BA7517]",
};

const cargoDescricao: Record<Exclude<Cargo, null>, string> = {
  "CABEÇA": "Você lidera toda uma rede. Recruta Lideranças e monitora os resultados.",
  "LIDERANÇA": "Você coordena Ativistas e expande a rede de campo.",
  "ATIVISTA": "Você representa a campanha no seu bairro. Seu cartão registra cada abordagem.",
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
  const cpfPreenchido = cpf.replace(/\D/g, "").length === 11;
  const cpfValido = cpfPreenchido && validarCPF(cpf);
  const etapaAtual = !cargo ? 1 : 2;

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
    if (cargo === "CABEÇA" && !telefone.trim())
      return setErroForm("Informe o telefone com WhatsApp.");
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
    if (cargo === "CABEÇA") payload.telefone = telefone.trim();
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

  const inputBase =
    "w-full rounded-lg border border-[#D3D1C7] bg-white px-3 py-2.5 text-[15px] text-[#444441] placeholder:text-[#5F5E5A]/60 focus:outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-[#378ADD]/25 transition";

  function StepDot({ n, label }: { n: number; label: string }) {
    const ativo = n === etapaAtual;
    return (
      <div className="flex flex-1 items-center gap-2">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            ativo ? "bg-[#185FA5] text-white" : "bg-[#F1EFE8] text-[#5F5E5A]"
          }`}
        >
          {n}
        </div>
        <span
          className={`text-xs font-medium ${
            ativo ? "text-[#042C53]" : "text-[#5F5E5A]"
          }`}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Indicador de etapas */}
      <div className="flex items-center justify-between gap-2 px-1">
        <StepDot n={1} label="Código" />
        <StepDot n={2} label="Seus dados" />
        <StepDot n={3} label="Confirmação" />
      </div>

      {erroForm && (
        <div className="flex items-start gap-2 rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] px-3 py-2.5 text-sm text-[#A32D2D]">
          <span aria-hidden>⚠</span>
          <span>{erroForm}</span>
        </div>
      )}

      {/* Etapa 1 */}
      <div className="space-y-2">
        <label htmlFor="idRecrutador" className="block text-sm font-medium text-[#042C53]">
          Código do recrutador ou da campanha
        </label>
        <input
          id="idRecrutador"
          type="text"
          value={idRecrutador}
          onChange={(e) => setIdRecrutador(e.target.value.toUpperCase())}
          onBlur={handleBlurRecrutador}
          className={inputBase}
          placeholder="Ex: C12345 ou CAND-001"
        />
        {!idRecrutador && !erroRecrutador && (
          <div className="flex items-start gap-2 rounded-lg border border-[#B5D4F4] bg-[#E6F1FB] px-3 py-2.5 text-xs text-[#0C447C]">
            <span aria-hidden>ℹ</span>
            <span>
              Peça o código ao seu recrutador. Se você foi indicado diretamente
              pelo candidato, use o código da campanha.
            </span>
          </div>
        )}
        {erroRecrutador && (
          <div className="flex items-start gap-2 rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] px-3 py-2.5 text-xs text-[#A32D2D]">
            <span aria-hidden>⚠</span>
            <span>{erroRecrutador}</span>
          </div>
        )}
        {cargo && (
          <div className="space-y-1.5 pt-1">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${cargoBadge[cargo]}`}
            >
              {cargo}
            </span>
            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              {cargoDescricao[cargo]}
            </p>
          </div>
        )}
      </div>

      {/* Etapa 2 — fade-in quando cargo definido */}
      <fieldset
        disabled={camposDesabilitados}
        className={`space-y-4 transition-opacity duration-300 ${
          camposDesabilitados ? "opacity-40 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="border-t border-[#D3D1C7] pt-4">
          <h2 className="text-sm font-semibold text-[#042C53] mb-3">
            Seus dados
          </h2>

          <div className="space-y-3">
            <div>
              <label htmlFor="nome" className="block text-xs font-medium text-[#444441] mb-1">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-xs font-medium text-[#444441] mb-1">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                className={`${inputBase} ${
                  cpfPreenchido
                    ? cpfValido
                      ? "border-[#3B6D11] focus:border-[#3B6D11]"
                      : "border-[#A32D2D] focus:border-[#A32D2D]"
                    : ""
                }`}
              />
              {cpfPreenchido && !cpfValido && (
                <p className="mt-1 text-xs text-[#A32D2D]">CPF inválido.</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#444441] mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </div>

            {cargo === "CABEÇA" && (
              <div>
                <label htmlFor="telefone" className="block text-xs font-medium text-[#444441] mb-1">
                  Telefone com WhatsApp
                </label>
                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(92) 99999-9999"
                  className={inputBase}
                />
              </div>
            )}

            {cargo === "LIDERANÇA" && (
              <div>
                <label htmlFor="zona" className="block text-xs font-medium text-[#444441] mb-1">
                  Zona eleitoral
                </label>
                <input
                  id="zona"
                  type="text"
                  value={zonaEleitoral}
                  onChange={(e) => setZonaEleitoral(e.target.value)}
                  placeholder="Ex: Zona 42 — Manaus"
                  className={inputBase}
                />
              </div>
            )}

            {cargo === "ATIVISTA" && (
              <>
                <div>
                  <label htmlFor="telefone" className="block text-xs font-medium text-[#444441] mb-1">
                    Telefone com WhatsApp
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(92) 99999-9999"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label htmlFor="endereco" className="block text-xs font-medium text-[#444441] mb-1">
                    Endereço (bairro e cidade)
                  </label>
                  <input
                    id="endereco"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Bairro Flores, Manaus-AM"
                    className={inputBase}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Privacidade */}
        <div className="flex items-start gap-2 rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] px-3 py-2.5 text-xs text-[#5F5E5A]">
          <span aria-hidden>🔒</span>
          <span>
            Seus dados são protegidos pela LGPD. Usados apenas para gestão da
            campanha. Você pode solicitar exclusão a qualquer momento.
          </span>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting || camposDesabilitados}
        className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0C447C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Aguarde...
          </span>
        ) : (
          "Ativar meu cartão"
        )}
      </button>
    </form>
  );
}
