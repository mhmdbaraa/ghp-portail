# Guide des Requirements - GHP Portail

## 📋 Vue d'Ensemble

Le projet GHP Portail utilise plusieurs fichiers de requirements pour gérer les dépendances selon l'environnement :

- `requirements.txt` - **Requirements complets** (développement + production)
- `requirements-dev.txt` - **Développement uniquement** (outils avancés)
- `requirements-prod.txt` - **Production uniquement** (optimisé)

## 🚀 Installation

### Installation Complète (Recommandée)
```bash
# Installation de toutes les dépendances
pip install -r requirements.txt
```

### Installation Développement
```bash
# Installation avec outils de développement
pip install -r requirements-dev.txt
```

### Installation Production
```bash
# Installation optimisée pour la production
pip install -r requirements-prod.txt
```

## 📦 Catégories de Dépendances

### 🔧 Django Core & Framework
- **Django 5.2.7** - Framework principal
- **djangorestframework** - API REST
- **djangorestframework-simplejwt** - Authentification JWT
- **django-cors-headers** - Gestion CORS
- **django-filter** - Filtrage des données

### 🗄️ Base de Données
- **SQLite** - Développement (inclus avec Python)
- **mysqlclient** - MySQL (production)
- **psycopg2-binary** - PostgreSQL (alternative)

### 📧 Email & Notifications
- **SMTP** - Envoi d'emails (inclus avec Django)
- **Système personnalisé** - Notifications GHP Portail

### 🎨 Frontend & Assets
- **whitenoise** - Gestion des fichiers statiques
- **Pillow** - Traitement d'images

### 🔒 Sécurité
- **cryptography** - Chiffrement
- **bcrypt** - Hachage des mots de passe
- **argon2-cffi** - Hachage sécurisé

### ⚡ Performance & Cache
- **redis** - Cache et sessions
- **django-redis** - Intégration Redis
- **django-cachalot** - Cache automatique

### 📊 Monitoring & Logging
- **sentry-sdk** - Monitoring des erreurs
- **structlog** - Logging structuré
- **django-prometheus** - Métriques

### 🧪 Testing (Développement)
- **pytest** - Framework de tests
- **pytest-django** - Tests Django
- **pytest-cov** - Couverture de code
- **factory-boy** - Génération de données de test

### 🛠️ Outils de Développement
- **django-debug-toolbar** - Debug toolbar
- **django-extensions** - Extensions Django
- **black** - Formatage de code
- **flake8** - Linting
- **isort** - Tri des imports

### 🚀 Production
- **gunicorn** - Serveur WSGI
- **waitress** - Serveur WSGI (Windows)
- **uvicorn** - Serveur ASGI

## 🔧 Configuration par Environnement

### Développement
```bash
# Variables d'environnement
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST=172.16.0.25
EMAIL_HOST_USER=GHPportail@groupehdyrapahrm.com
EMAIL_HOST_PASSWORD=your-password
```

### Production
```bash
# Variables d'environnement
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=mysql://user:password@host:port/database
EMAIL_HOST=172.16.0.25
EMAIL_HOST_USER=GHPportail@groupehdyrapahrm.com
EMAIL_HOST_PASSWORD=your-production-password
REDIS_URL=redis://localhost:6379/0
SENTRY_DSN=your-sentry-dsn
```

## 📋 Commandes Utiles

### Installation
```bash
# Créer un environnement virtuel
python -m venv project_env

# Activer l'environnement (Windows)
project_env\Scripts\activate

# Activer l'environnement (Linux/Mac)
source project_env/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### Migration & Setup
```bash
# Migrations de base de données
python manage.py migrate

# Collecte des fichiers statiques
python manage.py collectstatic

# Création d'un superutilisateur
python manage.py createsuperuser
```

### Tests
```bash
# Tests complets
pytest

# Tests avec couverture
pytest --cov

# Tests spécifiques
pytest tests/test_notifications.py
```

### Code Quality
```bash
# Formatage du code
black .

# Tri des imports
isort .

# Linting
flake8

# Vérification des types
mypy .
```

### Sécurité
```bash
# Audit de sécurité
bandit -r .

# Vérification des vulnérabilités
safety check
```

## 🐳 Docker (Optionnel)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "projecttracker.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=mysql://user:password@db:3306/ghp_portail
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ghp_portail
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: rootpassword

  redis:
    image: redis:7-alpine
```

## 🔍 Dépannage

### Problèmes Courants

1. **Erreur MySQL sur Windows**
   ```bash
   # Installer les outils de build
   pip install --only-binary=all mysqlclient
   ```

2. **Erreur Pillow**
   ```bash
   # Installer les dépendances système
   pip install --upgrade pip
   pip install Pillow
   ```

3. **Erreur Redis**
   ```bash
   # Vérifier que Redis est installé et démarré
   redis-server
   ```

4. **Erreur de permissions**
   ```bash
   # Sur Linux/Mac
   sudo pip install -r requirements.txt
   ```

### Vérification de l'Installation
```bash
# Vérifier Django
python manage.py check

# Vérifier les dépendances
pip check

# Lister les packages installés
pip list
```

## 📚 Ressources

- [Documentation Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Gunicorn Documentation](https://gunicorn.org/)

## 🆘 Support

Pour toute question sur les requirements :
1. Vérifiez la version de Python (>= 3.8)
2. Consultez les logs d'installation
3. Vérifiez les variables d'environnement
4. Contactez l'équipe de développement

---

**Le système de requirements est maintenant complet et optimisé pour tous les environnements !** 🎉








