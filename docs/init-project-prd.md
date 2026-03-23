# 🚀 Como rodar o projeto em modo produção localmente

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado

- Node.js (versão LTS recomendada)
- npm (já vem instalado com o Node.js)
- PostgreSQL
- Prisma CLI (opcional, pode usar via npx)
- Docker Desktop

## 🐳 Gerar banco PostgreSQL com Docker

Rode o comando para gerar o banco de dados usando uma imagem pronta da bitnami

```bash
docker run -d --name db-postgres -e POSTGRESQL_USERNAME=user123 -e POSTGRESQL_PASSWORD=user123 -e POSTGRESQL_DATABASE=helpdesk -p 5432:5432 bitnami/postgresql:latest
```

## 🔐 Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo

```
DATABASE_URL="postgres://user123:user123@localhost:5432/helpdesk?schema=public"
JWT_SECRET="key"
PORT=3333
```

## 📥 Instalação das dependências

Instale as dependências do projeto

```bash
npm install
```

## 🗄️ Banco de dados (Prisma)

Gere as tabelas e o client do Prisma

```bash
npx prisma migrate deploy
```

```bash
npx prisma generate
```

## 🛠️ Compilação do projeto (TypeScript → JavaScript)

O projeto utiliza **tsup** para compilar o código TypeScript para JavaScript

Execute o comando para gerar o código de produção

```bash
npm run build
```

## ▶️ Executando o projeto

Para iniciar a aplicação em modo de produção

```bash
npm run start
```

✅ Pronto!

A aplicação estará rodando em http://localhost:3333
