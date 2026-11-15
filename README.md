# JC Pneus · Gestão

Aplicação pública para acompanhar veículos na oficina, registrar checklist técnico e fotos, e emitir a ficha em PDF.

## Rodar localmente

Requisitos: Node.js 22 e PostgreSQL.

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env` e configure `DATABASE_URL` com o endereço do PostgreSQL.
3. Execute o SQL de `db/production-schema.sql` no banco vazio. Se o banco já tem as tabelas principais, confira a estrutura e aplique apenas as tabelas/índices que faltarem.
4. Inicie com `npm run dev` e abra `http://localhost:3000`.

Fotos locais de desenvolvimento ficam em `public/uploads`. Elas não são incluídas no repositório.

## Publicar na Netlify

O projeto usa Next.js App Router, Server Actions, PostgreSQL e Netlify Blobs para persistir as fotos. A Netlify detecta e configura o adaptador Next.js automaticamente; não defina uma pasta `publish` manual nem instale outro adaptador.

1. Envie este repositório para um Git remoto e importe-o na Netlify. Use a integração com Git para que SSR e Server Actions funcionem; este projeto não é um site estático para publicar apenas arrastando uma pasta pronta.
2. No projeto Netlify, configure a variável de ambiente no escopo **Functions**:
   - `DATABASE_URL`: conexão PostgreSQL acessível externamente, com SSL conforme exigido pelo provedor. Se criar uma Netlify Database em **Data & Storage → Database**, `NETLIFY_DB_URL` é disponibilizada pela plataforma. A disponibilidade pode depender do plano.
3. Para o Netlify Database, a migração em `netlify/database/migrations` cria as tabelas na ramificação de produção automaticamente durante o deploy. Para um PostgreSQL externo, execute `db/production-schema.sql` no banco antes do primeiro acesso.
4. Faça o deploy. A primeira gravação de foto cria/usa o armazenamento Netlify Blobs `vehicle-photos`.

Configuração de build: `npm run build`, Node 22 (em `netlify.toml` e `.nvmrc`). O banco é inicializado somente quando uma página ou ação consulta dados, portanto sua URL não é necessária durante a compilação, mas é obrigatória em **Functions** para o site operar. O arquivo `.env` é apenas local e não deve ser enviado ao Git; a Netlify não importa automaticamente as variáveis de um arquivo `.env` do repositório.

## Observações de operação

- O site é público e não possui login. Qualquer pessoa com o endereço pode visualizar, cadastrar, editar e excluir veículos e fotos.
- Use um banco hospedado, com backup habilitado. A conexão local `localhost` funciona apenas na máquina de desenvolvimento.
- O SQL cria as tabelas e status iniciais, mas não copia os registros e as fotos que já existam no banco local. Faça uma migração de dados separada se precisar manter esses veículos no site publicado.
- Arquivos antigos referenciados como `/uploads/...` precisam estar presentes em `public/uploads`. Novas fotos na Netlify usam Blobs e URLs `/media/...`.
- Limite de foto: 2 MB após a conversão para WebP.

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run build
```
