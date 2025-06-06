const API_URL = 'http://localhost:5000/api';
async function testRateLimiter() {
    console.log('Test du rate limiter de réinitialisation de mot de passe...\n');
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
    }
    catch (error) {
        console.log('Erreur:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    }
    catch (error) {
        console.log('Erreur:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    }
    catch (error) {
        console.log('Erreur:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    }
    catch (error) {
        console.log('Erreur:', error.message);
    }
}
testRateLimiter().catch(console.error);
//# sourceMappingURL=test-rate-limiter.js.map