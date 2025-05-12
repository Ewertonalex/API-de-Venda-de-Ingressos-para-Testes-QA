describe('API de Carrinho', { tags: '@cart' }, () => {
  before(() => {
    // Fazer login como usuário
    cy.loginAPI();
    
    // Limpar carrinho antes de iniciar testes
    cy.authenticatedRequest({
      method: 'DELETE',
      url: '/carrinho',
      failOnStatusCode: false
    });
  });
  
  after(() => {
    // Limpar o carrinho após os testes
    cy.authenticatedRequest({
      method: 'DELETE',
      url: '/carrinho',
      failOnStatusCode: false
    });
  });
  
  it('deve exibir carrinho vazio inicialmente', () => {
    cy.authenticatedRequest({
      method: 'GET',
      url: '/carrinho'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('itens');
      expect(response.body.itens).to.be.an('array');
      expect(response.body.itens.length).to.eq(0);
      expect(response.body.valorTotal).to.eq(0);
    });
  });
  
  it('deve adicionar item ao carrinho', () => {
    // Primeiro, obter um tipo de ingresso disponível para adicionar
    cy.authenticatedRequest({
      method: 'GET',
      url: '/eventos'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length === 0) {
        cy.log('Não há eventos disponíveis para testar o carrinho');
        return;
      }
      
      // Obter o ID do primeiro evento
      const eventId = response.body[0].id;
      
      // Obter detalhes do evento para encontrar um tipo de ingresso
      cy.authenticatedRequest({
        method: 'GET',
        url: `/eventos/${eventId}`
      }).then((eventResponse) => {
        expect(eventResponse.status).to.eq(200);
        
        if (!eventResponse.body.tiposIngressos || eventResponse.body.tiposIngressos.length === 0) {
          cy.log('Evento não possui tipos de ingressos disponíveis');
          return;
        }
        
        // Filtrar apenas tipos de ingressos ativos e com quantidade disponível
        const availableTicketTypes = eventResponse.body.tiposIngressos.filter(
          tt => tt.ativo && tt.quantidadeDisponivel > 0
        );
        
        if (availableTicketTypes.length === 0) {
          cy.log('Não há tipos de ingressos disponíveis para venda');
          return;
        }
        
        // Usar o primeiro tipo de ingresso disponível
        const ticketTypeId = availableTicketTypes[0].id;
        
        // Adicionar ao carrinho
        cy.authenticatedRequest({
          method: 'POST',
          url: '/carrinho/adicionar',
          body: {
            tipoIngressoId: ticketTypeId,
            quantidade: 2
          }
        }).then((addResponse) => {
          expect(addResponse.status).to.eq(200);
          expect(addResponse.body).to.have.property('itens');
          expect(addResponse.body.itens).to.be.an('array');
          expect(addResponse.body.itens.length).to.eq(1);
          expect(addResponse.body.itens[0]).to.have.property('tipoIngressoId', ticketTypeId);
          expect(addResponse.body.itens[0]).to.have.property('quantidade', 2);
          expect(addResponse.body.valorTotal).to.be.gt(0);
        });
      });
    });
  });
  
  it('deve atualizar quantidade de um item no carrinho', () => {
    // Verificar se há itens no carrinho
    cy.authenticatedRequest({
      method: 'GET',
      url: '/carrinho'
    }).then((response) => {
      expect(response.status).to.eq(200);
      
      if (response.body.itens.length === 0) {
        cy.log('Carrinho está vazio, não é possível atualizar');
        return;
      }
      
      // Pegar o primeiro item do carrinho
      const itemId = response.body.itens[0].id;
      const tipoIngressoId = response.body.itens[0].tipoIngressoId;
      
      // Atualizar a quantidade para 3
      cy.authenticatedRequest({
        method: 'PUT',
        url: '/carrinho/atualizar',
        body: {
          itemId,
          quantidade: 3
        }
      }).then((updateResponse) => {
        expect(updateResponse.status).to.eq(200);
        expect(updateResponse.body).to.have.property('itens');
        expect(updateResponse.body.itens).to.be.an('array');
        
        // Encontrar o item atualizado
        const updatedItem = updateResponse.body.itens.find(
          item => item.tipoIngressoId === tipoIngressoId
        );
        
        expect(updatedItem).to.exist;
        expect(updatedItem).to.have.property('quantidade', 3);
      });
    });
  });
  
  it('deve remover item do carrinho', () => {
    // Verificar se há itens no carrinho
    cy.authenticatedRequest({
      method: 'GET',
      url: '/carrinho'
    }).then((response) => {
      expect(response.status).to.eq(200);
      
      if (response.body.itens.length === 0) {
        cy.log('Carrinho está vazio, não é possível remover');
        return;
      }
      
      // Pegar o primeiro item do carrinho
      const itemId = response.body.itens[0].id;
      
      // Remover o item
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/carrinho/remover/${itemId}`
      }).then((removeResponse) => {
        expect(removeResponse.status).to.eq(200);
        
        // Verificar se o item foi removido
        cy.authenticatedRequest({
          method: 'GET',
          url: '/carrinho'
        }).then((checkResponse) => {
          expect(checkResponse.status).to.eq(200);
          
          // Verificar se o item não está mais no carrinho
          const itemStillExists = checkResponse.body.itens.some(item => item.id === itemId);
          expect(itemStillExists).to.be.false;
        });
      });
    });
  });
  
  it('deve limpar o carrinho', () => {
    // Adicionar pelo menos um item ao carrinho para teste
    cy.authenticatedRequest({
      method: 'GET',
      url: '/eventos'
    }).then((response) => {
      if (response.body.length === 0) {
        cy.log('Não há eventos disponíveis para testar');
        return;
      }
      
      const eventId = response.body[0].id;
      
      cy.authenticatedRequest({
        method: 'GET',
        url: `/eventos/${eventId}`
      }).then((eventResponse) => {
        if (!eventResponse.body.tiposIngressos || eventResponse.body.tiposIngressos.length === 0) {
          cy.log('Evento não possui tipos de ingressos disponíveis');
          return;
        }
        
        const availableTicketTypes = eventResponse.body.tiposIngressos.filter(
          tt => tt.ativo && tt.quantidadeDisponivel > 0
        );
        
        if (availableTicketTypes.length === 0) {
          cy.log('Não há tipos de ingressos disponíveis para venda');
          return;
        }
        
        // Adicionar ao carrinho
        cy.authenticatedRequest({
          method: 'POST',
          url: '/carrinho/adicionar',
          body: {
            tipoIngressoId: availableTicketTypes[0].id,
            quantidade: 1
          }
        }).then(() => {
          // Agora limpar o carrinho
          cy.authenticatedRequest({
            method: 'DELETE',
            url: '/carrinho'
          }).then((clearResponse) => {
            expect(clearResponse.status).to.eq(200);
            
            // Verificar se o carrinho está vazio
            cy.authenticatedRequest({
              method: 'GET',
              url: '/carrinho'
            }).then((finalResponse) => {
              expect(finalResponse.status).to.eq(200);
              expect(finalResponse.body).to.have.property('itens');
              expect(finalResponse.body.itens).to.be.an('array');
              expect(finalResponse.body.itens.length).to.eq(0);
              expect(finalResponse.body.valorTotal).to.eq(0);
            });
          });
        });
      });
    });
  });
});
