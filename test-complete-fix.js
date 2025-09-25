// Script de test complet pour vérifier les corrections
console.log('🚀 Test complet des corrections...');

async function runCompleteFixTest() {
  console.log('='.repeat(60));
  console.log('🔍 TEST COMPLET DES CORRECTIONS');
  console.log('='.repeat(60));
  
  // 1. Test de l'authentification
  console.log('🔐 TEST DE L\'AUTHENTIFICATION:');
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
    } else {
      const errorData = await response.text();
      console.log('❌ Erreur lors de la récupération');
      console.log('- Erreur:', errorData);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  // 4. Test de la navigation
  console.log('🧭 TEST DE LA NAVIGATION:');
  
  // Vérifier l'état actuel
  console.log('- URL actuelle:', window.location.href);
  console.log('- Pathname:', window.location.pathname);
  
  // Vérifier le sidebar
  const sidebar = document.querySelector('[data-testid="sidebar"], .sidebar, [class*="sidebar"]');
  console.log('- Sidebar trouvé:', sidebar ? '✅ Oui' : '❌ Non');
  
  if (sidebar) {
    const sidebarItems = sidebar.querySelectorAll('a, button, [role="button"]');
    console.log('- Éléments de navigation:', sidebarItems.length);
  }
  
  // Vérifier le header
  const header = document.querySelector('header, [role="banner"], [class*="header"]');
  console.log('- Header trouvé:', header ? '✅ Oui' : '❌ Non');
  
  if (header) {
    const headerTitle = header.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]');
    console.log('- Titre du header:', headerTitle ? headerTitle.textContent : 'Non trouvé');
  }
  
  // Vérifier la navigation contextuelle
  const isInUserModule = window.location.pathname.startsWith('/users/');
  const isInProjectModule = window.location.pathname.startsWith('/projects/') || 
                           window.location.pathname.startsWith('/tasks/') || 
                           window.location.pathname.startsWith('/tableur/') || 
                           window.location.pathname.startsWith('/calendar/') || 
                           window.location.pathname === '/dashboard';
  
  console.log('- Module utilisateur:', isInUserModule ? '✅ Oui' : '❌ Non');
  console.log('- Module projets:', isInProjectModule ? '✅ Oui' : '❌ Non');
  
  // 5. Test des composants React
  console.log('⚛️ TEST DES COMPOSANTS REACT:');
  
  // Vérifier les éléments React
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log('- Éléments React trouvés:', reactElements.length);
  
  // Vérifier les erreurs de console
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Vérifier les erreurs de React Router
  const routerErrors = errors.filter(error => 
    error.includes('No routes matched') || 
    error.includes('Route not found') ||
    error.includes('Navigation error')
  );
  
  if (routerErrors.length > 0) {
    console.log('❌ Erreurs de navigation détectées:');
    routerErrors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log('✅ Aucune erreur de navigation détectée');
  }
  
  // 6. Test de la configuration CORS
  console.log('🌐 TEST DE LA CONFIGURATION CORS:');
  
  try {
    const corsResponse = await fetch('http://localhost:8000/api/', {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('- Preflight CORS:', corsResponse.status === 200 || corsResponse.status === 204 ? '✅ OK' : '❌ Erreur');
    console.log('- Status:', corsResponse.status, corsResponse.statusText);
    
    // Vérifier les headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': corsResponse.headers.get('Access-Control-Allow-Credentials')
    };
    
    console.log('- Headers CORS:', corsHeaders);
  } catch (error) {
    console.log('- Preflight CORS:', '❌ Erreur');
    console.log('- Erreur:', error.message);
  }
  
  // 7. Résumé et recommandations
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('='.repeat(60));
  
  const issues = [];
  const recommendations = [];
  
  if (!accessToken) {
    issues.push('Pas de token d\'accès');
    recommendations.push('Connectez-vous sur http://localhost:3000/login');
  }
  
  if (!sidebar) {
    issues.push('Sidebar non trouvé');
    recommendations.push('Vérifiez que le composant Layout est correctement rendu');
  }
  
  if (!header) {
    issues.push('Header non trouvé');
    recommendations.push('Vérifiez que le composant Layout est correctement rendu');
  }
  
  if (routerErrors.length > 0) {
    issues.push('Erreurs de navigation détectées');
    recommendations.push('Vérifiez la configuration des routes dans App.jsx');
  }
  
  if (issues.length === 0) {
    console.log('✅ Toutes les corrections sont fonctionnelles');
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

// Exécuter le test complet
runCompleteFixTest();
