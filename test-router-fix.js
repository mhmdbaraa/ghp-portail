// Script de test pour vérifier la correction de l'erreur Router
console.log('🔧 Test de la correction de l\'erreur Router...');

function testRouterFix() {
  console.log('='.repeat(50));
  console.log('🔍 TEST DE LA CORRECTION DE L\'ERREUR ROUTER');
  console.log('='.repeat(50));
  
  // 1. Vérifier l'état actuel
  console.log('📍 ÉTAT ACTUEL:');
  console.log('- URL actuelle:', window.location.href);
  console.log('- Pathname:', window.location.pathname);
  console.log('- Hash:', window.location.hash);
  console.log('- Search:', window.location.search);
  
  // 2. Vérifier les erreurs de console
  console.log('⚠️ VÉRIFICATION DES ERREURS:');
  
  // Vérifier les erreurs de React Router
  const routerErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    const errorMessage = args.join(' ');
    if (errorMessage.includes('useLocation() may be used only in the context of a <Router> component')) {
      routerErrors.push(errorMessage);
    }
    originalError.apply(console, args);
  };
  
  // Attendre un peu pour capturer les erreurs
  setTimeout(() => {
    if (routerErrors.length > 0) {
      console.log('❌ Erreurs de Router détectées:');
      routerErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ Aucune erreur de Router détectée');
    }
  }, 1000);
  
  // 3. Vérifier les composants React
  console.log('⚛️ COMPOSANTS REACT:');
  
  // Vérifier les éléments React
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log('- Éléments React trouvés:', reactElements.length);
  
  // Vérifier le Router
  const routerElement = document.querySelector('[data-react-router]');
  console.log('- Élément Router trouvé:', routerElement ? '✅ Oui' : '❌ Non');
  
  // 4. Vérifier la navigation
  console.log('🧭 NAVIGATION:');
  
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
  
  // 5. Test de navigation
  console.log('🧪 TEST DE NAVIGATION:');
  
  // Fonction pour tester la navigation
  function testNavigationTo(path, name) {
    console.log(`- Test navigation vers ${name} (${path})...`);
    
    // Vérifier si le lien existe
    const link = document.querySelector(`a[href="${path}"], a[href="#${path}"]`);
    if (link) {
      console.log(`  ✅ Lien trouvé pour ${name}`);
    } else {
      console.log(`  ❌ Lien non trouvé pour ${name}`);
    }
  }
  
  // Tester les liens principaux
  testNavigationTo('/', 'Accueil');
  testNavigationTo('/dashboard', 'Dashboard');
  testNavigationTo('/projects', 'Projets');
  testNavigationTo('/tasks', 'Tâches');
  testNavigationTo('/users/dashboard', 'Dashboard Utilisateurs');
  testNavigationTo('/users/list', 'Liste Utilisateurs');
  
  // 6. Vérifier la navigation contextuelle
  console.log('🎯 NAVIGATION CONTEXTUELLE:');
  
  // Vérifier si on est dans le module utilisateur
  const isInUserModule = window.location.pathname.startsWith('/users/');
  console.log('- Module utilisateur:', isInUserModule ? '✅ Oui' : '❌ Non');
  
  // Vérifier si on est dans le module projets
  const isInProjectModule = window.location.pathname.startsWith('/projects/') || 
                           window.location.pathname.startsWith('/tasks/') || 
                           window.location.pathname.startsWith('/tableur/') || 
                           window.location.pathname.startsWith('/calendar/') || 
                           window.location.pathname === '/dashboard';
  console.log('- Module projets:', isInProjectModule ? '✅ Oui' : '❌ Non');
  
  // 7. Résumé et recommandations
  console.log('='.repeat(50));
  console.log('📊 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('='.repeat(50));
  
  const issues = [];
  const recommendations = [];
  
  if (routerErrors.length > 0) {
    issues.push('Erreurs de Router détectées');
    recommendations.push('Vérifiez que NavigationProvider est à l\'intérieur du Router');
  }
  
  if (!sidebar) {
    issues.push('Sidebar non trouvé');
    recommendations.push('Vérifiez que le composant Layout est correctement rendu');
  }
  
  if (!header) {
    issues.push('Header non trouvé');
    recommendations.push('Vérifiez que le composant Layout est correctement rendu');
  }
  
  if (issues.length === 0) {
    console.log('✅ Correction de l\'erreur Router réussie');
  } else {
    console.log('❌ Problèmes détectés:');
    issues.forEach(issue => console.log(`- ${issue}`));
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Recommandations:');
    recommendations.forEach(rec => console.log(`- ${rec}`));
  }
  
  console.log('📖 Pour plus d\'aide, consultez USER_FORM_FIXES.md');
  console.log('🔧 Pour un debug complet, allez sur http://localhost:3000/debug/auth');
  console.log('🧪 Pour un test simple, allez sur http://localhost:3000/test/auth');
}

// Exécuter le test
testRouterFix();
