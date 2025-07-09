# 🎫 SAMPLE TICKETS DATABASE DOCUMENTATION

## Overview
This document contains all the sample data that has been created for the Automated Ticket Distribution System.

## 👥 SAMPLE USERS

### 1. Customer Users
```
1. John Customer
   - Email: customer@company.com
   - Password: customer123
   - Role: customer
   - Organization: ABC Company

2. Test Customer2
   - Email: customer2@company.com
   - Password: customer123
   - Role: customer
   - Organization: Tech Corp
```

### 2. Agent Users
```
1. Jane Agent
   - Email: agent@company.com
   - Password: agent123
   - Role: agent
   - Skills: backend-development, database, system-administration
   - Experience: 5 years

2. Support Agent
   - Email: support@company.com
   - Password: agent123
   - Role: agent
   - Skills: customer-service, technical-support, troubleshooting
   - Experience: 2 years
```

### 3. Admin User
```
1. Admin User
   - Email: admin@company.com
   - Password: admin123
   - Role: admin
```

## 🎫 SAMPLE TICKETS

### 1. Login Issues - Cannot Access Dashboard
- **Status:** new
- **Priority:** high
- **Type:** incident
- **Customer:** customer@company.com (ABC Company)
- **Assigned Agent:** Unassigned
- **Description:** User unable to log into account, getting "Invalid credentials" error
- **Tags:** login, authentication, urgent
- **Security Restricted:** No

### 2. Database Connection Timeout
- **Status:** assigned
- **Priority:** critical
- **Type:** incident
- **Customer:** customer@company.com (ABC Company)
- **Assigned Agent:** agent@company.com
- **Description:** Frequent database timeouts during peak hours
- **Tags:** database, timeout, performance, critical
- **Security Restricted:** Yes

### 3. Feature Request - Dark Mode
- **Status:** in_progress
- **Priority:** low
- **Type:** request
- **Customer:** customer2@company.com (Tech Corp)
- **Assigned Agent:** support@company.com
- **Description:** Request to add dark mode support to the application
- **Tags:** feature-request, ui, enhancement
- **Security Restricted:** No

### 4. Email Notifications Not Working
- **Status:** waiting_customer
- **Priority:** medium
- **Type:** problem
- **Customer:** customer@company.com (ABC Company)
- **Assigned Agent:** agent@company.com
- **Description:** Users not receiving email notifications, SMTP configuration issue
- **Tags:** email, notifications, smtp
- **Security Restricted:** No

### 5. Security Vulnerability - SQL Injection
- **Status:** resolved
- **Priority:** critical
- **Type:** incident
- **Customer:** customer2@company.com (Tech Corp)
- **Assigned Agent:** agent@company.com
- **Description:** Potential SQL injection vulnerability in search functionality
- **Tags:** security, vulnerability, sql-injection, critical
- **Security Restricted:** Yes
- **Rating:** 5/5

### 6. Mobile App Crashes on Startup
- **Status:** closed
- **Priority:** high
- **Type:** incident
- **Customer:** customer@company.com (ABC Company)
- **Assigned Agent:** support@company.com
- **Description:** Mobile app crashes on Android 12+ devices
- **Tags:** mobile, crash, android, startup
- **Security Restricted:** No
- **Rating:** 4/5

### 7. Performance Issues During Peak Hours
- **Status:** new
- **Priority:** high
- **Type:** problem
- **Customer:** customer2@company.com (Tech Corp)
- **Assigned Agent:** Unassigned
- **Description:** System slow during peak hours, page load times >10 seconds
- **Tags:** performance, slow, peak-hours, optimization
- **Security Restricted:** No

### 8. Data Export Feature Not Working
- **Status:** assigned
- **Priority:** medium
- **Type:** incident
- **Customer:** customer@company.com (ABC Company)
- **Assigned Agent:** support@company.com
- **Description:** CSV export feature not working, button shows loading but never completes
- **Tags:** export, csv, data, functionality
- **Security Restricted:** No

## 📊 TICKET STATISTICS

### By Status:
- new: 2 tickets
- assigned: 2 tickets
- in_progress: 1 ticket
- waiting_customer: 1 ticket
- resolved: 1 ticket
- closed: 1 ticket

### By Priority:
- low: 1 ticket
- medium: 2 tickets
- high: 3 tickets
- critical: 2 tickets

### By Type:
- incident: 6 tickets
- request: 1 ticket
- problem: 2 tickets

### By Customer:
- ABC Company (customer@company.com): 5 tickets
- Tech Corp (customer2@company.com): 3 tickets

### By Agent:
- agent@company.com: 3 tickets
- support@company.com: 3 tickets
- Unassigned: 2 tickets

## 🚀 USAGE INSTRUCTIONS

### To Create All Sample Data:
```bash
# Create sample tickets (includes users, customers, agents, and tickets)
node src/createSampleTickets.js
```

### To List All Tickets:
```bash
# View all created tickets with details
node src/listTickets.js
```

### To List All Users:
```bash
# View all users and their credentials
node src/listUsers.js
```

### To Start the Server:
```bash
# Start the main application server
node src/app.js

# Or start the test server with auto-user creation
node src/quickTestServer.js
```

### To Test Login:
```bash
# Test login functionality
node src/quickTestLogin.js
```

## 🎯 TESTING SCENARIOS

### 1. Customer Dashboard Testing:
- Login as: customer@company.com / customer123
- Should see: 5 tickets (various statuses)
- Can: Create new tickets, view ticket details, update status

### 2. Agent Dashboard Testing:
- Login as: agent@company.com / agent123
- Should see: 3 assigned tickets
- Can: Update ticket status, add notes, resolve tickets

### 3. Admin Dashboard Testing:
- Login as: admin@company.com / admin123
- Should see: All 8 tickets system-wide
- Can: Assign tickets, view analytics, manage users

### 4. Role-Based Access Testing:
- Verify customers only see their own tickets
- Verify agents see assigned tickets
- Verify admins see all tickets and analytics

## 🔧 TROUBLESHOOTING

### If No Tickets Appear:
1. Ensure MongoDB is running
2. Run the ticket creation script: `node src/createSampleTickets.js`
3. Check database connection in logs

### If Users Don't Exist:
1. Run user creation script: `node src/createQuickUsers.js`
2. Or the comprehensive script: `node src/createSampleTickets.js`

### If Login Fails:
1. Use exact credentials from this documentation
2. Ensure backend server is running: `node src/app.js`
3. Test with debug script: `node src/quickTestLogin.js`
