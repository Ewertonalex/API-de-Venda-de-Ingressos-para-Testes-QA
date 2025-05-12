describe('API de Eventos', { tags: '@events' }, () => {
  let testEventId;
  let testEventData;
  let categoryId;
  
  before(() => {
    // Fazer login como admin
    cy.loginAPI();
    
    // Obter ID de uma categoria para associar ao evento
    cy.authenticatedRequest({
      method: 'GET',
      url: '/categorias'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.at.least(1);
      
      // Usar a primeira categoria
      categoryId = response.body[0].id;
      
      // Dados para criar evento de teste
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      testEventData = {
        nome: `Evento Teste ${Date.now()}`,
        descricao: 'Descrição do evento de teste automatizado com Cypress',
        local: 'Local do Teste',
        dataInicio: tomorrow.toISOString(),
        dataFim: nextWeek.toISOString(),
        imagemUrl: 'https://example.com/imagem.jpg',
        categoriaId: categoryId,
        ativo: true
      };
    });
  });
  
  after(() => {
    // Se o evento de teste foi criado e não foi excluído nos testes
    if (testEventId) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/eventos/${testEventId}`,
        failOnStatusCode: false
      });
    }
  });
  
  it('deve listar eventos', () => {
    cy.request({
      method: 'GET',
      url: '/eventos'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });
  
  it('deve criar um novo evento', () => {
    cy.authenticatedRequest({
      method: 'POST',
      url: '/eventos',
      body: testEventData
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body.nome).to.eq(testEventData.nome);
      expect(response.body.descricao).to.eq(testEventData.descricao);
      expect(response.body.categoriaId).to.eq(testEventData.categoriaId);
      
      // Guardar ID para uso em outros testes
      testEventId = response.body.id;
    });
  });
  
  it('deve obter evento por ID', () => {
    cy.request({
      method: 'GET',
      url: `/eventos/${testEventId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testEventId);
      expect(response.body.nome).to.eq(testEventData.nome);
      expect(response.body.descricao).to.eq(testEventData.descricao);
      expect(response.body.categoriaId).to.eq(testEventData.categoriaId);
    });
  });
  
  it('deve atualizar um evento', () => {
    const updatedData = {
      nome: `${testEventData.nome} Atualizado`,
      descricao: 'Descrição atualizada',
      ativo: false
    };
    
    cy.authenticatedRequest({
      method: 'PUT',
      url: `/eventos/${testEventId}`,
      body: updatedData
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testEventId);
      expect(response.body.nome).to.eq(updatedData.nome);
      expect(response.body.descricao).to.eq(updatedData.descricao);
      expect(response.body.ativo).to.eq(updatedData.ativo);
      // Local não deve mudar
      expect(response.body.local).to.eq(testEventData.local);
    });
  });
  
  it('deve retornar erro ao criar evento sem categoria válida', () => {
    const invalidEvent = {
      ...testEventData,
      categoriaId: '00000000-0000-0000-0000-000000000000' // ID inválido
    };
    
    cy.authenticatedRequest({
      method: 'POST',
      url: '/eventos',
      body: invalidEvent,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve retornar erro ao tentar obter evento inexistente', () => {
    const fakeEventId = '00000000-0000-0000-0000-000000000000';
    
    cy.request({
      method: 'GET',
      url: `/eventos/${fakeEventId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve filtrar eventos por nome', () => {
    cy.request({
      method: 'GET',
      url: '/eventos',
      qs: {
        nome: testEventData.nome.substring(0, 10) // Usar parte do nome como filtro
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      // Deve encontrar pelo menos o evento criado
      expect(response.body.some(event => event.id === testEventId)).to.be.true;
    });
  });
  
  it('deve filtrar eventos por categoria', () => {
    cy.request({
      method: 'GET',
      url: '/eventos',
      qs: {
        categoriaId: categoryId
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      // Todos os eventos retornados devem ter a categoria especificada
      expect(response.body.every(event => event.categoriaId === categoryId)).to.be.true;
    });
  });
  
  it('deve excluir um evento', () => {
    cy.authenticatedRequest({
      method: 'DELETE',
      url: `/eventos/${testEventId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message');
      
      // Verificar se realmente foi excluído
      cy.request({
        method: 'GET',
        url: `/eventos/${testEventId}`,
        failOnStatusCode: false
      }).then((checkResponse) => {
        expect(checkResponse.status).to.eq(404);
      });
      
      // Limpar ID pois evento foi excluído
      testEventId = null;
    });
  });
}); 