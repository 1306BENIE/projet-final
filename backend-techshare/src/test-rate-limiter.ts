const API_URL = 'http://localhost:5000/api';

async function testRateLimiter() {
  console.log('Test du rate limiter de réinitialisation de mot de passe...\n');

  // Test de la demande de réinitialisation
  console.log('Test 1: Première tentative de réinitialisation');
  try {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const data = await response.json();
    console.log('Réponse:', data);
  } catch (error: any) {
    console.log('Erreur:', error.message);
  }

  // Attendre 1 seconde
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Deuxième tentative
  console.log('\nTest 2: Deuxième tentative de réinitialisation');
  try {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const data = await response.json();
    console.log('Réponse:', data);
  } catch (error: any) {
    console.log('Erreur:', error.message);
  }

  // Attendre 1 seconde
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Troisième tentative
  console.log('\nTest 3: Troisième tentative de réinitialisation');
  try {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const data = await response.json();
    console.log('Réponse:', data);
  } catch (error: any) {
    console.log('Erreur:', error.message);
  }

  // Attendre 1 seconde
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Quatrième tentative (devrait être bloquée)
  console.log('\nTest 4: Quatrième tentative de réinitialisation (devrait être bloquée)');
  try {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    const data = await response.json();
    console.log('Réponse:', data);
  } catch (error: any) {
    console.log('Erreur:', error.message);
  }
}

// Exécuter le test
testRateLimiter().catch(console.error); 