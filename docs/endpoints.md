# 📚 Documentação da API

## 🔐 Autenticação global

Após autenticar em `/sessions`, todas as rotas abaixo exigem:

Authorization: Bearer `<token>`

Além do token, o usuário precisa estar ativo.

---

## 👤 Usuários

### ➕ POST /users - Endpoint responsável por criar usuários

O usuário é criado com role padrão `client`.

O usuário não precisa estar autenticado.

Body

- `name`: string, mínimo de 1 caractere
- `email`: e-mail válido
- `password`: string, mínimo de 6 caracteres

Respostas

- 201 Created – usuário criado com sucesso
- 400 Bad Request – dados inválidos ou e-mail já cadastrado

---

### 🔍 GET /users - Endpoint responsável por obter o usuário autenticado

Respostas

- 200 OK – dados do usuário autenticado (sem senha)
- 401 Unauthorized – token ausente ou inválido
- 404 Not Found – usuário não encontrado

---

### ✏️ PATCH /users - Endpoint responsável por atualizar o usuário autenticado

Body

- `name`: string (opcional)
- `email`: e-mail válido (opcional)

Respostas

- 200 OK – usuário atualizado com sucesso
- 400 Bad Request – dados inválidos ou e-mail já existente
- 401 Unauthorized – token ausente ou inválido
- 404 Not Found – usuário não encontrado

---

### 🔒 PATCH /users/changePassword - Endpoint responsável por alterar senha do usuário autenticado

Body

- `currentPassword`: string
- `newPassword`: string, mínimo de 6 caracteres

Respostas

- 200 OK – senha alterada com sucesso
- 400 Bad Request – senha atual incorreta ou dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 404 Not Found – usuário não encontrado

---

### ❌ DELETE /users - Endpoint responsável por desativar o usuário autenticado

Respostas

- 200 OK – usuário desativado com sucesso
- 401 Unauthorized – token ausente ou inválido
- 404 Not Found – usuário não encontrado

---

## 🔐 Sessões

### ➕ POST /sessions - Endpoint responsável por autenticar o usuário

Body

- `email`: string
- `password`: string

Respostas

