# 🎫 API de Venda de Ingressos com Testes Cypress

![Badge Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Badge NodeJS](https://img.shields.io/badge/NodeJS-14+-green)
![Badge Testes](https://img.shields.io/badge/testes-Cypress-04C38E)

## 📋 Sobre o Projeto

Este repositório contém uma API RESTful completa para sistema de venda de ingressos, desenvolvida especialmente para que profissionais de QA possam praticar testes automatizados, junto com uma suíte de testes Cypress pronta para uso.

### O que você encontrará neste repositório:

- 🎯 **API completa**: Sistema de venda de ingressos para eventos com todas as funcionalidades
- 🔒 **Autenticação**: Sistema completo com JWT e diferentes perfis de usuário
- 📝 **Documentação**: Documentação interativa da API via Swagger
- ✅ **Testes automatizados**: Suíte completa de testes Cypress para API

## 🗂️ Estrutura do Repositório

Este repositório está organizado em duas partes principais:

1. **ticket-shop-api**: API de venda de ingressos desenvolvida em Node.js
2. **cypress-api-tests**: Suíte de testes Cypress para testar a API

## 🚀 Começando

### API de Venda de Ingressos

```bash
# Entre na pasta da API
cd ticket-shop-api

# Instale as dependências
npm install

# Inicie o servidor
npm run dev
```

A API estará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/api-docs`.

### Testes Cypress

```bash
# Entre na pasta de testes
cd cypress-api-tests

# Instale as dependências
npm install

# Execute todos os testes
npm run cy:run

# Ou abra a interface gráfica do Cypress
npm run cy:open
```

## 🔑 Contas Padrão para Testes

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@ticketshop.com | admin123 |
| Organizador | organizador@ticketshop.com | org123 |
| Cliente | cliente@ticketshop.com | cliente123 |

## ✨ Funcionalidades da API

- 👤 **Usuários**: Cadastro, autenticação e gerenciamento de perfis
- 📂 **Categorias**: Classificação de eventos
- 🎭 **Eventos**: Criação e gerenciamento de eventos
- 🎟️ **Ingressos**: Diferentes tipos e preços
- 🛒 **Carrinho**: Sistema de carrinho de compras
- 📝 **Pedidos**: Fluxo completo de compra

## 🧪 Testes Automatizados

Os testes incluídos cobrem:

- ✅ **API de Usuários**: Cadastro, autenticação, operações CRUD
- ✅ **API de Eventos**: Listagem, criação, atualização, exclusão
- ✅ **API de Pedidos**: Fluxo de compra completo
- ✅ **API de Carrinho**: Adicionar, atualizar, remover itens

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express, TypeScript, JWT
- **Banco de Dados**: SQLite em memória para facilitar testes
- **Testes**: Cypress, Mocha, Chai
- **Documentação**: Swagger

## 📚 Documentação Detalhada

Para informações mais detalhadas sobre cada parte do projeto, consulte:

- [Documentação da API](ticket-shop-api/README.md)
- [Documentação dos Testes](cypress-api-tests/README.md)

## 📜 Licença

Este projeto está licenciado sob a licença MIT.

---

Desenvolvido para fins educacionais e de prática em testes automatizados 🚀 