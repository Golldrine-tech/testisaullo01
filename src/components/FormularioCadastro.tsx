import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolverCargo, type Cargo } from "@/utils/cargo";
import { validarCPF, formatarCPF } from "@/utils/cpf";
import { cadastrar, obterGPS } from "@/utils/api";

type Props = { token: string };

const inputBase =
  "w-full rounded-xl border border-[#D3D1C7] bg-white px-4 py-3.5 text-[15px] text-[#042C53] placeholder:text-[#5F5E5A]/50 shadow-[0_1px_2px_rgba(4,44,83,0.04)] transition-all duration-150 focus:outline-none focus:border-[#185FA5] focus:ring-4 focus:ring-[#378ADD]/15 hover:border-[#5F5E5A]/40";

function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5E5A]"
      >
        {label}
      </label>
      {children}
      {hint}
    </div>
  );
}

function Stepper({ etapaAtual }: { etapaAtual: number }) {
  const steps = [
    { n: 1, label: "Código" },
    { n: 2, label: "Seus dados" },
    { n: 3, label: "Confirmação" },
  ];
  return (
    <div className="relative">
      <div className="absolute left-4 right-4 top-4 h-[2px] bg-[#E5E2D8]">
        <div
          className="h-full bg-gradient-to-r from-[#185FA5] to-[#378ADD] transition-all duration-500"
          style={{ width: `${((etapaAtual - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <ol className="relative flex items-start justify-between">
        {steps.map((s) => {
          const concluida = s.n < etapaAtual;
          const ativa = s.n === etapaAtual;
          return (
            <li key={s.n} className="flex flex-col items-center gap-2">
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  concluida
                    ? "bg-[#0F6E56] text-white shadow-[0_4px_12px_rgba(15,110,86,0.35)]"
                    : ativa
                      ? "bg-gradient-to-br from-[#185FA5] to-[#378ADD] text-white shadow-[0_4px_14px_rgba(24,95,165,0.45)] ring-4 ring-[#378ADD]/20"
                      : "bg-white text-[#5F5E5A] ring-1 ring-[#D3D1C7]"
                }`}
              >
                {concluida ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  s.n
                )}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  ativa || concluida ? "text-[#042C53]" : "text-[#5F5E5A]"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const cargoTheme: Record<
  Exclude<Cargo, null>,
  { badge: string; ring: string; icon: string; descricao: string }
> = {
  "CABEÇA": {
    badge: "bg-[#E6F1FB] text-[#0C447C] ring-1 ring-[#B5D4F4]",
    ring: "ring-[#185FA5]/30",
    icon: "👑",
    descricao:
      "Você lidera toda uma rede. Recruta Lideranças e monitora os resultados.",
  },
  "LIDERANÇA": {
    badge: "bg-[#E1F5EE] text-[#0F6E56] ring-1 ring-[#A8DFCB]",
    ring: "ring-[#0F6E56]/30",
    icon: "🛡️",
    descricao:
      "Você coordena Ativistas e expande a rede de campo.",
  },
  "ATIVISTA": {
    badge: "bg-[#FAEEDA] text-[#BA7517] ring-1 ring-[#FAC775]",
    ring: "ring-[#BA7517]/30",
    icon: "⚡",
    descricao:
      "Você representa a campanha no seu bairro. Seu cartão registra cada abordagem.",
  },
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
  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfPreenchido = cpfDigits.length === 11;
  const cpfValido = cpfPreenchido && validarCPF(cpf);
  const etapaAtual = !cargo ? 1 : 2;

  function handleBlurRecrutador() {
    const { cargo: c, erro } = resolverCargo(idRecrutador.trim());
    setCargo(c);
    setErroRecrutador(erro);
  }

  function handleChangeRecrutador(valor: string) {
    const v = valor.toUpperCase();
    setIdRecrutador(v);
    const { cargo: c, erro } = resolverCargo(v.trim());
    setCargo(c);
    if (v.trim().length > 0) setErroRecrutador(erro);
    else setErroRecrutador(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroForm(null);

    // Re-resolve caso o blur não tenha disparado
    const { cargo: cargoAtual, erro: erroAtual } = resolverCargo(idRecrutador.trim());
    if (!cargo && cargoAtual) {
      setCargo(cargoAtual);
      setErroRecrutador(null);
    }
    const cargoFinal = cargo ?? cargoAtual;

    if (!cargoFinal) {
      setErroRecrutador(erroAtual ?? "Informe um código de recrutador válido.");
      return;
    }
    if (!nome.trim()) return setErroForm("Informe o nome.");
    if (!validarCPF(cpf)) return setErroForm("CPF inválido.");
    if (!email.trim()) return setErroForm("Informe o e-mail.");
    if (cargoFinal === "CABEÇA" && !telefone.trim())
      return setErroForm("Informe o telefone com WhatsApp.");
    if (cargoFinal === "LIDERANÇA" && !zonaEleitoral.trim())
      return setErroForm("Informe a zona eleitoral.");
    if (cargoFinal === "ATIVISTA" && (!telefone.trim() || !endereco.trim()))
      return setErroForm("Informe telefone e endereço.");

    setSubmitting(true);
    const gps = await obterGPS();

    if (!gps.gps_ok) {
      setSubmitting(false);
      return setErroForm(
        "Localização obrigatória para contratação. Permita o acesso à sua localização nas configurações do navegador e tente novamente.",
      );
    }

    const payload: Record<string, unknown> = {
      token,
      id_recrutador: idRecrutador.trim(),
      nome: nome.trim(),
      cpf,
      email: email.trim(),
      latitude: gps.latitude,
      longitude: gps.longitude,
      gps_ok: gps.gps_ok,
    };
    if (cargoFinal === "CABEÇA") payload.telefone = telefone.trim();
    if (cargoFinal === "LIDERANÇA") payload.zona_eleitoral = zonaEleitoral.trim();
    if (cargoFinal === "ATIVISTA") {
      payload.telefone = telefone.trim();
      payload.endereco = endereco.trim();
    }

    try {
      const res = await cadastrar(payload);
      if ("sucesso" in res && res.sucesso) {
        navigate({
          to: "/bem-vindo",
          search: { id: res.id_gerado, cargo: res.cargo },
          state: { nome: res.nome },
        });
      } else if ("erro" in res) {
        setErroForm(res.erro);
      } else {
        setErroForm(`Resposta do servidor: ${JSON.stringify(res)}`);
      }
    } catch {
      setErroForm("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <Stepper etapaAtual={etapaAtual} />

      {erroForm && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-[#F7C1C1] bg-[#FCEBEB] px-4 py-3.5 text-sm text-[#A32D2D] shadow-[0_2px_8px_rgba(163,45,45,0.08)]"
        >
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#A32D2D] text-[11px] font-bold text-white">!</span>
          <span className="font-medium leading-relaxed">{erroForm}</span>
        </div>
      )}

      {/* ETAPA 1 — Código do recrutador */}
      <section className="space-y-3">
        <Field id="idRecrutador" label="Código do recrutador ou da campanha">
          <input
            id="idRecrutador"
            type="text"
            value={idRecrutador}
            onChange={(e) => handleChangeRecrutador(e.target.value)}
            onBlur={handleBlurRecrutador}
            maxLength={idRecrutador.toUpperCase().startsWith("CAND-") ? 20 : 6}
            className={`${inputBase} font-mono tracking-wider`}
            placeholder="Ex: C12345 ou CAND-001"
          />
        </Field>

        {!idRecrutador && !erroRecrutador && (
          <div className="flex items-start gap-3 rounded-xl border border-[#B5D4F4] bg-gradient-to-br from-[#E6F1FB] to-[#F4F9FE] px-4 py-3 text-xs leading-relaxed text-[#0C447C]">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#185FA5] text-[11px] font-bold text-white">i</span>
            <span>
              Peça o código ao seu recrutador. Se você foi indicado diretamente
              pelo candidato, use o código da campanha.
            </span>
          </div>
        )}

        {erroRecrutador && (
          <div className="flex items-start gap-3 rounded-xl border border-[#F7C1C1] bg-[#FCEBEB] px-4 py-3 text-xs leading-relaxed text-[#A32D2D]">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#A32D2D] text-[11px] font-bold text-white">!</span>
            <span className="font-medium">{erroRecrutador}</span>
          </div>
        )}

        {cargo && (
          <div
            className={`relative overflow-hidden rounded-2xl border border-[#D3D1C7]/70 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(4,44,83,0.18)] ring-1 ${cargoTheme[cargo].ring} animate-[fadeSlide_.35s_ease-out]`}
          >
            <div
              aria-hidden
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#378ADD]/15 to-transparent blur-2xl"
            />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#E6F1FB] to-white text-2xl ring-1 ring-[#D3D1C7]/60">
                {cargoTheme[cargo].icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5F5E5A]">
                  Cargo detectado
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${cargoTheme[cargo].badge}`}
                  >
                    {cargo}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-[#444441]">
                  {cargoTheme[cargo].descricao}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ETAPA 2 — Dados pessoais */}
      <fieldset
        disabled={camposDesabilitados}
        className={`space-y-5 transition-all duration-500 ${
          camposDesabilitados
            ? "pointer-events-none opacity-30 blur-[1px]"
            : "opacity-100 blur-0"
        }`}
      >
        <div className="flex items-center gap-3 border-t border-dashed border-[#D3D1C7] pt-5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#042C53] text-[10px] font-bold text-white">2</span>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#042C53]">
            Seus dados
          </h2>
        </div>

        <Field id="nome" label="Nome completo">
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputBase}
            placeholder="Como consta no seu documento"
          />
        </Field>

        <Field
          id="cpf"
          label="CPF"
          hint={
            cpfPreenchido && !cpfValido ? (
              <p className="mt-1.5 text-xs font-medium text-[#A32D2D]">
                CPF inválido. Verifique os dígitos.
              </p>
            ) : cpfValido ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[#0F6E56]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                CPF válido
              </p>
            ) : null
          }
        >
          <div className="relative">
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
              placeholder="000.000.000-00"
              className={`${inputBase} font-mono tracking-wider ${
                cpfPreenchido
                  ? cpfValido
                    ? "border-[#0F6E56] focus:border-[#0F6E56] focus:ring-[#0F6E56]/15"
                    : "border-[#A32D2D] focus:border-[#A32D2D] focus:ring-[#A32D2D]/15"
                  : ""
              }`}
            />
            {cpfValido && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0F6E56]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
            )}
          </div>
        </Field>

        <Field id="email" label="E-mail">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputBase}
          />
        </Field>

        {cargo === "CABEÇA" && (
          <Field id="telefone" label="Telefone com WhatsApp">
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(92) 99999-9999"
              className={inputBase}
            />
          </Field>
        )}

        {cargo === "LIDERANÇA" && (
          <Field id="zona" label="Zona eleitoral">
            <input
              id="zona"
              type="text"
              value={zonaEleitoral}
              onChange={(e) => setZonaEleitoral(e.target.value)}
              placeholder="Ex: Zona 42 — Manaus"
              className={inputBase}
            />
          </Field>
        )}

        {cargo === "ATIVISTA" && (
          <>
            <Field id="telefone" label="Telefone com WhatsApp">
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(92) 99999-9999"
                className={inputBase}
              />
            </Field>
            <Field id="endereco" label="Endereço (bairro e cidade)">
              <input
                id="endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Bairro Flores, Manaus-AM"
                className={inputBase}
              />
            </Field>
          </>
        )}

        {/* Privacidade */}
        <div className="flex items-start gap-3 rounded-xl border border-[#D3D1C7] bg-gradient-to-br from-[#F7F5EE] to-[#F1EFE8] px-4 py-3.5">
          <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white text-[#0F6E56] ring-1 ring-[#D3D1C7]/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </span>
          <p className="text-[12px] leading-relaxed text-[#5F5E5A]">
            <span className="font-semibold text-[#042C53]">Dados protegidos pela LGPD.</span>{" "}
            Usados apenas para gestão da campanha. Você pode solicitar exclusão a qualquer momento.
          </p>
        </div>
      </fieldset>

      {/* CTA */}
      <button
        type="submit"
        disabled={submitting || camposDesabilitados}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#185FA5] via-[#2273C2] to-[#378ADD] px-5 py-4 text-[15px] font-bold text-white shadow-[0_10px_28px_-8px_rgba(24,95,165,0.55)] ring-1 ring-[#185FA5]/40 transition-all duration-200 hover:shadow-[0_14px_32px_-8px_rgba(24,95,165,0.75)] hover:brightness-110 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-50"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2.5">
            <span className="h-4 w-4 animate-spin rounded-full border-[2px] border-white/30 border-t-white" />
            <span className="tracking-wide">Ativando seu cartão...</span>
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2 tracking-wide">
            Ativar meu cartão
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
