# Ticket Distribution Backend

A Node.js/Express backend for the Automated Ticket Dispatcher system with MongoDB.

## Features

- User authentication (JWT-based)
- Role-based access control (customer, agent, admin)
- Ticket CRUD operations
- Ticket statistics and analytics
- Automatic Customer/Agent profile creation

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- npm

### Installation
```bash
npm install
```

### Setup Database
1. Start MongoDB:
   ```bash
   # Windows Service
   net start MongoDB
   
   # Or manual start
   mongod --dbpath "C:\data\db"
   ```

2. Create missing profiles for existing users:
   ```bash
   node src/createMissingProfiles.js
   ```

### Start Server
```bash
npm start
```

Or use the automated fix script:
```bash
# Windows Batch
fix-and-start.bat

# Windows PowerShell  
fix-and-start.ps1
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Tickets (Authenticated)
- `GET /api/tickets` - Get customer tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Ticket Statistics
- `GET /api/tickets/stats/dashboard` - Dashboard stats
- `GET /api/tickets/stats/aging` - Ticket aging stats

### Public Endpoints (No Auth)
- `GET /api/tickets/public` - All tickets
- `GET /api/tickets/stats/public` - Public stats

## User Credentials

All users have password: `password123`

**Customers:**
- customer1@example.com
- customer2@example.com

**Agents:**
- agent1@example.com
- agent2@example.com

**Admin:**
- admin1@example.com

## Testing

Run comprehensive endpoint tests:
```bash
node src/testTicketEndpoints.js
```

## Troubleshooting

### 404 "Customer profile not found"
This has been fixed! The system now automatically creates Customer/Agent profiles. Run:
```bash
node src/createMissingProfiles.js
```

### Connection Issues
1. Verify MongoDB is running: `netstat -an | findstr :27017`
2. Verify server is running: `netstat -an | findstr :3000`
3. Check logs for database connection errors

## Project Structure

```
src/
├── app.js              # Main server file
├── models/             # Database models
│   ├── User.js
│   ├── Customer.js
│   ├── Agent.js
│   └── Ticket.js
├── routes/             # API routes
│   ├── auth.js
│   └── tickets.js
└── db/
    └── connect.js      # Database connection
```

## Documentation

- [Complete 404 Fix Guide](COMPLETE_404_FIX.md)
- [User Credentials](USER_CREDENTIALS.md)
- [Sample Data Documentation](SAMPLE_DATA_DOCUMENTATION.md)
- [Login Troubleshooting](LOGIN_TROUBLESHOOTING.md)

## Environment Variables

Create a `.env` file:
```
JWT_SECRET=your-secret-key
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ticket-system
```
