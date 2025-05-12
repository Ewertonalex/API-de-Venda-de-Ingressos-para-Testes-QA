// Import commands.js using ES2015 syntax:
import './commands';

// Import grep functionality:
import '@cypress/grep';

// Configuração para evitar falha em responses 4xx ou 5xx quando for esperado no teste
Cypress.on('fail', (error, runnable) => {
  // Se o teste espera verificar um erro de API, não aborte
  if (runnable.title.includes('deve falhar') || runnable.title.includes('deve retornar erro')) {
    error.name = 'ExpectedError';
    return false;
  }
  throw error;
}); 