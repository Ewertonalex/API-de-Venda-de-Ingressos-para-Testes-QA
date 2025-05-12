# 🎫 API de Venda de Ingressos TicketShop

![Badge Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Badge NodeJS](https://img.shields.io/badge/NodeJS-14+-green)
![Badge Testes](https://img.shields.io/badge/testes-Cypress-04C38E)

Uma API RESTful completa para sistema de venda de ingressos, desenvolvida especialmente para que profissionais de QA possam praticar testes automatizados.

## 📋 O que você encontrará neste projeto

- Sistema completo de venda de ingressos para eventos
- Autenticação JWT
- Diferentes perfis de usuário (Admin, Organizador, Cliente)
- Documentação interativa via Swagger
- Suite de testes Cypress pronta para uso

## 🚀 Começando

Siga estas instruções para executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- npm ou yarn

### ⬇️ Instalação

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   ```

2. **Entre na pasta do projeto**
   ```bash
   cd ticket-shop-api
   ```

3. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

### ▶️ Execução

1. **Inicie o servidor**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. **Pronto!** O servidor estará rodando em:
   ```
   http://localhost:3000
   ```

3. **Acesse a documentação** no navegador:
   ```
   http://localhost:3000/api-docs
   ```

## 🔑 Como utilizar a API

### Contas padrão para testes

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@ticketshop.com | admin123 |
| Organizador | organizador@ticketshop.com | org123 |
| Cliente | cliente@ticketshop.com | cliente123 |

### Autenticação

A API utiliza tokens JWT. Para acessar recursos protegidos:

1. Faça login:
   ```
   POST /auth/login
   {
     "email": "admin@ticketshop.com",
     "senha": "admin123"
   }
   ```

2. Copie o token retornado e use-o no header:
   ```
   Authorization: Bearer seu_token_aqui
   ```

## 🧪 Testes Automatizados

O projeto já vem com uma suite completa de testes em Cypress pronta para uso!

### Estrutura de testes

Os testes estão organizados na pasta `cypress-api-tests` e incluem:
- Testes de API para usuários
- Testes de API para eventos
- Testes de API para pedidos
- Testes de API para carrinho de compras

### Como executar os testes

1. **Entre na pasta de testes**
   ```bash
   cd cypress-api-tests
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Execute todos os testes**
   ```bash
   npm run cy:run
   # ou
   yarn cy:run
   ```

4. **Ou abra o Cypress para executar testes específicos**
   ```bash
   npm run cy:open
   # ou
   yarn cy:open
   ```

## 📊 Recursos da API

### Principais entidades

- 👤 **Usuários**: Gerenciamento de contas e permissões
- 📂 **Categorias**: Classificação de eventos
- 🎭 **Eventos**: Shows, espetáculos, conferências, etc.
- 🎟️ **Tipos de Ingresso**: Diferentes modalidades (VIP, Normal, Meia-entrada)
- 🛒 **Carrinho**: Adição e remoção de itens
- 📝 **Pedidos**: Compras de ingressos
- 🏷️ **Ingressos**: Controle de acesso aos eventos

### Principais endpoints

| Recurso | Endpoint | Métodos | Descrição |
|---------|----------|---------|-----------|
| Autenticação | `/auth/login` | POST | Login de usuário |
| Autenticação | `/auth/register` | POST | Registro de novo usuário |
| Usuários | `/usuarios` | GET, POST | Listar, criar usuários |
| Usuários | `/usuarios/:id` | GET, PUT, DELETE | Obter, atualizar, excluir |
| Categorias | `/categorias` | GET, POST | Listar, criar categorias |
| Eventos | `/eventos` | GET, POST | Listar, criar eventos |
| Tipos de Ingresso | `/tipos-ingressos` | GET, POST | Listar, criar tipos |
| Carrinho | `/carrinho` | GET, DELETE | Ver e limpar carrinho |
| Carrinho | `/carrinho/adicionar` | POST | Adicionar item |
| Pedidos | `/pedidos` | GET, POST | Listar, criar pedidos |
| Ingressos | `/ingressos/:id` | GET | Obter ingresso |

## 💡 Cenários de teste sugeridos

1. **Autenticação**
   - Login com credenciais válidas e inválidas
   - Registro de novos usuários
   - Acesso a endpoints protegidos

2. **Fluxo de compra**
   - Buscar eventos disponíveis
   - Adicionar ingressos ao carrinho
   - Finalizar compra
   - Visualizar pedidos

3. **Gerenciamento**
   - Criar e atualizar eventos (como organizador)
   - Criar tipos de ingresso
   - Cancelar pedidos
   - Validar ingressos

## 🏗️ Dados da API

### Modelos principais

- **Usuário**: id, nome, email, senha, role, telefone, cpf
- **Categoria**: id, nome, descrição
- **Evento**: id, nome, descrição, local, datas, preço
- **Tipo de Ingresso**: id, nome, preço, quantidade disponível
- **Pedido**: id, código, valor total, status, forma de pagamento
- **Ingresso**: id, código, utilizado, data de utilização

## 📜 Licença

Este projeto está licenciado sob a licença MIT.

---

Desenvolvido para fins educacionais e de testes 🚀 