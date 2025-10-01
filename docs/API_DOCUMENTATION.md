# Documentation API GHP Portail

## Vue d'ensemble

Cette documentation décrit l'API REST du système GHP Portail. L'API permet de gérer tous les modules d'entreprise, utilisateurs, équipes et notifications.

**Base URL:** `https://api.ghpportail.com/v1`

**Authentification:** JWT Bearer Token

## Authentification

### Connexion

**POST** `/auth/login`

Authentifie un utilisateur et retourne un token JWT.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@ghpportail.com",
      "name": "Admin Principal",
      "role": "admin",
      "avatar": "https://i.pravatar.cc/150?img=1",
      "permissions": ["all"],
      "preferences": {
        "theme": "light",
        "language": "fr",
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        }
      }
    },
    "tokens": {
      "access": "fake_jwt_1_1705756800000",
      "refresh": "fake_refresh_1_1705756800000",
      "expiresIn": 3600
    }
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

#### Response Error (401)
```json
{
  "success": false,
  "data": null,
  "error": "Mot de passe incorrect",
  "message": "Erreur lors de l'opération",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Inscription

**POST** `/auth/register`

Crée un nouveau compte utilisateur.

#### Request Body
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Nouvel Utilisateur"
}
```

#### Response Success (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 6,
      "username": "newuser",
      "email": "newuser@example.com",
      "name": "Nouvel Utilisateur",
      "role": "developer",
      "permissions": ["task_manage", "project_view"]
    },
    "tokens": {
      "access": "fake_jwt_6_1705756800000",
      "refresh": "fake_refresh_6_1705756800000",
      "expiresIn": 3600
    }
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Projets

### Récupérer tous les projets

**GET** `/projects`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Site E-commerce Premium",
      "description": "Développement d'une plateforme e-commerce moderne",
      "status": "in_progress",
      "priority": "high",
      "category": "Web",
      "budget": 25000,
      "spent": 18750,
      "startDate": "2024-01-01",
      "deadline": "2024-02-15",
      "progress": 75,
      "manager": {
        "id": 2,
        "name": "Sarah Martin",
        "role": "project_manager"
      },
      "team": [
        {
          "id": 2,
          "name": "Sarah Martin",
          "role": "project_manager"
        },
        {
          "id": 3,
          "name": "John Doe",
          "role": "developer"
        }
      ],
      "tags": ["e-commerce", "web", "responsive"],
      "technologies": ["React", "Node.js", "MongoDB"],
      "createdAt": "2024-01-01T09:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    }
  ],
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Récupérer un projet spécifique

**GET** `/projects/{id}`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Site E-commerce Premium",
    "description": "Développement d'une plateforme e-commerce moderne",
    "status": "in_progress",
    "priority": "high",
    "category": "Web",
    "budget": 25000,
    "spent": 18750,
    "startDate": "2024-01-01",
    "deadline": "2024-02-15",
    "progress": 75,
    "manager": {
      "id": 2,
      "name": "Sarah Martin",
      "role": "project_manager"
    },
    "team": [
      {
        "id": 2,
        "name": "Sarah Martin",
        "role": "project_manager"
      }
    ],
    "milestones": [
      {
        "id": 1,
        "name": "Design UI/UX",
        "description": "Création des maquettes et prototypes",
        "dueDate": "2024-01-10",
        "status": "completed",
        "progress": 100
      }
    ],
    "risks": [
      {
        "id": 1,
        "description": "Intégration des paiements Stripe",
        "level": "medium",
        "mitigation": "Tests approfondis et documentation API"
      }
    ],
    "documents": [
      {
        "id": 1,
        "name": "Cahier des charges",
        "type": "pdf",
        "url": "/documents/projet-1-cahier-charges.pdf",
        "uploadedBy": 2,
        "uploadDate": "2024-01-01"
      }
    ],
    "createdAt": "2024-01-01T09:00:00Z",
    "updatedAt": "2024-01-20T14:30:00Z"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Créer un nouveau projet

**POST** `/projects`

**Headers:** `Authorization: Bearer {token}`

#### Request Body
```json
{
  "name": "Nouveau Projet",
  "description": "Description du nouveau projet",
  "status": "not_started",
  "priority": "medium",
  "category": "Web",
  "budget": 15000,
  "startDate": "2024-02-01",
  "deadline": "2024-04-01",
  "manager": 2,
  "team": [2, 3, 4],
  "tags": ["web", "react"],
  "technologies": ["React", "Node.js"]
}
```

#### Response Success (201)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Nouveau Projet",
    "description": "Description du nouveau projet",
    "status": "not_started",
    "priority": "medium",
    "category": "Web",
    "budget": 15000,
    "spent": 0,
    "startDate": "2024-02-01",
    "deadline": "2024-04-01",
    "progress": 0,
    "manager": 2,
    "team": [2, 3, 4],
    "tags": ["web", "react"],
    "technologies": ["React", "Node.js"],
    "createdAt": "2024-01-20T15:00:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Mettre à jour un projet

**PUT** `/projects/{id}`

**Headers:** `Authorization: Bearer {token}`

#### Request Body
```json
{
  "progress": 80,
  "status": "in_progress",
  "spent": 20000
}
```

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Site E-commerce Premium",
    "progress": 80,
    "status": "in_progress",
    "spent": 20000,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Supprimer un projet

**DELETE** `/projects/{id}`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Site E-commerce Premium",
    "status": "deleted"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Tâches

### Récupérer toutes les tâches

