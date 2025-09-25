// Script de test pour le formulaire de création d'utilisateur
console.log('🧪 Test du formulaire de création d'utilisateur...');

async function testUserForm() {
  console.log('='.repeat(50));
  console.log('🔍 TEST DU FORMULAIRE DE CRÉATION D\'UTILISATEUR');
  console.log('='.repeat(50));
  
  // 1. Vérifier l'authentification
  console.log('🔐 VÉRIFICATION DE L\'AUTHENTIFICATION:');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userData = localStorage.getItem('userData');
  
  console.log('- Access Token:', accessToken ? '✅ Présent' : '❌ Absent');
  console.log('- Refresh Token:', refreshToken ? '✅ Présent' : '❌ Absent');
  console.log('- User Data:', userData ? '✅ Présent' : '❌ Absent');
  
  if (!accessToken) {
    console.log('❌ Pas de token d\'accès - Veuillez vous connecter');
    console.log('💡 Solution: Allez sur http://localhost:3000/login');
    return;
  }
  
  // 2. Test de l'API de création d'utilisateur
  console.log('👥 TEST DE L\'API DE CRÉATION D\'UTILISATEUR:');
  
  const testUserData = {
    username: 'test.user',
    email: 'test.user@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    status: 'active',
    is_staff: false,
    is_active: true,
    department: 'IT',
    position: 'Developer',
    phone: '+216 12 345 678',
    password: 'testpassword123'
  };
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/users/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserData)
    });
    
    console.log('- Status:', response.status, response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Utilisateur créé avec succès');
      console.log('- Données reçues:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Erreur lors de la création');
      console.log('- Erreur:', errorData);
      
      if (response.status === 401) {
        console.log('💡 Solution: Token expiré - Essayez de vous reconnecter');
      } else if (response.status === 400) {
        console.log('💡 Solution: Vérifiez les données du formulaire');
      } else if (response.status === 403) {
        console.log('💡 Solution: Permissions insuffisantes');
      } else if (response.status === 500) {
        console.log('💡 Solution: Erreur serveur - Vérifiez les logs du backend');
      }
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
    console.log('💡 Solution: Vérifiez que le serveur Django est démarré');
  }
  
  // 3. Test de l'API de récupération des utilisateurs
  console.log('📋 TEST DE L\'API DE RÉCUPÉRATION DES UTILISATEURS:');
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/users/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('- Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Utilisateurs récupérés avec succès');
      console.log('- Nombre d\'utilisateurs:', data.results ? data.results.length : data.length);
      console.log('- Données:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Erreur lors de la récupération');
      console.log('- Erreur:', errorData);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  // 4. Test de l'API de mise à jour d'utilisateur
  console.log('✏️ TEST DE L\'API DE MISE À JOUR D\'UTILISATEUR:');
  
  const updateUserData = {
    first_name: 'Test Updated',
    last_name: 'User Updated',
    department: 'IT Updated'
  };
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/users/1/', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateUserData)
    });
    
    console.log('- Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Utilisateur mis à jour avec succès');
      console.log('- Données reçues:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Erreur lors de la mise à jour');
      console.log('- Erreur:', errorData);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  // 5. Résumé et recommandations
  console.log('='.repeat(50));
  console.log('📊 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('='.repeat(50));
  
  const issues = [];
  const recommendations = [];
  
  if (!accessToken) {
    issues.push('Pas de token d\'accès');
    recommendations.push('Connectez-vous sur http://localhost:3000/login');
  }
  
  if (issues.length === 0) {
    console.log('✅ Tests du formulaire d\'utilisateur terminés');
  } else {
    console.log('❌ Problèmes détectés:');
    issues.forEach(issue => console.log(`- ${issue}`));
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Recommandations:');
    recommendations.forEach(rec => console.log(`- ${rec}`));
  }
  
  console.log('📖 Pour plus d\'aide, consultez AUTH_TROUBLESHOOTING.md');
  console.log('🔧 Pour un debug complet, allez sur http://localhost:3000/debug/auth');
  console.log('🧪 Pour un test simple, allez sur http://localhost:3000/test/auth');
}

// Exécuter le test
testUserForm();
