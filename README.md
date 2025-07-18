# Flowbit Multi-Tenant Platform

A comprehensive multi-tenant system demonstrating enterprise-grade architecture with tenant isolation, dynamic micro-frontend loading, and workflow integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Shell   │    │ Support Tickets │    │   n8n Engine    │
│   (Port 3000)   │    │   App (3002)    │    │   (Port 5678)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Node.js API   │
                    │   (Port 3001)   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   (Port 27017)  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd flowbit

# Start all services
docker-compose up -d

# Seed the database with demo data
node seed-script.js

# Access the application
# Shell App: http://localhost:3000
# API: http://localhost:3001
# n8n: http://localhost:5678 (admin/password)
```

### Option 2: Local Development
```bash
# Install dependencies for all packages
npm install

# Start MongoDB
docker-compose up -d mongodb

# Start API server
cd packages/api && npm start

# Start React shell (new terminal)
cd packages/shell && npm start

# Start Support Tickets app (new terminal)
cd packages/support-tickets-app && npm start

# Start n8n (new terminal)
docker-compose up -d n8n

# Seed database
node seed-script.js
```

## 🔐 Demo Credentials

### LogisticsCo Tenant
- **Admin**: admin@logisticsco.com / password123
- **User**: user@logisticsco.com / password123

### RetailGmbH Tenant
- **Admin**: admin@retailgmbh.com / password123
- **User**: user@retailgmbh.com / password123

## 📋 Core Features

### ✅ R1: Authentication & RBAC
- JWT-based authentication with tenant isolation
- Role-based access control (Admin/User)
- Secure middleware protecting admin routes
- Token validation and refresh

### ✅ R2: Tenant Data Isolation
- MongoDB collections with `customerId` field
- Strict tenant boundary enforcement
- Jest unit tests validating data isolation
- Cross-tenant access prevention

### ✅ R3: Use-Case Registry
- Configuration-driven screen registry in `registry.json`
- Dynamic tenant-specific screen loading
- REST API endpoint `/api/me/screens`
- Tenant-aware navigation system

### ✅ R4: Dynamic Navigation
- React shell with Module Federation
- Lazy-loaded micro-frontend components
- Responsive sidebar with tenant context
- Seamless navigation between modules

### ✅ R5: Workflow Integration
- n8n workflow engine integration
- Webhook-based workflow triggers
- Secure callback authentication
- Status updates via API webhooks

### ✅ R6: Containerized Development
- Complete Docker Compose setup
- Auto-configuring containers
- Development-ready environment
- No manual setup required

## 🧪 Testing

### Unit Tests
```bash
# Run tenant isolation tests
cd packages/api
npm test
```

### Integration Testing
```bash
# Test workflow integration
curl -X POST http://localhost:3001/api/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Ticket", "description": "Test workflow", "priority": "medium"}'
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - List tenant tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PATCH /api/tickets/:id/status` - Update ticket status (Admin only)

### Screens
- `GET /api/me/screens` - Get tenant-specific screens

### Webhooks
- `POST /webhook/ticket-done` - n8n workflow callback

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
MONGODB_URI=mongodb://admin:password@mongodb:27017/flowbit?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
WEBHOOK_SECRET=webhook-secret-shared-with-n8n

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3001
```

### Registry Configuration
The `registry.json` file defines tenant-specific screens:
```json
{
  "tenants": {
    "logisticsco": {
      "name": "LogisticsCo",
      "screens": [
        {
          "id": "support-tickets",
          "name": "Support Tickets",
          "url": "http://localhost:3002/remoteEntry.js",
          "module": "./SupportTicketsApp",
          "path": "/tickets"
        }
      ]
    }
  }
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **RBAC**: Role-based access control with Admin/User roles
- **Tenant Isolation**: Strict data separation between tenants
- **Input Validation**: Joi-based request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS headers
- **Helmet Security**: Security headers via Helmet middleware

## 📝 Known Limitations

1. **Webhook Testing**: Local webhook testing requires ngrok or similar tunneling
2. **n8n Workflows**: Manual workflow setup required in n8n interface
3. **Database Migrations**: No automated migration system implemented
4. **Monitoring**: No built-in monitoring or logging system
5. **Scaling**: Single-instance deployment, not horizontally scalable

## 🔄 Development Workflow

1. **Code Changes**: Make changes to relevant packages
2. **Testing**: Run unit tests and integration tests
3. **Build**: Docker automatically rebuilds on code changes
4. **Deploy**: Use `docker-compose up` for full environment

## 📚 Next Steps

For production deployment, consider:
- Implementing database migrations
- Adding comprehensive monitoring
- Setting up CI/CD pipelines
- Implementing horizontal scaling
- Adding comprehensive audit logging
- Implementing WebSocket real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
