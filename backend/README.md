# Project Tracker Django Backend

A Django REST Framework backend for the Project Tracker application with JWT authentication.

## Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Custom User Model**: Extended user model with roles and permissions
- **Project Management**: Full CRUD operations for projects with team management
- **Task Management**: Complete task lifecycle with time tracking
- **Role-based Access Control**: Different permission levels for admin, manager, and users
- **RESTful API**: Well-structured API endpoints following REST conventions
- **CORS Support**: Configured for React frontend integration

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip (Python package installer)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user-info/` - Get current user info
- `PATCH /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `GET /api/projects/statistics/` - Get project statistics
- `GET /api/projects/{id}/statistics/` - Get specific project statistics
- `POST /api/projects/{id}/add_team_member/` - Add team member
- `DELETE /api/projects/{id}/remove_team_member/` - Remove team member

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `GET /api/tasks/statistics/` - Get task statistics
- `POST /api/tasks/{id}/assign/` - Assign task to user
- `POST /api/tasks/{id}/change_status/` - Change task status

### Comments and Attachments
- `GET /api/projects/{id}/comments/` - Get project comments
- `POST /api/projects/{id}/comments/` - Create project comment
- `GET /api/tasks/{id}/comments/` - Get task comments
- `POST /api/tasks/{id}/comments/` - Create task comment
- `GET /api/projects/{id}/attachments/` - Get project attachments
- `POST /api/projects/{id}/attachments/` - Upload project attachment
- `GET /api/tasks/{id}/attachments/` - Get task attachments
- `POST /api/tasks/{id}/attachments/` - Upload task attachment

### Time Tracking
- `GET /api/tasks/{id}/time-entries/` - Get task time entries
- `POST /api/tasks/{id}/time-entries/` - Create time entry

## User Roles and Permissions

### Admin
- Full access to all projects and tasks
- User management capabilities
- All CRUD operations

### Manager
- Manage projects they own or are part of
- Create and assign tasks
- View team members
- Limited user management

### Developer/Designer/Tester
- View assigned projects and tasks
- Update task status and time entries
- Add comments and attachments
- Limited project visibility

### User
- Basic read access to assigned projects and tasks
- Add comments
- View own time entries

## Authentication Flow

1. **Login**: Send credentials to `/api/auth/login/`
2. **Receive Tokens**: Get access and refresh tokens
3. **API Calls**: Include access token in Authorization header: `Bearer <token>`
4. **Token Refresh**: Use refresh token when access token expires
5. **Logout**: Blacklist refresh token

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

## Database

The application uses SQLite by default for development. For production, configure PostgreSQL or MySQL in settings.py.

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)

## Testing

Run tests with:
```bash
python manage.py test
```

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper database
3. Set up static file serving
4. Use environment variables for sensitive data
5. Configure proper CORS origins
6. Use a production WSGI server like Gunicorn

## API Documentation

Once the server is running, you can access the Django REST Framework browsable API at:
`http://localhost:8000/api/`

## Frontend Integration

The React frontend should be configured to:
1. Point to `http://localhost:8000/api/` for API calls
2. Include JWT tokens in Authorization headers
3. Handle token refresh automatically
4. Store tokens in localStorage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured for your frontend URL
2. **Token Expired**: Implement automatic token refresh
3. **Permission Denied**: Check user roles and permissions
4. **Database Errors**: Run migrations and check database configuration

### Logs

Check Django logs for detailed error information:
```bash
python manage.py runserver --verbosity=2
```


