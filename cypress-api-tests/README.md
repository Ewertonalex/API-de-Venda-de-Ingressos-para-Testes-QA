# Testes de API com Cypress

Este projeto contém testes automatizados para a API de Vendas de Ingressos usando Cypress.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)
- API de Vendas de Ingressos rodando em http://localhost:3000

## Instalação

1. Clone este repositório (ou baixe os arquivos)
2. Na pasta do projeto, execute o comando:

```bash
npm install
```

## Configuração

O arquivo `cypress.config.js` contém as configurações principais do Cypress, incluindo a URL base da API (localhost:3000).

## Estrutura dos Testes

Os testes estão organizados por entidade da API:

- `users.cy.js` - Testes de usuários (GET, POST, PUT, DELETE)
- `events.cy.js` - Testes de eventos (GET, POST, PUT, DELETE)
- `orders.cy.js` - Testes de pedidos (GET, POST, PUT, DELETE)
- `cart.cy.js` - Testes de carrinho de compras (GET, POST, PUT, DELETE)

## Execução dos Testes

### Interface Visual do Cypress

Para abrir a interface gráfica do Cypress:

```bash
npm run cy:open
```

### Linha de Comando

Para executar todos os testes em modo headless:

```bash
npm run test
```

Para executar testes específicos:

```bash
npm run test:users    # Executa apenas os testes de usuários
npm run test:events   # Executa apenas os testes de eventos
npm run test:orders   # Executa apenas os testes de pedidos
npm run test:cart     # Executa apenas os testes de carrinho
```

## Detalhes dos Testes

### API de Usuários

- Listar usuários
- Criar usuário
- Obter usuário por ID
- Atualizar usuário
- Excluir usuário
- Testes de validação e erros

### API de Eventos

- Listar eventos
- Criar evento
- Obter evento por ID
- Atualizar evento
- Excluir evento
- Filtrar eventos por nome e categoria
- Testes de validação e erros

### API de Pedidos

- Listar pedidos
- Criar pedido
- Obter pedido por ID
- Atualizar status do pedido
- Cancelar pedido
- Testes de validação e erros

### API de Carrinho

- Obter carrinho
- Adicionar item ao carrinho
- Atualizar quantidade de item
- Remover item do carrinho
- Limpar carrinho
- Testes de validação e erros 