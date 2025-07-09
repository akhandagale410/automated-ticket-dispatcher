# 🔑 LOGIN CREDENTIALS FOR ALL USERS

## Sample Users in Database

### 1. CUSTOMER USER
- **Name:** John Customer
- **Email:** `customer@company.com`
- **Password:** `customer123`
- **Role:** `customer`
- **Dashboard:** `/dashboard`

### 2. AGENT USER
- **Name:** Jane Agent
- **Email:** `agent@company.com`
- **Password:** `agent123`
- **Role:** `agent`
- **Dashboard:** `/agent-dashboard`

### 3. ADMIN USER
- **Name:** Admin User
- **Email:** `admin@company.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Dashboard:** `/admin-dashboard`

### 4. ADDITIONAL CUSTOMER
- **Name:** Sarah Customer
- **Email:** `customer2@company.com`
- **Password:** `customer123`
- **Role:** `customer`
- **Dashboard:** `/dashboard`

### 5. SUPPORT AGENT
- **Name:** Support Agent
- **Email:** `support@company.com`
- **Password:** `agent123`
- **Role:** `agent`
- **Dashboard:** `/agent-dashboard`

## Quick Test Commands

### Test Customer Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@company.com","password":"customer123"}'
```

### Test Agent Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@company.com","password":"agent123"}'
```

### Test Admin Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Test Additional Customer Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer2@company.com","password":"customer123"}'
```

### Test Support Agent Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"support@company.com","password":"agent123"}'
```

## Frontend Login Testing

### Using Angular Frontend:
1. Start the Angular app: `ng serve`
2. Navigate to: `http://localhost:4200/login`
3. Use any of the credentials above
4. Should automatically redirect to the appropriate dashboard based on role

## Creating Users in Database

### Method 1: Using createQuickUsers.js
```bash
node src/createQuickUsers.js
```
This will:
- Clear existing users
- Create all 5 sample users
- Show confirmation with credentials

### Method 2: Using pushSampleUsers.js
```bash
node src/pushSampleUsers.js
```
This will:
- Keep existing users
- Add missing users only
- Show detailed verification

### Method 3: Using the test server
```bash
node src/userServer.js
```
This will:
- Start a server on port 3000
- Automatically create users on startup
- Provide API endpoints to manage users

## Verification

### Check users in database:
```bash
node src/listUsers.js
```

### Test login functionality:
```bash
node src/quickTestLogin.js
```

## Role-Based Dashboards

- **Customers** → `/dashboard` → Customer dashboard with ticket creation/viewing
- **Agents** → `/agent-dashboard` → Agent dashboard with ticket assignment/resolution  
- **Admins** → `/admin-dashboard` → Admin dashboard with system management

## Notes

- All passwords follow the pattern: `{role}123`
- Emails follow the pattern: `{role}@company.com`
- Users are automatically redirected to their appropriate dashboard after login
- JWT tokens are valid for 24 hours
- Passwords are hashed using bcrypt with 10 salt rounds
