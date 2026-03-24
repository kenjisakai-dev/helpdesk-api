# 🚀 Helpdesk API

API REST responsável por gerenciar o fluxo de atendimento de um sistema de helpdesk. A aplicação permite autenticação de usuários, cadastro e gerenciamento de clientes, técnicos, escalas e serviços, além da abertura, acompanhamento e atualização de chamados com controle de acesso por perfil.

🔗 **API em produção (pode estar desativada)**

https://helpdesk-api-1aza.onrender.com

- Login cliente:  joao@email.com    123456
- Login Técnico: carlos@email.com   123456
- Login Técnico: ana@email.com      123456
- Login Admin:   eduardo@email.com  123456

---

## 📚 Documentação dos endpoints

Toda a documentação detalhada dos endpoints está disponível em `docs/endpoints.md`

- **📄 Usuários (/users)**
- **🔐 Sessões (/sessions)**
- **🕒 Escalas (/scales)**
- **🧰 Serviços (/services)**
- **🧑‍🔧 Técnicos (/technicals)**
- **👥 Clientes (/clients)**
- **🎫 Tickets (/tickets)**
- **🧾 Serviços do ticket (/tickets/services)**
- **🖼️ Uploads (/uploads)**

## 📚 Documentação de inicialização da API e Testes

- **init-project-dev.md** - Como iniciar a API localmente em DEV
- **init-project-dev-docker-compose.md** - Como iniciar a API localmente em DEV com o Docker
- **init-project-prd.md** - Como iniciar a API localmente em PRD
- **init-tests.md** - Como rodar os testes E2E na API

## 🧩 Importar endpoints no Insomnia

O projeto disponibiliza um arquivo com todos os endpoints da API para facilitar os testes no Insomnia

1. Abra o **Insomnia**
2. Clique em **Import**
3. Selecione o arquivo `endpoints-insomnia.yml`

## 🧱 Stacks usadas

- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (autenticação)
- Docker
- tsup (build)
