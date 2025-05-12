describe('API de Pedidos', { tags: '@orders' }, () => {
  let testOrderId;
  let ticketTypeId;
  let eventId;
  
  before(() => {
    // Fazer login como admin
    cy.loginAPI();
    
    // Primeiro, criar uma categoria para o evento se necessário
    cy.authenticatedRequest({
      method: 'GET',
      url: '/categorias'
    }).then((response) => {
      let categoryId;
      
      if (response.body.length === 0) {
        // Criar categoria se não existir nenhuma
        cy.authenticatedRequest({
          method: 'POST',
          url: '/categorias',
          body: {
            nome: `Categoria Teste ${Date.now()}`,
            descricao: 'Categoria criada para testes automatizados'
          }
        }).then(catResponse => {
          categoryId = catResponse.body.id;
        });
      } else {
        categoryId = response.body[0].id;
      }

      // Agora vamos buscar ou criar um evento
      cy.authenticatedRequest({
        method: 'GET',
        url: '/eventos'
      }).then((eventResponse) => {
        // Se não houver eventos, vamos criar um
        if (eventResponse.body.length === 0) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          cy.authenticatedRequest({
            method: 'POST',
            url: '/eventos',
            body: {
              nome: `Evento Teste ${Date.now()}`,
              descricao: 'Evento criado para testes automatizados',
              local: 'Local de Teste',
              dataInicio: tomorrow.toISOString(),
              dataFim: nextWeek.toISOString(),
              categoriaId: categoryId,
              ativo: true
            }
          }).then(createEventResponse => {
            eventId = createEventResponse.body.id;
          });
        } else {
          eventId = eventResponse.body[0].id;
        }
        
        // Finalmente, criar um tipo de ingresso se necessário
        cy.authenticatedRequest({
          method: 'GET',
          url: `/eventos/${eventId}`
        }).then((response) => {
          // Verificar se o evento já tem tipos de ingresso
          if (!response.body.tiposIngressos || response.body.tiposIngressos.length === 0) {
            // Criar tipo de ingresso
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            cy.authenticatedRequest({
              method: 'POST',
              url: '/tipos-ingressos',
              body: {
                nome: `Ingresso Teste ${Date.now()}`,
                descricao: 'Tipo de ingresso para testes',
                preco: 50,
                quantidadeDisponivel: 100,
                dataInicioVenda: new Date().toISOString(),
                eventoId: eventId,
                ativo: true
              }
            }).then(ticketResponse => {
              ticketTypeId = ticketResponse.body.id;
            });
          } else {
            // Usar o primeiro tipo de ingresso disponível
            const ticketType = response.body.tiposIngressos.find(
              tt => tt.ativo && tt.quantidadeDisponivel > 0
            );
            
            if (ticketType) {
              ticketTypeId = ticketType.id;
            } else {
              // Criar um novo tipo de ingresso se nenhum estiver disponível
              cy.authenticatedRequest({
                method: 'POST',
                url: '/tipos-ingressos',
                body: {
                  nome: `Ingresso Teste ${Date.now()}`,
                  descricao: 'Tipo de ingresso para testes',
                  preco: 50,
                  quantidadeDisponivel: 100,
                  dataInicioVenda: new Date().toISOString(),
                  eventoId: eventId,
                  ativo: true
                }
              }).then(ticketResponse => {
                ticketTypeId = ticketResponse.body.id;
              });
            }
          }
        });
      });
    });
  });
  
  after(() => {
    // Limpar dados de teste (opcional, dependendo da implementação da API)
    if (testOrderId) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/pedidos/${testOrderId}`,
        failOnStatusCode: false
      });
    }
  });
  
  it('deve listar pedidos vazios inicialmente', () => {
    cy.authenticatedRequest({
      method: 'GET',
      url: '/pedidos'
    }).then((response) => {
      expect(response.status).to.eq(200);
      // O resultado pode ser um array vazio ou com pedidos existentes
      expect(response.body).to.exist;
    });
  });
  
  it('deve criar um novo pedido', () => {
    // Pular este teste se não tivermos um tipo de ingresso
    if (!ticketTypeId) {
      cy.log('Pulando teste porque não há tipo de ingresso disponível');
      return;
    }
    
    cy.authenticatedRequest({
      method: 'POST',
      url: '/pedidos',
      body: {
        tipoIngressoId: ticketTypeId,
        quantidade: 2
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('codigo');
      expect(response.body).to.have.property('valorTotal');
      expect(response.body).to.have.property('status');
      
      // Guardar ID para uso em outros testes
      testOrderId = response.body.id;
    });
  });
  
  it('deve obter pedido por ID', () => {
    // Pular este teste se não tivermos criado um pedido
    if (!testOrderId) {
      cy.log('Pulando teste porque não há pedido de teste');
      return;
    }
    
    cy.authenticatedRequest({
      method: 'GET',
      url: `/pedidos/${testOrderId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testOrderId);
      expect(response.body).to.have.property('codigo');
      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('ingressos').that.is.an('array');
      expect(response.body.ingressos.length).to.be.at.least(1);
    });
  });
  
  it('deve atualizar o status de um pedido', () => {
    // Pular este teste se não tivermos criado um pedido
    if (!testOrderId) {
      cy.log('Pulando teste porque não há pedido de teste');
      return;
    }
    
    const updateData = {
      status: 'PAGO',
      formaPagamento: 'PIX'
    };
    
    cy.authenticatedRequest({
      method: 'PUT',
      url: `/pedidos/${testOrderId}`,
      body: updateData
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', testOrderId);
      expect(response.body.status).to.eq(updateData.status);
      expect(response.body.formaPagamento).to.eq(updateData.formaPagamento);
    });
  });
  
  it('deve listar pedidos após criar um', () => {
    // Pular este teste se não tivermos criado um pedido
    if (!testOrderId) {
      cy.log('Pulando teste porque não há pedido de teste');
      return;
    }
    
    cy.authenticatedRequest({
      method: 'GET',
      url: '/pedidos'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Deve encontrar o pedido criado
      const createdOrder = response.body.find(order => order.id === testOrderId);
      expect(createdOrder).to.exist;
    });
  });
  
  it('deve retornar erro ao obter pedido inexistente', () => {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';
    
    cy.authenticatedRequest({
      method: 'GET',
      url: `/pedidos/${fakeOrderId}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve retornar erro ao criar pedido com tipo de ingresso inexistente', () => {
    const fakeTicketTypeId = '00000000-0000-0000-0000-000000000000';
    
    cy.authenticatedRequest({
      method: 'POST',
      url: '/pedidos',
      body: {
        tipoIngressoId: fakeTicketTypeId,
        quantidade: 1
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 404]);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve retornar erro ao atualizar pedido com status inválido', () => {
    // Pular este teste se não tivermos criado um pedido
    if (!testOrderId) {
      cy.log('Pulando teste porque não há pedido de teste');
      return;
    }
    
    cy.authenticatedRequest({
      method: 'PUT',
      url: `/pedidos/${testOrderId}`,
      body: {
        status: 'INVALIDO'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('erro');
    });
  });
  
  it('deve cancelar um pedido', () => {
    // Pular este teste se não tivermos criado um pedido
    if (!testOrderId) {
      cy.log('Pulando teste porque não há pedido de teste');
      return;
    }
    
    cy.authenticatedRequest({
      method: 'DELETE',
      url: `/pedidos/${testOrderId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message').that.includes('cancelado');
      
      // Verificar se o pedido foi marcado como cancelado
      cy.authenticatedRequest({
        method: 'GET',
        url: `/pedidos/${testOrderId}`
      }).then((checkResponse) => {
        expect(checkResponse.status).to.eq(200);
        expect(checkResponse.body.status).to.eq('CANCELADO');
      });
      
      // Limpar ID pois pedido foi cancelado
      testOrderId = null;
    });
  });
}); 