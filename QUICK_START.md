# 🚀 Quick Start Guide - Customer Ticket Management System

## ✅ System Status
Both servers are now running successfully!

### 🔗 Access URLs
- **Frontend (UI):** http://localhost:4201
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

## 👥 Test User Credentials

### Customer Users (Full Ticket Management)
```
Email: pooja@example.com
Password: password123
Organization: Tech Solutions Pvt Ltd

Email: dipti@example.com  
Password: password123
Organization: Digital Marketing Agency

Email: anuj@example.com
Password: password123
Organization: E-commerce Solutions
```

### Agent Users
```
Email: ashwini@example.com
Password: password123

Email: datta@example.com
Password: password123

Email: amar@example.com
Password: password123
```

### Admin User
```
Email: bhavanjay@example.com
Password: password123
```

## 🎯 How to Test the System

### 1. Access the Frontend
- Open http://localhost:4201 in your browser
- You should see a login/register page

### 2. Login as a Customer
- Use any of the customer credentials above
- Click "Login"

### 3. Explore the Dashboard
- View your ticket statistics
- See all your existing tickets
- Use the action buttons to manage tickets

### 4. Create a New Ticket
- Click "Create New Ticket" button
- Fill in the form with:
  - Subject (required)
  - Description (required)
  - Category, Priority, Type, etc.
- Click "Create Ticket"

### 5. Manage Existing Tickets
- **View:** Click "View" to see ticket details
- **Edit:** Click "Edit" to modify ticket (if not closed)
- **Escalate:** Click "Escalate" and provide a reason
- **Delete:** Click "Delete" (only for new/assigned tickets)

### 6. View Analytics
- Click "Toggle Aging Chart" to see ticket aging distribution
- Check the statistics cards for real-time data

## 📊 Sample Data Available
- **15 diverse tickets** across 3 customers
- Various statuses: new, assigned, in_progress, waiting_customer, resolved
- Different priorities: low, medium, high, critical
- Realistic aging (1-30 days old)
- Some escalated tickets for testing

## 🔧 Features Available

### ✅ Customer Ticket Management
1. **Create Ticket** - Complete form with validation
2. **View Tickets** - List and individual views
3. **Update Ticket** - Edit existing tickets
4. **Delete Ticket** - Remove tickets (with restrictions)
5. **Escalate Ticket** - Escalate with reason
6. **View All Tickets** - Comprehensive listing
7. **Aging Graph** - Visual ticket age distribution

### ✅ Real-time Features
- Live statistics updates
- Dynamic status badges
- Priority indicators
- Interactive dashboard
- Responsive design

## 🔐 Security Features
- JWT-based authentication
- Protected routes
- Role-based access
- Input validation
- CORS enabled

## 🆘 Troubleshooting

### If Frontend Not Loading
1. Check if http://localhost:4201 is accessible
2. Restart using: `ng serve --port 4201`

### If Backend Not Responding
1. Check if http://localhost:3000/api/health returns {"status":"ok"}
2. Restart using: `node src/app.js`

### Both Servers Quick Restart
Run the batch file: `c:\hackton\automated-ticket-dispatcher\start-servers.bat`

---

## 🎉 Ready to Use!
The complete customer ticket management system is now fully functional and ready for testing!
