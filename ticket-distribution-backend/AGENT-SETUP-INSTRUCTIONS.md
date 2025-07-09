# Agent Setup and Testing Instructions

## Quick Start

1. **Start the backend server:**
   ```
   npm start
   ```
   OR use the batch file:
   ```
   start-with-agents.bat
   ```

2. **Create default agents:**
   After server is running, call the setup endpoint:
   ```
   node call-setup-agents.js
   ```
   OR make a POST request to:
   ```
   http://localhost:3000/api/auth/setup-agents
   ```

3. **Test agent login:**
   ```
   node test-agent-logins.js
   ```

## Default Agent Credentials

| Role  | Email                        | Password  |
|-------|------------------------------|-----------|
| Agent | agent@company.com            | agent123  |
| Agent | sarah.support@company.com    | agent123  |
| Admin | admin@company.com            | admin123  |

## Agent Dashboard Features

The agent dashboard includes:
- ✅ View assigned tickets
- ✅ Update ticket status
- ✅ Change ticket priority  
- ✅ Add comments to tickets
- ✅ Escalate tickets
- ✅ View aging analytics
- ✅ See escalated tickets
- ✅ Export reports (JSON/CSV)
- ✅ Assign available tickets to self

## API Endpoints

### Authentication
- `POST /api/auth/login` - Agent login
- `POST /api/auth/setup-agents` - Create default agents

### Tickets (Agent specific)
- `GET /api/tickets/agent/my-tickets` - Get assigned tickets
- `GET /api/tickets/agent/unassigned` - Get available tickets
- `POST /api/tickets/:id/assign` - Assign ticket to self
- `POST /api/tickets/:id/comment` - Add comment
- `POST /api/tickets/:id/escalate` - Escalate ticket
- `PUT /api/tickets/:id` - Update ticket

## Frontend Routing

- `/agent-dashboard` - Main agent dashboard
- `/dashboard` - Customer dashboard (agents auto-redirected)

## Troubleshooting

1. **MongoDB not running:**
   ```
   net start MongoDB
   ```

2. **No agents in database:**
   ```
   node call-setup-agents.js
   ```

3. **Login fails:**
   - Check if user exists: `node test-agent-logins.js`
   - Verify credentials match table above
   - Check server logs for errors

4. **Agent dashboard not loading:**
   - Verify Angular app is running: `ng serve`
   - Check browser console for errors
   - Ensure role-based routing is working

## Files Created

Backend:
- `setupAgents.js` - Agent creation logic
- `call-setup-agents.js` - Setup endpoint caller
- `test-agent-logins.js` - Login tester
- `start-with-agents.bat` - Quick start script

Frontend:
- Updated `auth.service.ts` with role-based routing
- Enhanced `agent-dashboard.component.ts` with full functionality
- Updated `app.routes.ts` with agent dashboard route
