# 🚀 Como rodar o projeto com o Docker

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado

- Node.js (versão LTS recomendada)
- npm (já vem instalado com o Node.js)
- Prisma CLI (opcional, pode usar via npx)
- Docker Desktop

## 📥 Instalação das dependências

Instale as dependências do projeto

```bash
npm install
```

## 🔐 Configuração do ambiente

Ajuste o arquivo `.env` na raiz do projeto para conseguir gerar as tabelas

```
DATABASE_URL="postgres://user123:user123@localhost:5432/helpdesk?schema=public"
JWT_SECRET="key"
PORT=3333
```

Ajuste também o `docker-compose.yml` para a API se conectar ao banco dentro da rede Docker

```
DATABASE_URL: postgres://user123:user123@postgres:5432/helpdesk?schema=public
JWT_SECRET: key
PORT: 3333
```

## 🐳 Gerar banco PostgreSQL e a API com Docker

Rode o comando para gerar container do banco de dados e a API

```bash
docker-compose up -d
```

## 🗄️ Banco de dados (Prisma)

Gere as tabelas no banco de dados usando as migrations

```bash
npx prisma migrate deploy
```

```bash
npx prisma generate
```

Podemos gerar os dados seed no banco executando o comando

```bash
npx prisma db seed
```

## ▶️ Executando o projeto

✅ Pronto!

A aplicação estará rodando em http://localhost:3333
