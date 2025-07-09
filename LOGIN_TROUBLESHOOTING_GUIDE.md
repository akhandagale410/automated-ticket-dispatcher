# 🚨 LOGIN ERROR TROUBLESHOOTING GUIDE

## Problem: 400 Bad Request on POST /api/auth/login

### 🔍 Root Cause Analysis
The 400 Bad Request error typically occurs due to:
1. **Missing users in database** - No test users exist
2. **MongoDB not running** - Database connection failed
3. **Invalid request payload** - Missing email/password
4. **Server not properly started** - Auth routes not loaded

### 🛠️ QUICK FIX SOLUTION

#### Step 1: Start MongoDB (if not running)
```bash
# Windows - Start MongoDB service
net start MongoDB

# Or manually start mongod
mongod --dbpath C:\data\db
```

#### Step 2: Seed Database with Test Users
```bash
cd ticket-distribution-backend
node src/createQuickUsers.js
```

#### Step 3: Start Server with Enhanced Logging
```bash
node src/app.js
```

#### Step 4: Test Login Endpoint
```bash
# Test with curl or Postman
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@company.com","password":"customer123"}'
```

### 📋 Test Credentials Created

| Role | Email | Password | Expected Response |
|------|-------|----------|-------------------|
| **Customer** | customer@company.com | customer123 | 200 + token + user object |
| **Agent** | agent@company.com | agent123 | 200 + token + user object |
| **Admin** | admin@company.com | admin123 | 200 + token + user object |

### 🔧 Enhanced Error Handling Added

The auth routes now include:
- ✅ **Input validation** - Checks for missing email/password
- ✅ **Detailed logging** - Shows each step of login process
- ✅ **Database connection logging** - Confirms MongoDB status
- ✅ **User lookup logging** - Shows if user exists
- ✅ **Password validation logging** - Confirms password check

### 📊 Expected Login Flow

1. **Request received** → `🔍 Login attempt received`
2. **Input validation** → `Email and password are required` (if missing)
3. **User lookup** → `🔍 Looking for user with email: xxx`
4. **User found** → `✅ User found: John Doe (customer)`
5. **Password check** → `✅ Password valid, generating token`
6. **Success response** → `✅ Login successful for: xxx`

### 🚀 Quick Start Commands

```bash
# 1. Navigate to backend directory
cd c:\hackton\automated-ticket-dispatcher\ticket-distribution-backend

# 2. Create test users (run once)
node src/createQuickUsers.js

# 3. Start server
node src/app.js

# 4. In another terminal, test login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"customer@company.com\",\"password\":\"customer123\"}"
```

### 🎯 Frontend Testing

Once backend is working:
1. Start Angular frontend: `ng serve`
2. Go to: http://localhost:4200/login
3. Use test credentials above
4. Should auto-redirect to role-specific dashboard

### 💡 Common Issues & Solutions

#### Issue: "MongoDB connection error"
**Solution:** Start MongoDB service or install MongoDB

#### Issue: "User not found"
**Solution:** Run the user seeding script

#### Issue: "Invalid email or password"
**Solution:** Check exact credentials - case sensitive

#### Issue: "CORS error"
**Solution:** Server includes CORS middleware - should work

#### Issue: "Cannot POST /api/auth/login"
**Solution:** Check server is running on port 3000

### 📱 Test with Browser Developer Tools

1. Open browser to frontend login page
2. Open Developer Tools → Network tab
3. Attempt login
4. Check the request/response details
5. Look for specific error messages

### 🔍 Server Logs to Watch For

When starting the server, you should see:
```
🔍 Attempting to connect to MongoDB...
✅ MongoDB connected successfully
Database: ticket-distribution
Server running on port 3000
```

When attempting login, you should see:
```
🔍 Login attempt received
Request body: { email: "customer@company.com", password: "customer123" }
🔍 Looking for user with email: customer@company.com
✅ User found: Test Customer (customer)
✅ Password valid, generating token
✅ Login successful for: customer@company.com
```

### 🎯 Next Steps After Fix

1. ✅ Confirm login works for all three roles
2. ✅ Test role-based dashboard redirection
3. ✅ Verify pie chart displays in each dashboard
4. ✅ Test ticket CRUD operations per role
5. ✅ Confirm role-appropriate features show/hide correctly
