# 🚀 Agent Data Creation - ticket-distribution Database

## ⚠️ Database Name Correction
The correct database name is: **ticket-distribution** (not ticket_system)

## 🎯 Quick Start Options

### Option 1: Auto-Setup (Recommended)
1. **Run the auto-setup server:**
   ```bash
   start-with-auto-setup.bat
   ```
   OR
   ```bash
   npm start
   ```
   
   The server will automatically create agents on startup!

### Option 2: Manual HTTP Setup
1. Start server: `npm start`
2. Call setup endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/auth/setup-agents
   ```

### Option 3: Manual Database Script (if Node.js has issues)
1. Open MongoDB Compass or mongo shell
2. Connect to: `mongodb://localhost:27017/ticket-distribution`
3. Run the script in: `manual-agent-creation.js`

## 🔑 Default Agent Credentials

| Role  | Email                        | Password  |
|-------|------------------------------|-----------|
| Agent | agent@company.com            | agent123  |
| Agent | sarah.support@company.com    | agent123  |
| Admin | admin@company.com            | admin123  |

## 📊 What Gets Created

### Users Table
- 3 agent/admin users with hashed passwords
- Proper role assignments (agent/admin)
- Full name and email information

### Agents Table  
- Complete agent profiles linked to users
- Skills: general-support, technical-support, billing, escalation
- Experience levels: 1-5 years
- Max tickets: 10-15 depending on role
- Availability status and workload tracking

## 🔧 Verification Steps

1. **Check if agents were created:**
   - Login to MongoDB Compass
   - Connect to `ticket-distribution` database
   - Check `users` and `agents` collections

2. **Test agent login:**
   - Start Angular frontend: `ng serve`
   - Navigate to login page
   - Use credentials from table above
   - Should redirect to `/agent-dashboard`

3. **Verify agent dashboard:**
   - Should see "My Tickets", "Available Tickets", "Escalated Tickets"
   - All agent functionality should work
   - Role-based routing should redirect agents away from customer dashboard

## 🐛 Troubleshooting

### MongoDB Issues
```bash
# Start MongoDB service
net start MongoDB

# Check if MongoDB is running
netstat -an | findstr :27017
```

### Database Connection Issues
- Verify database name is `ticket-distribution`
- Check connection string in `src/db/connect.js`
- Ensure MongoDB is running on port 27017

### Agent Creation Issues
- Check server console for error messages
- Verify models exist in `src/models/` directory
- Try manual creation via HTTP endpoint

### Login Issues
- Verify users exist in database
- Check password hashing (bcrypt)
- Ensure JWT token generation works
- Check browser console for frontend errors

## 🎉 Success Indicators

✅ **Server Output:**
```
✅ MongoDB connected successfully
Database: ticket-distribution
🔧 Setting up default agents...
✅ Created user: agent@company.com
✅ Created agent profile for: agent@company.com
...
✅ Default agents setup completed
```

✅ **Agent Login:**
- Login with agent@company.com / agent123
- Redirected to `/agent-dashboard`
- Dashboard shows agent-specific features

✅ **Database Check:**
- `users` collection has 3+ entries
- `agents` collection has 3+ entries  
- All agents have proper skills and profiles

## 📁 Files Created

- `setupAgents.js` - Agent creation logic
- `start-with-auto-setup.bat` - Auto-setup server startup
- `manual-agent-creation.js` - MongoDB script fallback
- `push-agents-correct-db.js` - Standalone creation script

The system should now have working agent login with the correct database name!
