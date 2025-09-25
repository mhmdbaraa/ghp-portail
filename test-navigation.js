// Script de test pour la navigation
console.log('🧭 Test de la navigation...');

function testNavigation() {
  console.log('='.repeat(50));
  console.log('🔍 TEST DE LA NAVIGATION');
  console.log('='.repeat(50));
  
  // 1. Vérifier l'état actuel
  console.log('📍 ÉTAT ACTUEL:');
  console.log('- URL actuelle:', window.location.href);
  console.log('- Pathname:', window.location.pathname);
  console.log('- Hash:', window.location.hash);
  console.log('- Search:', window.location.search);
  
  // 2. Vérifier les éléments de navigation
  console.log('🧭 ÉLÉMENTS DE NAVIGATION:');
  
  // Vérifier le sidebar
  const sidebar = document.querySelector('[data-testid="sidebar"], .sidebar, [class*="sidebar"]');
  console.log('- Sidebar trouvé:', sidebar ? '✅ Oui' : '❌ Non');
  
  if (sidebar) {
    const sidebarItems = sidebar.querySelectorAll('a, button, [role="button"]');
    console.log('- Éléments de navigation:', sidebarItems.length);
    
    sidebarItems.forEach((item, index) => {
      const text = item.textContent?.trim() || item.getAttribute('aria-label') || 'Sans texte';
      const href = item.getAttribute('href') || item.getAttribute('data-path') || 'Pas de lien';
      console.log(`  ${index + 1}. ${text} -> ${href}`);
    });
  }
  
  // Vérifier le header
  const header = document.querySelector('header, [role="banner"], [class*="header"]');
  console.log('- Header trouvé:', header ? '✅ Oui' : '❌ Non');
  
  if (header) {
    const headerTitle = header.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]');
    console.log('- Titre du header:', headerTitle ? headerTitle.textContent : 'Non trouvé');
  }
  
  // 3. Vérifier les routes
  console.log('🛣️ ROUTES:');
  
  const routes = [
    { path: '/', name: 'Accueil' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/projects', name: 'Projets' },
    { path: '/tasks', name: 'Tâches' },
    { path: '/tableur', name: 'Tableur' },
    { path: '/calendar', name: 'Calendrier' },
    { path: '/users/dashboard', name: 'Dashboard Utilisateurs' },
    { path: '/users/list', name: 'Liste Utilisateurs' },
    { path: '/users/create', name: 'Créer Utilisateur' },
    { path: '/users/permissions', name: 'Permissions' },
    { path: '/users/roles', name: 'Rôles' }
  ];
  
  routes.forEach(route => {
    const isActive = window.location.pathname === route.path;
    console.log(`- ${route.name} (${route.path}): ${isActive ? '✅ Actif' : '⚪ Inactif'}`);
  });
  
  // 4. Vérifier la navigation contextuelle
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
  
  // 6. Vérifier les erreurs de navigation
  console.log('⚠️ VÉRIFICATION DES ERREURS:');
  
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
  
  // 7. Résumé et recommandations
  console.log('='.repeat(50));
  console.log('📊 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('='.repeat(50));
  
  const issues = [];
  const recommendations = [];
  
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
    console.log('✅ Navigation fonctionnelle');
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
testNavigation();
