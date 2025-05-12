describe('API de Usuários', { tags: '@users' }, () => {
  let testUserId;
  let testUserData;
  
  before(() => {
    // Fazer login como admin
    cy.loginAPI();
    
    // Dados para criar usuário de teste
    testUserData = {
      nome: `Usuário Teste ${Date.now()}`,
      email: `usuario.teste.${Date.now()}@example.com`,
      senha: 'Senha@123',
      telefone: '1198765432',
      cpf: '98765432100'
    };
  });
  
  after(() => {
    // Limpar dados de teste
    cy.cleanupTestData();
    
    // Se o usuário de teste foi criado e não foi excluído nos testes
    if (testUserId) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/usuarios/${testUserId}`,
        failOnStatusCode: false
      });
    }
  });
  
  it('deve listar usuários', () => {
    cy.authenticatedRequest({
      method: 'GET',
      url: '/usuarios'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      // Verificar se lista contém pelo menos o admin
      expect(response.body.length).to.be.at.least(1);
    });
  });
  
  it('deve criar um novo usuário', () => {
    // Usar a rota de registro em vez de POST para /usuarios
    cy.request({
      method: 'POST',
      url: '/auth/register',
      body: testUserData
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      expect(response.body.user.nome).to.eq(testUserData.nome);
      expect(response.body.user.email).to.eq(testUserData.email);
      
      // Guardar ID para uso em outros testes
      testUserId = response.body.user.id;
    });
  });
  
  it('deve obter usuário por ID', () => {
    cy.authenticatedRequest({
      method: 'GET',
      url: `/usuarios/${testUserId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testUserId);
      expect(response.body.nome).to.eq(testUserData.nome);
      expect(response.body.email).to.eq(testUserData.email);
    });
  });
  
  it('deve atualizar um usuário', () => {
    const updatedData = {
      nome: `${testUserData.nome} Atualizado`,
      telefone: '1187654321'
    };
    
    cy.authenticatedRequest({
      method: 'PUT',
      url: `/usuarios/${testUserId}`,
      body: updatedData
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testUserId);
      expect(response.body.nome).to.eq(updatedData.nome);
      expect(response.body.telefone).to.eq(updatedData.telefone);
      // Email não deve mudar
      expect(response.body.email).to.eq(testUserData.email);
    });
  });
  
  it('deve retornar erro ao tentar criar usuário com email duplicado', () => {
    cy.request({
      method: 'POST',
      url: '/auth/register',
      body: testUserData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve retornar erro ao tentar obter usuário inexistente', () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    
    cy.authenticatedRequest({
      method: 'GET',
      url: `/usuarios/${fakeUserId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve excluir um usuário', () => {
    cy.authenticatedRequest({
      method: 'DELETE',
      url: `/usuarios/${testUserId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message');
      
      // Verificar se realmente foi excluído
      cy.authenticatedRequest({
        method: 'GET',
        url: `/usuarios/${testUserId}`,
        failOnStatusCode: false
      }).then((checkResponse) => {
        expect(checkResponse.status).to.eq(404);
      });
      
      // Limpar ID pois usuário foi excluído
      testUserId = null;
    });
  });
}); 