// Fake Database - Simulation d'une base de données réelle
// À remplacer par de vraies APIs en production

export const fakeDB = {
  // ===== UTILISATEURS =====
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@ghpportail.com',
      name: 'Admin Principal',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=1',
      department: 'Direction',
      position: 'Directeur Technique',
      phone: '+33 1 23 45 67 89',
      location: 'Paris, France',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-20T10:30:00Z',
      status: 'active',
      permissions: ['all'],
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    },
    {
      id: 2,
      username: 'sarah.martin',
      email: 'sarah.martin@ghpportail.com',
      name: 'Sarah Martin',
      role: 'project_manager',
      avatar: 'https://i.pravatar.cc/150?img=2',
      department: 'Développement',
      position: 'Chef de Projet Senior',
      phone: '+33 1 23 45 67 90',
      location: 'Lyon, France',
      joinDate: '2023-03-20',
      lastLogin: '2024-01-20T09:15:00Z',
      status: 'active',
      permissions: ['project_manage', 'task_manage', 'team_view'],
      preferences: {
        theme: 'dark',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    },
    {
      id: 3,
      username: 'john.doe',
      email: 'john.doe@ghpportail.com',
      name: 'John Doe',
      role: 'developer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      department: 'Développement',
      position: 'Développeur Full-Stack',
      phone: '+33 1 23 45 67 91',
      location: 'Marseille, France',
      joinDate: '2023-06-10',
      lastLogin: '2024-01-20T08:45:00Z',
      status: 'active',
      permissions: ['task_manage', 'project_view'],
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: false,
          push: true,
          sms: false
        }
      }
    },
    {
      id: 4,
      username: 'emma.wilson',
      email: 'emma.wilson@ghpportail.com',
      name: 'Emma Wilson',
      role: 'designer',
      avatar: 'https://i.pravatar.cc/150?img=4',
      department: 'Design',
      position: 'Designer UI/UX',
      phone: '+33 1 23 45 67 92',
      location: 'Bordeaux, France',
      joinDate: '2023-08-05',
      lastLogin: '2024-01-20T11:20:00Z',
      status: 'active',
      permissions: ['task_manage', 'project_view'],
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: false
        }
      }
    },
    {
      id: 5,
      username: 'mike.chen',
      email: 'mike.chen@ghpportail.com',
      name: 'Mike Chen',
      role: 'qa_engineer',
      avatar: 'https://i.pravatar.cc/150?img=5',
      department: 'Qualité',
      position: 'Ingénieur QA',
      phone: '+33 1 23 45 67 93',
      location: 'Nantes, France',
      joinDate: '2023-09-12',
      lastLogin: '2024-01-20T07:30:00Z',
      status: 'active',
      permissions: ['task_manage', 'project_view'],
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    }
  ],

  // ===== PROJETS =====
  projects: [
    {
      id: 1,
      name: 'Site E-commerce Premium',
      description: 'Développement d\'une plateforme e-commerce moderne avec gestion des stocks, paiements sécurisés et interface responsive.',
      status: 'in_progress',
      priority: 'high',
      category: 'Web',
      budget: 25000,
      spent: 18750,
      startDate: '2024-01-01',
      deadline: '2024-02-15',
      progress: 75,
      manager: 2, // Sarah Martin
      team: [2, 3, 4, 5], // Sarah, John, Emma, Mike
      tags: ['e-commerce', 'web', 'responsive', 'paiement'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      milestones: [
        {
          id: 1,
          name: 'Design UI/UX',
          description: 'Création des maquettes et prototypes',
          dueDate: '2024-01-10',
          status: 'completed',
          progress: 100
        },
        {
          id: 2,
          name: 'Développement Frontend',
          description: 'Implémentation de l\'interface utilisateur',
          dueDate: '2024-01-25',
          status: 'in_progress',
          progress: 80
        },
        {
          id: 3,
          name: 'Développement Backend',
          description: 'API et logique métier',
          dueDate: '2024-02-05',
          status: 'in_progress',
          progress: 60
        },
        {
          id: 4,
          name: 'Tests et Déploiement',
          description: 'Tests finaux et mise en production',
          dueDate: '2024-02-15',
          status: 'not_started',
          progress: 0
        }
      ],
      risks: [
        {
          id: 1,
          description: 'Intégration des paiements Stripe',
          level: 'medium',
          mitigation: 'Tests approfondis et documentation API'
        }
      ],
      documents: [
        {
          id: 1,
          name: 'Cahier des charges',
          type: 'pdf',
          url: '/documents/projet-1-cahier-charges.pdf',
          uploadedBy: 2,
          uploadDate: '2024-01-01'
        }
      ],
      createdAt: '2024-01-01T09:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      name: 'Application Mobile Fitness',
      description: 'Application mobile de suivi fitness avec synchronisation des données, plans d\'entraînement personnalisés et communauté.',
      status: 'in_progress',
      priority: 'medium',
      category: 'Mobile',
      budget: 18000,
      spent: 11160,
      startDate: '2024-01-15',
      deadline: '2024-03-01',
      progress: 62,
      manager: 2, // Sarah Martin
      team: [3, 4], // John, Emma
      tags: ['mobile', 'fitness', 'health', 'app'],
      technologies: ['React Native', 'Firebase', 'Node.js'],
      milestones: [
        {
          id: 5,
          name: 'Design Mobile',
          description: 'Interface mobile et expérience utilisateur',
          dueDate: '2024-01-20',
          status: 'completed',
          progress: 100
        },
        {
          id: 6,
          name: 'Développement Core',
          description: 'Fonctionnalités principales de l\'app',
          dueDate: '2024-02-10',
          status: 'in_progress',
          progress: 70
        },
        {
          id: 7,
          name: 'Tests et Optimisation',
          description: 'Tests utilisateurs et optimisation performance',
          dueDate: '2024-03-01',
          status: 'not_started',
          progress: 0
        }
      ],
      risks: [
        {
          id: 2,
          description: 'Performance sur appareils anciens',
          level: 'low',
          mitigation: 'Tests sur différents appareils'
        }
      ],
      documents: [
        {
          id: 2,
          name: 'Spécifications techniques',
          type: 'pdf',
          url: '/documents/projet-2-specs-techniques.pdf',
          uploadedBy: 2,
          uploadDate: '2024-01-15'
        }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T16:45:00Z'
    },
    {
      id: 3,
      name: 'Refonte UI/UX Dashboard',
      description: 'Modernisation complète de l\'interface utilisateur du dashboard principal avec design system et composants réutilisables.',
      status: 'paused',
      priority: 'low',
      category: 'Design',
      budget: 12000,
      spent: 11400,
      startDate: '2023-12-01',
      deadline: '2024-03-15',
      progress: 60,
      manager: 1,
      team: [4],
      tags: ['ui/ux', 'design-system', 'dashboard', 'refonte'],
      technologies: ['Figma', 'React', 'Storybook', 'SCSS'],
      milestones: [],
      risks: [],
      documents: [],
      createdAt: '2023-12-01T08:00:00Z',
      updatedAt: '2024-01-20T17:20:00Z'
    },
    {
      id: 4,
      name: 'Portail Partenaires',
      description: 'Développement d\'un portail partenaires B2B.',
      status: 'in_progress',
      priority: 'high',
      category: 'Web',
      budget: 15000,
      spent: 8000,
      startDate: '2023-12-10',
      deadline: '2024-01-05', // dépassé -> en retard
      progress: 40,
      manager: 2,
      team: [2,3],
      tags: ['b2b','portal'],
      technologies: ['React','Node.js'],
      milestones: [],
      risks: [],
      documents: [],
      createdAt: '2023-12-10T08:00:00Z',
      updatedAt: '2024-01-18T12:00:00Z'
    },
    {
      id: 5,
      name: 'Système de Notifications v1',
      description: 'Notifications push et email avec préférences utilisateur.',
      status: 'completed',
      priority: 'low',
      category: 'Backend',
      budget: 8000,
      spent: 7800,
      startDate: '2023-12-01',
      deadline: '2024-01-15',
      progress: 100,
      manager: 1,
      team: [5],
      tags: ['notifications','email','push'],
      technologies: ['Node.js','Redis','SMTP'],
      milestones: [],
      risks: [],
      documents: [],
      createdAt: '2023-12-01T09:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 6,
      name: 'Landing Page Marketing',
      description: 'Création d\'une landing page optimisée SEO/SEA.',
      status: 'completed',
      priority: 'medium',
      category: 'Web',
      budget: 5000,
      spent: 4800,
      startDate: '2023-11-20',
      deadline: '2023-12-05',
      progress: 100,
      manager: 2,
      team: [4],
      tags: ['marketing','seo'],
      technologies: ['React','SCSS'],
      milestones: [],
      risks: [],
      documents: [],
      createdAt: '2023-11-20T08:00:00Z',
      updatedAt: '2023-12-05T18:00:00Z'
    }
  ],

  // ===== TÂCHES =====
  tasks: [
    {
      id: 1,
      title: 'Révision du design final e-commerce',
      description: 'Finaliser les maquettes UI/UX pour le site e-commerce, incluant la page produit, panier et checkout.',
      project: 1, // Site E-commerce
      assignee: 4, // Emma Wilson
      reporter: 2, // Sarah Martin
      status: 'in_progress',
      priority: 'high',
      type: 'design',
      estimatedTime: 4,
      actualTime: 2.5,
      remainingTime: 1.5,
      startDate: '2024-01-18',
      dueDate: '2024-01-25',
      completedDate: null,
      tags: ['design', 'ui/ux', 'e-commerce'],
      dependencies: [],
      subtasks: [
        {
          id: 1,
          title: 'Page produit',
          status: 'completed',
          progress: 100
        },
        {
          id: 2,
          title: 'Panier d\'achat',
          status: 'in_progress',
          progress: 80
        },
        {
          id: 3,
          title: 'Processus de checkout',
          status: 'not_started',
          progress: 0
        }
      ],
      comments: [
        {
          id: 1,
          user: 4,
          content: 'Maquettes page produit terminées, en attente de validation',
          timestamp: '2024-01-20T10:00:00Z'
        },
        {
          id: 2,
          user: 2,
          content: 'Excellent travail ! On peut passer au panier maintenant',
          timestamp: '2024-01-20T11:30:00Z'
        }
      ],
      attachments: [
        {
          id: 1,
          name: 'maquettes-produit.fig',
          type: 'figma',
          url: '/attachments/maquettes-produit.fig',
          uploadedBy: 4,
          uploadDate: '2024-01-20'
        }
      ],
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-20T11:30:00Z'
    },
    {
      id: 2,
      title: 'Tests d\'intégration API mobile',
      description: 'Effectuer les tests d\'intégration pour l\'API de l\'application mobile fitness, vérifier la synchronisation des données.',
      project: 2, // Application Mobile
      assignee: 5, // Mike Chen
      reporter: 2, // Sarah Martin
      status: 'in_progress',
      priority: 'medium',
      type: 'testing',
      estimatedTime: 6,
      actualTime: 3,
      remainingTime: 3,
      startDate: '2024-01-20',
      dueDate: '2024-01-28',
      completedDate: null,
      tags: ['testing', 'api', 'mobile', 'integration'],
      dependencies: [1], // Dépend de la tâche de développement
      subtasks: [
        {
          id: 4,
          title: 'Tests API utilisateur',
          status: 'completed',
          progress: 100
        },
        {
          id: 5,
          title: 'Tests synchronisation données',
          status: 'in_progress',
          progress: 60
        },
        {
          id: 6,
          title: 'Tests performance',
          status: 'not_started',
          progress: 0
        }
      ],
      comments: [
        {
          id: 3,
          user: 5,
          content: 'Tests API utilisateur terminés avec succès',
          timestamp: '2024-01-20T14:00:00Z'
        }
      ],
      attachments: [
        {
          id: 2,
          name: 'rapport-tests-api.pdf',
          type: 'pdf',
          url: '/attachments/rapport-tests-api.pdf',
          uploadedBy: 5,
          uploadDate: '2024-01-20'
        }
      ],
      createdAt: '2024-01-20T08:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z'
    },
    {
      id: 3,
      title: 'Documentation API dashboard',
      description: 'Rédiger la documentation complète de l\'API du dashboard, incluant exemples de code et guides d\'intégration.',
      project: 3, // Refonte UI/UX
      assignee: 3, // John Doe
      reporter: 1, // Admin
      status: 'not_started',
      priority: 'low',
      type: 'documentation',
      estimatedTime: 3,
      actualTime: 0,
      remainingTime: 3,
      startDate: '2024-01-25',
      dueDate: '2024-01-30',
      completedDate: null,
      tags: ['documentation', 'api', 'dashboard'],
      dependencies: [],
      subtasks: [
        {
          id: 7,
          title: 'Documentation endpoints',
          status: 'not_started',
          progress: 0
        },
        {
          id: 8,
          title: 'Exemples de code',
          status: 'not_started',
          progress: 0
        },
        {
          id: 9,
          title: 'Guide d\'intégration',
          status: 'not_started',
          progress: 0
        }
      ],
      comments: [],
      attachments: [],
      createdAt: '2024-01-20T16:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ],

  // ===== NOTIFICATIONS =====
  notifications: [
    {
      id: 1,
      userId: 2, // Sarah Martin
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: 'La tâche "Révision du design final e-commerce" vous a été assignée',
      data: {
        taskId: 1,
        projectId: 1,
        assigneeId: 4
      },
      read: false,
      priority: 'medium',
      createdAt: '2024-01-20T09:00:00Z',
      expiresAt: '2024-01-27T09:00:00Z'
    },
    {
      id: 2,
      userId: 4, // Emma Wilson
      type: 'task_deadline',
      title: 'Échéance approche',
      message: 'La tâche "Révision du design final e-commerce" est due dans 5 jours',
      data: {
        taskId: 1,
        projectId: 1,
        daysLeft: 5
      },
      read: false,
      priority: 'high',
      createdAt: '2024-01-20T10:00:00Z',
      expiresAt: '2024-01-25T10:00:00Z'
    },
    {
      id: 3,
      userId: 2, // Sarah Martin
      type: 'project_update',
      title: 'Projet mis à jour',
      message: 'Le projet "Site E-commerce Premium" a été mis à jour',
      data: {
        projectId: 1,
        updateType: 'progress',
        oldProgress: 70,
        newProgress: 75
      },
      read: true,
      priority: 'low',
      createdAt: '2024-01-20T14:30:00Z',
      expiresAt: '2024-01-27T14:30:00Z'
    },
    {
      id: 4,
      userId: 5, // Mike Chen
      type: 'comment_added',
      title: 'Nouveau commentaire',
      message: 'Sarah Martin a commenté sur la tâche "Tests d\'intégration API mobile"',
      data: {
        taskId: 2,
        projectId: 2,
        commentId: 2
      },
      read: false,
      priority: 'low',
      createdAt: '2024-01-20T11:30:00Z',
      expiresAt: '2024-01-27T11:30:00Z'
    },
    {
      id: 5,
      userId: 1, // Admin
      type: 'system_alert',
      title: 'Maintenance système',
      message: 'Maintenance planifiée le 25 janvier de 02h00 à 04h00',
      data: {
        maintenanceDate: '2024-01-25',
        startTime: '02:00',
        endTime: '04:00'
      },
      read: false,
      priority: 'high',
      createdAt: '2024-01-20T15:00:00Z',
      expiresAt: '2024-01-25T04:00:00Z'
    }
  ],

  // ===== ÉQUIPES =====
  teams: [
    {
      id: 1,
      name: 'Équipe E-commerce',
      description: 'Équipe dédiée au développement du site e-commerce',
      members: [2, 3, 4, 5], // Sarah, John, Emma, Mike
      projects: [1], // Site E-commerce
      lead: 2, // Sarah Martin
      createdAt: '2024-01-01T09:00:00Z'
    },
    {
      id: 2,
      name: 'Équipe Mobile',
      description: 'Équipe spécialisée dans le développement mobile',
      members: [3, 4], // John, Emma
      projects: [2], // Application Mobile
      lead: 2, // Sarah Martin
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 3,
      name: 'Équipe Design',
      description: 'Équipe de design et UX/UI',
      members: [4], // Emma
      projects: [3], // Refonte UI/UX
      lead: 1, // Admin
      createdAt: '2023-12-01T08:00:00Z'
    }
  ],

  // ===== ACTIVITÉS =====
  activities: [
    {
      id: 1,
      userId: 2, // Sarah Martin
      type: 'project_created',
      description: 'A créé le projet "Site E-commerce Premium"',
      data: {
        projectId: 1,
        projectName: 'Site E-commerce Premium'
      },
      timestamp: '2024-01-01T09:00:00Z'
    },
    {
      id: 2,
      userId: 4, // Emma Wilson
      type: 'task_completed',
      description: 'A terminé la sous-tâche "Page produit"',
      data: {
        taskId: 1,
        subtaskId: 1,
        taskTitle: 'Révision du design final e-commerce'
      },
      timestamp: '2024-01-20T10:00:00Z'
    },
    {
      id: 3,
      userId: 5, // Mike Chen
      type: 'comment_added',
      description: 'A commenté sur la tâche "Tests d\'intégration API mobile"',
      data: {
        taskId: 2,
        commentId: 3
      },
      timestamp: '2024-01-20T14:00:00Z'
    },
    {
      id: 4,
      userId: 2, // Sarah Martin
      type: 'project_updated',
      description: 'A mis à jour la progression du projet "Site E-commerce Premium"',
      data: {
        projectId: 1,
        oldProgress: 70,
        newProgress: 75
      },
      timestamp: '2024-01-20T14:30:00Z'
    }
  ],

  // ===== MÉTRIQUES =====
  metrics: {
    projects: {
      total: 6,
      active: 4,
      completed: 2,
      delayed: 1,
      onTime: 3
    },
    tasks: {
      total: 3,
      completed: 0,
      inProgress: 2,
      notStarted: 1,
      overdue: 0
    },
    users: {
      total: 5,
      active: 5,
      inactive: 0,
      online: 3
    },
    performance: {
      averageProjectProgress: 77,
      averageTaskCompletion: 67,
      teamProductivity: 85,
      customerSatisfaction: 92
    }
  }
};

// Fonctions utilitaires pour la simulation
export const generateId = () => Math.floor(Math.random() * 1000000) + 1;

export const getCurrentTimestamp = () => new Date().toISOString();

export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getStatusColor = (status) => {
  const colors = {
    'not_started': '#6c757d',
    'in_progress': '#007bff',
    'completed': '#28a745',
    'almost_complete': '#17a2b8',
    'on_hold': '#ffc107',
    'cancelled': '#dc3545'
  };
  return colors[status] || '#6c757d';
};

export const getPriorityColor = (priority) => {
  const colors = {
    'low': '#28a745',
    'medium': '#ffc107',
    'high': '#dc3545',
    'critical': '#721c24'
  };
  return colors[priority] || '#6c757d';
};
