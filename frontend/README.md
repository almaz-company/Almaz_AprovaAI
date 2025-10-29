This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Auth Setup

Create a `.env.local` in `frontend/` using `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

The login (`app/(auth)/login/page.tsx`) and cadastro (`app/(auth)/cadastro/page.tsx`) pages are wired to Supabase via the client in `lib/supabase/client.ts` and the provider in `lib/auth-context.tsx`.

### Proteção de Rotas (Server + Client)
- Client: `lib/route-guard.tsx` aplicado via `app/providers.tsx`.
- Server (Middleware): `middleware.ts` protege rotas privadas e redireciona para `/login?redirect=...` quando necessário.
- Ajuste os domínios permitidos no Supabase (Authentication > URL Config) para incluir seu host, ex.: `http://localhost:3000`.

## Upload de Arquivos

- Bucket: configure um bucket de Storage chamado `uploads` no Supabase (Storage > New bucket). Recomendo mantê-lo privado.
- Variáveis: defina `NEXT_PUBLIC_SUPABASE_BUCKET=uploads` em `.env.local`.
- Frontend:
  - Página: `app/upload/page.tsx` agora tem upload via `FileUploadZone`.
  - Helper: `lib/storage.ts` (`uploadToStorage`, `saveFileMetadata`).
  - Pré-visualização: gera Signed URL 1h para buckets privados.
- Banco e Regras:
  - SQL em `supabase/schema.sql` cria tabela `public.files` (metadados) e RLS.
  - Inclui policies para `storage.objects` restringindo acesso ao bucket `uploads` por usuário.

Para aplicar o SQL: cole o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase ou rode via Supabase CLI.

## Clientes

- Tabela: `public.clients` (RLS por usuário, slug único por usuário)
  - Campos: `company_name`, `contact_name`, `email`, `phone`, `address`, `industry`, `status`, `contract_start`, `contract_end`, `services[]`, `notes`, `logo_url`, `slug`.
- Frontend:
  - Lista/estatísticas: `app/clientes/page.tsx`
  - Formulário: `src/presentation/modules/Clientes/components/ClientForm.tsx`
  - Tabela: `src/presentation/modules/Clientes/components/ClientTable.tsx`
  - API de cliente (Supabase): `lib/clients.ts`
- Slug: verificação de disponibilidade em tempo real via Supabase.