200 OK – autenticação realizada com sucesso

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client"
  }
}
```

401 Unauthorized – e-mail e/ou senha inválidos

---

## 🕒 Escalas

🔐 **Acesso restrito a usuários com role** `admin`

### 📄 GET /scales - Endpoint responsável por listar escalas

Respostas

- 200 OK – lista de escalas
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão

---

## 🧰 Serviços

### 📄 GET /services - Endpoint responsável por listar serviços

Query Params (opcional)

- `page`: number
- `limit`: number
- `status`: `true` | `false`

Respostas

- 200 OK – lista de serviços paginada
- 400 Bad Request – query inválida
- 401 Unauthorized – token ausente ou inválido

---

🔐 **Rotas abaixo restritas a usuários com role** `admin`

### ➕ POST /services - Endpoint responsável por criar serviço

Body

- `name`: string
- `amount`: number maior que 0

Respostas

- 201 Created – serviço criado com sucesso
- 400 Bad Request – serviço já existente ou dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão

---

### 🔍 GET /services/:id - Endpoint responsável por obter serviço por id

Parâmetros de rota

- `id`: identificador do serviço

Respostas

- 200 OK – serviço encontrado
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – serviço não encontrado

---

### ✏️ PATCH /services - Endpoint responsável por atualizar serviço

Body

- `id`: identificador do serviço
- `name`: string (opcional)
- `amount`: number > 0 (opcional)
- `status`: boolean (opcional)

Respostas

- 200 OK – serviço atualizado com sucesso
- 400 Bad Request – dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – serviço não encontrado

---

## 🧑‍🔧 Técnicos

🔐 **Acesso para `admin` e `technical` em GET /technicals/:id**

Observação:

- usuário `technical` só pode consultar o próprio id

### 🔍 GET /technicals/:id - Endpoint responsável por obter técnico por id

Parâmetros de rota

- `id`: identificador do técnico

Respostas

- 200 OK – técnico encontrado
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – técnico não encontrado

---

🔐 **Rotas abaixo restritas a usuários com role** `admin`

### ➕ POST /technicals - Endpoint responsável por criar técnico

Body

- `name`: string
- `email`: e-mail válido
- `password`: string, mínimo de 6 caracteres
- `scales_id`: array de ids de escala

Respostas

- 201 Created – técnico criado com sucesso
- 400 Bad Request – dados inválidos ou e-mail já cadastrado
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão

---

### ✏️ PATCH /technicals - Endpoint responsável por atualizar técnico

Body

- `user_id`: identificador do técnico
- `name`: string (opcional)
- `email`: e-mail válido (opcional)
- `scales_id`: array de ids de escala

Respostas

- 200 OK – técnico atualizado com sucesso
- 400 Bad Request – dados inválidos ou e-mail já cadastrado
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – usuário não encontrado

---

### 📄 GET /technicals - Endpoint responsável por listar técnicos

Query Params (opcional)

- `page`: number
- `limit`: number

Respostas

- 200 OK – lista de técnicos paginada
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão

---

## 👥 Clientes

🔐 **Acesso restrito a usuários com role** `admin`

### 📄 GET /clients - Endpoint responsável por listar clientes

Query Params (opcional)

- `page`: number
- `limit`: number

Respostas

- 200 OK – lista de clientes paginada
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão

---

### 🔍 GET /clients/:id - Endpoint responsável por obter cliente por id

Parâmetros de rota

- `id`: identificador do cliente

Respostas

- 200 OK – cliente encontrado
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – cliente não encontrado

---

### ✏️ PATCH /clients - Endpoint responsável por atualizar cliente

Body

- `user_id`: identificador do cliente
- `name`: string (opcional)
- `email`: e-mail válido (opcional)

Respostas

- 200 OK – cliente atualizado com sucesso
- 400 Bad Request – dados inválidos ou e-mail já existente
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – cliente não encontrado

---

### ❌ DELETE /clients/:id - Endpoint responsável por desativar cliente

Parâmetros de rota

- `id`: identificador do cliente

Respostas

- 200 OK – cliente desativado com sucesso
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – cliente não encontrado

---

## 🎫 Tickets

### ➕ POST /tickets - Endpoint responsável por criar ticket

🔐 **Acesso restrito a usuários com role** `client`

Body

- `title`: string
- `description`: string, mínimo de 10 caracteres
- `service_id`: identificador do serviço base

Respostas

- 201 Created – ticket criado com sucesso
- 400 Bad Request – dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – serviço não encontrado

---

### 📄 GET /tickets - Endpoint responsável por listar tickets

Regras de visibilidade:

- `admin`: vê todos
- `technical`: vê tickets atribuídos a ele
- `client`: vê tickets que ele abriu

Query Params (opcional)

- `page`: number
- `limit`: number

Respostas

- 200 OK – lista de tickets paginada
- 400 Bad Request – query inválida
- 401 Unauthorized – token ausente ou inválido

---

### 🔍 GET /tickets/:id - Endpoint responsável por obter ticket por id

Parâmetros de rota

- `id`: identificador do ticket

Respostas

- 200 OK – ticket encontrado
- 400 Bad Request – id inválido
- 401 Unauthorized – token ausente ou inválido

---

### ✏️ PATCH /tickets - Endpoint responsável por atualizar status do ticket

🔐 **Acesso restrito a usuários com role** `technical` ou `admin`

Body

- `ticket_id`: identificador do ticket
- `status`: `opened` | `in_progress` | `closed`

Respostas

- 200 OK – ticket atualizado com sucesso
- 400 Bad Request – dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – ticket não encontrado

---

## 🧾 Serviços do Ticket

🔐 **Acesso restrito a usuários com role** `technical`

### ➕ POST /tickets/services - Endpoint responsável por adicionar serviço em ticket

Body

- `ticket_id`: identificador do ticket
- `service_id`: identificador do serviço

Regras

- não permite adicionar serviço em ticket fechado

Respostas

- 201 Created – serviço adicionado com sucesso
- 400 Bad Request – ticket fechado ou dados inválidos
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – ticket ou serviço não encontrado

---

### ❌ DELETE /tickets/:ticket_id/services/:ticket_service_id - Endpoint responsável por remover serviço do ticket

Parâmetros de rota

- `ticket_id`: identificador do ticket
- `ticket_service_id`: identificador do vínculo ticket/serviço

Regras

- não permite remover serviço base do ticket
- não permite remover serviço de ticket fechado

Respostas

- 200 OK – serviço removido com sucesso
- 400 Bad Request – ticket fechado ou tentativa de remover serviço base
- 401 Unauthorized – token ausente ou inválido
- 403 Forbidden – usuário sem permissão
- 404 Not Found – ticket ou serviço do ticket não encontrado

---

## 🖼️ Uploads

### ➕ POST /uploads - Endpoint responsável por enviar avatar e atribuir ao usuário autenticado

Body multipart/form-data

- `profile`: arquivo de imagem (`jpeg`, `jpg`, `png`)

Respostas

- 201 Created – upload realizado com sucesso
- 400 Bad Request – formato inválido ou arquivo acima do limite
- 401 Unauthorized – token ausente ou inválido

---

### ❌ DELETE /uploads - Endpoint responsável por remover avatar do usuário autenticado

Respostas

- 200 OK – avatar removido com sucesso
- 401 Unauthorized – token ausente ou inválido
