# 🩺 Fisio+

Aplicação para fisioterapeutas gerenciarem pacientes, fazerem avaliações por
especialidade (Pilates, Hidroterapia, RPG, Ortopédica, Neurofuncional, Esportiva),
acompanharem a evolução, gerarem relatórios em PDF e um cartão digital personalizado.

## ✨ Recursos

- 📋 Cadastro e login de fisioterapeutas (nome, CREFITO, WhatsApp, e‑mail, senha)
- 👥 Cadastro completo de pacientes
- 🧪 Avaliações por especialidade com formulários responsivos
- 📈 Registro de evolução por sessão (dor, mobilidade, notas)
- 📄 Geração de PDF de avaliação e de evolução
- 🪪 Cartão digital em PDF com foto, especialidades e contatos
- 🎨 Personalização total do tema (cores, fonte, cantos, estilo de botões)
- 🔗 Link de indicação para colegas (efeito viral)
- 👑 Painel de administrador com contagem regressiva dos 30 dias grátis
- ⏳ Período de teste de 30 dias · depois R$ 0,00/mês

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute o arquivo [`supabase/schema.sql`](./supabase/schema.sql).
3. No **Storage**, crie um bucket **público** chamado `avatars`.
4. Copie as chaves em **Project Settings → API**.

### 3. Variáveis de ambiente

Crie `.env.local` baseado em [`.env.example`](./.env.example):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Rodar
```bash
npm run dev
```

Acesse <http://localhost:3000>.

### 5. Virar administrador

Após criar sua conta, abra o SQL Editor do Supabase e rode:

```sql
update profiles set role = 'admin' where email = 'seu@email.com';
```

Pronto — o item **Admin** aparecerá no menu lateral.

## 🧱 Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** com variáveis de tema dinâmicas
- **Supabase** (Auth + Postgres + Storage + RLS)
- **jsPDF** para PDFs (avaliação, evolução e cartão digital)
- **lucide-react** para ícones

## 📂 Estrutura

```
app/
  (auth)/         → login & cadastro
  (app)/          → área autenticada (dashboard, pacientes, perfil, etc.)
  page.tsx        → landing page
components/       → UI reutilizável (sidebar, banners, formulários)
lib/
  supabase/       → clientes server e browser
  specialties.ts  → definição das especialidades e campos
  pdf.ts          → geradores de PDF
  theme.ts        → escala de cor e CSS variables
supabase/schema.sql → script de criação do banco + RLS
```