**GET** `/tasks`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Révision du design final e-commerce",
      "description": "Finaliser les maquettes UI/UX",
      "project": {
        "id": 1,
        "name": "Site E-commerce Premium"
      },
      "assignee": {
        "id": 4,
        "name": "Emma Wilson",
        "role": "designer"
      },
      "reporter": {
        "id": 2,
        "name": "Sarah Martin",
        "role": "project_manager"
      },
      "status": "in_progress",
      "priority": "high",
      "type": "design",
      "estimatedTime": 4,
      "actualTime": 2.5,
      "remainingTime": 1.5,
      "startDate": "2024-01-18",
      "dueDate": "2024-01-25",
      "tags": ["design", "ui/ux", "e-commerce"],
      "subtasks": [
        {
          "id": 1,
          "title": "Page produit",
          "status": "completed",
          "progress": 100
        }
      ],
      "createdAt": "2024-01-18T09:00:00Z",
      "updatedAt": "2024-01-20T11:30:00Z"
    }
  ],
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Créer une nouvelle tâche

**POST** `/tasks`

**Headers:** `Authorization: Bearer {token}`

#### Request Body
```json
{
  "title": "Nouvelle Tâche",
  "description": "Description de la nouvelle tâche",
  "project": 1,
  "assignee": 3,
  "reporter": 2,
  "status": "not_started",
  "priority": "medium",
  "type": "development",
  "estimatedTime": 8,
  "startDate": "2024-01-25",
  "dueDate": "2024-02-01",
  "tags": ["development", "frontend"]
}
```

#### Response Success (201)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Nouvelle Tâche",
    "description": "Description de la nouvelle tâche",
    "project": 1,
    "assignee": 3,
    "reporter": 2,
    "status": "not_started",
    "priority": "medium",
    "type": "development",
    "estimatedTime": 8,
    "actualTime": 0,
    "remainingTime": 8,
    "startDate": "2024-01-25",
    "dueDate": "2024-02-01",
    "tags": ["development", "frontend"],
    "createdAt": "2024-01-20T15:00:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Notifications

### Récupérer les notifications

**GET** `/notifications`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "task_assigned",
      "title": "Nouvelle tâche assignée",
      "message": "La tâche 'Révision du design final e-commerce' vous a été assignée",
      "data": {
        "taskId": 1,
        "projectId": 1,
        "assigneeId": 4
      },
      "read": false,
      "priority": "medium",
      "createdAt": "2024-01-20T09:00:00Z",
      "expiresAt": "2024-01-27T09:00:00Z"
    }
  ],
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

### Marquer une notification comme lue

**PUT** `/notifications/read/{id}`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "read": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Dashboard

### Récupérer les données du dashboard

**GET** `/dashboard`

**Headers:** `Authorization: Bearer {token}`

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "metrics": {
      "projects": {
        "total": 3,
        "active": 3,
        "completed": 0,
        "delayed": 0,
        "onTime": 3
      },
      "tasks": {
        "total": 3,
        "completed": 0,
        "inProgress": 2,
        "notStarted": 1,
        "overdue": 0
      },
      "users": {
        "total": 5,
        "active": 5,
        "inactive": 0,
        "online": 3
      },
      "performance": {
        "averageProjectProgress": 77,
        "averageTaskCompletion": 67,
        "teamProductivity": 85,
        "customerSatisfaction": 92
      }
    },
    "recentProjects": [
      {
        "id": 1,
        "name": "Site E-commerce Premium",
        "progress": 75,
        "status": "in_progress"
      }
    ],
    "upcomingTasks": [
      {
        "id": 1,
        "title": "Révision du design final e-commerce",
        "dueDate": "2024-01-25",
        "priority": "high"
      }
    ],
    "recentActivities": [
      {
        "id": 1,
        "userId": 2,
        "type": "project_created",
        "description": "A créé le projet 'Site E-commerce Premium'",
        "timestamp": "2024-01-01T09:00:00Z"
      }
    ]
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Recherche et Filtrage

### Rechercher des projets

**GET** `/projects/search?q={query}&status={status}&priority={priority}&category={category}&sortBy={sortBy}`

**Headers:** `Authorization: Bearer {token}`

#### Paramètres de requête
- `q`: Texte de recherche
- `status`: Filtre par statut (not_started, in_progress, completed, etc.)
- `priority`: Filtre par priorité (low, medium, high, critical)
- `category`: Filtre par catégorie (Web, Mobile, Design, etc.)
- `sortBy`: Tri (name, deadline, progress, priority)

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Site E-commerce Premium",
      "status": "in_progress",
      "priority": "high",
      "progress": 75
    }
  ],
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Codes d'erreur

### Erreurs HTTP communes

- **400 Bad Request**: Données de requête invalides
- **401 Unauthorized**: Token d'authentification manquant ou invalide
- **403 Forbidden**: Permissions insuffisantes
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur interne

### Format des erreurs

```json
{
  "success": false,
  "data": null,
  "error": "Description de l'erreur",
  "message": "Message d'erreur utilisateur",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Pagination

Pour les endpoints qui retournent des listes, la pagination est supportée via les paramètres de requête :

**GET** `/projects?page={page}&limit={limit}`

- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20, max: 100)

#### Response avec pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Opération réussie",
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

## Rate Limiting

L'API applique des limites de taux pour prévenir l'abus :

- **Authentifié**: 1000 requêtes par heure
- **Non authentifié**: 100 requêtes par heure

#### Headers de rate limiting
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705760400
```

## Webhooks

L'API supporte les webhooks pour les événements en temps réel :

### Événements disponibles
- `project.created`
- `project.updated`
- `project.deleted`
- `task.created`
- `task.updated`
- `task.completed`
- `user.joined`
- `notification.sent`

### Configuration webhook
```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["project.created", "task.completed"],
  "secret": "webhook_secret_key"
}
```

## Support et Contact

Pour toute question concernant l'API :

- **Documentation**: https://docs.ghpportail.com
- **Support**: api-support@ghpportail.com
- **Statut API**: https://status.ghpportail.com

