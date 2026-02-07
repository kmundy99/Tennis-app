# Tennis Scheduling App - Development Plan

## Phase 1: MVP (Core Functionality)

### Database Schema

**players table**
- id (primary key)
- phone_or_email (login identifier)
- name
- email
- phone
- gender (Male/Female)
- address
- ntrp_level (2.0-7.0)
- notification_preference (EmailMe/TextMe/DontNotifyMe)
- created_at
- deleted_at (soft delete)

**matches table**
- id (primary key)
- organizer_id (foreign key to players)
- court_address
- start_time
- end_time
- min_ntrp_level
- max_players (default 4)
- status (scheduled/cancelled)
- created_at
- cancelled_at

**match_registrations table**
- id (primary key)
- match_id (foreign key)
- player_id (foreign key)
- registration_type (registered/waitlist)
- position_on_waitlist (1-3 for waitlist)
- registered_at

## Pages to Build (Phase 1)

### 1. Login/Register Page
- Simple form: "Enter your phone or email"
- If first time: collect Name, Email, Phone, Gender, Address, NTRP level, notification preference
- If returning: just log in
- "Delete My Account" button (with confirmation)

### 2. Dashboard / Calendar View
- Shows current week with matches user is registered for
- Filter options (we'll add more later):
  - By date range
  - My matches / Open matches
- "Create New Match" button
- Click on match to see details (location, players, contact info)

### 3. Create Match Modal/Page
- Pick date and time (start/end)
- Enter court address
- Set minimum NTRP level
- Set number of players (default 4)
- Submit button

### 4. Match Details Page
- Show all registered players (name, NTRP, email, phone)
- Show waitlist (if any)
- "Join Match" button (if space available)
- "Join Waitlist" button (if full)
- "Remove Me from Match" button
- Organizer only: "Cancel Match" button

## Technical Stack

**Frontend:** React + Vite (fast, modern)
**Backend:** Node.js + Express
**Database:** PostgreSQL
**Notifications:** Console logs for Phase 1 (we'll add Twilio SMS in Phase 2)
**Deployment:** Start local, can move to Vercel + Railway later

## Phase 1 Deliverables

1. Database setup with schema
2. Backend API endpoints (all CRUD operations)
3. Frontend: Login/Register page
4. Frontend: Calendar view with basic filtering
5. Frontend: Create match form
6. Frontend: Match details view
7. Join/Leave match functionality
8. Waitlist join functionality (UI only - logic in Phase 2)

## Phase 2: Notifications & Polish

- SMS notifications via Twilio
- Email reminders (24hr before, 1hr before)
- Waitlist automation (text first person, move to next if no response)
- Notification for unfilled matches (3 days before, on creation)
- Advanced filtering (by distance, specific players, etc.)

## Notes for Claude Code Development

- Use React hooks for state management (useState, useContext)
- Create reusable components for calendar, filters, match cards
- Use a simple backend structure: routes → controllers → services → database
- Start with mock data / hardcoded responses to get UI working
- Then wire up real database calls
