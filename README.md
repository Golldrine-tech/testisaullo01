# vota.am — Plataforma de Engajamento Político NFC

Sistema de identidade digital para campanhas políticas via NFC. Ao tocar o cartão no celular, o eleitor é redirecionado para ativar sua identidade e engajar com a campanha.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

---

## Rodando localmente

O projeto tem **dois servidores**: o frontend (Vite) e o backend mock (Express).  
Cada um precisa rodar em um terminal separado.

### 1. Clone o repositório

```bash
git clone https://github.com/Golldrine-tech/vota-link.git
cd vota-link
```

### 2. Configure as variáveis de ambiente

**Frontend** — crie `.env` na raiz do projeto:

```env
VITE_N8N_URL=http://localhost:3001
```

**Backend** — crie `backend/.env`:

```env
DB_HOST=db.odsjgnxxjddgmqbmgrqi.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<sua_senha>
CODIGO_CANDIDATO=CAND-AMAZONIA-2026
CORS_ORIGIN=http://localhost:8080
MOCK_PORT=3001
```

> **Atenção:** nunca commite os arquivos `.env`. Eles já estão no `.gitignore`.

### 3. Instale as dependências

```bash
# Frontend
npm install

# Backend
npm install --prefix backend
```

### 4. Inicie o backend (Terminal 1)

```bash
node --watch backend/mock-server.js
```

Servidor disponível em: `http://localhost:3001`

Endpoints disponíveis:
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/webhook/verificar-token/:token` | Valida token NFC |
| POST | `/webhook/cadastrar` | Registra novo membro |
| POST | `/webhook/evento` | Registra evento de engajamento |
| DELETE | `/webhook/minha-conta` | Exclusão de dados (LGPD) |
| GET | `/debug/pessoas` | Lista todos os cadastros |
| GET | `/debug/eventos` | Lista todos os eventos |
| GET | `/debug/hierarquia/:cabeca_id` | Hierarquia de uma CABEÇA |

### 5. Inicie o frontend (Terminal 2)

```bash
npm run dev
```

Frontend disponível em: **http://localhost:8080**

---

## Telas do sistema

| URL | Descrição |
|-----|-----------|
| `/` | Hub de desenvolvimento — links para todas as telas |
| `/ativar/00001` | Ativação do cartão NFC (token `00001` está no seed) |
| `/bem-vindo` | Tela de sucesso pós-cadastro |
| `/candidato` | Landing page do candidato com compartilhamento |

> Para testar o fluxo completo, acesse `/ativar/00001` (tokens de `00001` a `00100` estão no banco de dados de teste).

---

## Estrutura do projeto

```
vota-link/
├── src/
│   ├── routes/
│   │   ├── index.tsx          # Hub de dev
│   │   ├── ativar.$token.tsx  # Ativação NFC
│   │   ├── bem-vindo.tsx      # Sucesso
│   │   └── candidato.tsx      # Landing page
│   ├── components/
│   │   └── FormularioCadastro.tsx  # Formulário multi-step
│   └── utils/
│       ├── api.ts    # Chamadas HTTP (substituir por n8n em produção)
│       ├── cargo.ts  # Resolução de cargo pelo código do recrutador
│       └── cpf.ts    # Validação e formatação de CPF
├── backend/
│   ├── mock-server.js  # Servidor Express local (simula n8n)
│   ├── schema.sql      # DDL do banco PostgreSQL
│   └── seed.sql        # 100 tokens de teste (00001–00100)
└── README.md
```

---

## Banco de dados (Supabase)

O schema já está aplicado em produção. Para aplicar em um novo banco:

```bash
# Aplicar schema
psql -h <host> -U postgres -d postgres -f backend/schema.sql

# Inserir tokens de teste
psql -h <host> -U postgres -d postgres -f backend/seed.sql
```

---

## Cargos e hierarquia

| Código | Cargo | Dados coletados |
|--------|-------|-----------------|
| `CAND-*` | CABEÇA | Nome, CPF, e-mail, telefone |
| `C*` | LIDERANÇA | Nome, CPF, e-mail, zona eleitoral |
| `L*` | ATIVISTA | Nome, CPF, e-mail, telefone, endereço |
