// ***********************************************
// Comandos personalizados para testes de API
// ***********************************************

// Login de usuário e armazenamento do token
Cypress.Commands.add('loginAPI', (email = 'admin@ticketshop.com', senha = 'admin123') => {
  cy.request({
    method: 'POST',
    url: '/auth/login',
    body: {
      email,
      senha
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('token');
    
    // Armazena token para uso nos requests
    Cypress.env('authToken', response.body.token);
    Cypress.env('userId', response.body.user.id);
    
    return response.body;
  });
});

// Registro de novo usuário
Cypress.Commands.add('registerAPI', (userData) => {
  const defaultUser = {
    nome: `Teste ${Date.now()}`,
    email: `teste${Date.now()}@example.com`,
    senha: 'Teste@123',
    telefone: '11999999999',
    cpf: '12345678909'
  };
  
  const requestData = { ...defaultUser, ...userData };
  
  return cy.request({
    method: 'POST',
    url: '/auth/register',
    body: requestData,
    failOnStatusCode: false
  });
});

// Request autenticado
Cypress.Commands.add('authenticatedRequest', (options) => {
  const token = Cypress.env('authToken');
  
  if (!token) {
    throw new Error('O token de autenticação não está disponível. Execute o comando cy.loginAPI() primeiro.');
  }
  
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  return cy.request(authOptions);
});

// Limpar dados de teste (exemplo)
Cypress.Commands.add('cleanupTestData', () => {
  const token = Cypress.env('authToken');
  
  if (!token) {
    return;
  }
  
  // Aqui você pode implementar limpeza de dados se necessário
  // Por exemplo, excluir usuário criado durante testes
  // Ou limpar o carrinho
  
  cy.authenticatedRequest({
    method: 'DELETE',
    url: '/carrinho',
    failOnStatusCode: false
  });
}); 