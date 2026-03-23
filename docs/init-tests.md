## 🧪 Executando os testes

## 📥 Instalação das dependências

Instale as dependências do projeto

```bash
npm install
```

### 📦 Dependências para testes

Os testes utilizam variáveis de ambiente específicas e o Prisma para acesso ao banco de dados.
Para isso, são usadas as bibliotecas:

- **dotenv**: carrega variáveis de ambiente a partir de arquivos `.env`
- **dotenv-cli**: permite carregar arquivos `.env` diretamente via linha de comando

Essas dependências são usadas para garantir que os testes rodem em um **ambiente isolado** da produção.

## 🔐 Variáveis de ambiente de teste

Crie um arquivo `.env.test` na raiz do projeto

⚠️ Utilize um banco exclusivo para testes (helpdesktest) para evitar perda de dados

```
DATABASE_URL="postgres://user123:user123@localhost:5432/helpdesktest?schema=public"
JWT_SECRET="key"
```

## ⚙️ Scripts de teste

Na primeira execução dos testes rode manualmente os dois comandos abaixo para executar as migrations e gerar o cliente do prisma

```bash
npx dotenv -e .env.test -- npx prisma migrate deploy
npx dotenv -e .env.test -- npx prisma generate
```

## ▶️ Rodando os testes

Execute os testes em modo watch com o comando

```bash
npm run test:dev
```
