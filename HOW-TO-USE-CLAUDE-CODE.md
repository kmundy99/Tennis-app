# How to Use Claude Code for This Tennis App

## What to Do Now

You have three planning documents ready:
1. `tennis-app-CLAUDE.md` - Full development plan
2. `database-schema.sql` - Database structure
3. `PROJECT-SETUP.md` - Setup instructions

## How to Start Claude Code

1. Open Claude Code in your terminal (or use the web version if command line is hard to read)
2. Create a new folder for your project: `mkdir tennis-app && cd tennis-app`
3. Copy the three files above into this folder
4. Type: `claude` to start

## What to Tell Claude Code First

Paste this into Claude Code:

```
I'm building a tennis scheduling app with these files:
- tennis-app-CLAUDE.md (full spec and plan)
- database-schema.sql (database structure)
- PROJECT-SETUP.md (setup instructions)

Please read these files and help me build Phase 1 (MVP). 

Start by:
1. Setting up the project folders (frontend and backend)
2. Installing dependencies
3. Creating the PostgreSQL database and tables
4. Building a simple backend server with the API endpoints listed in PROJECT-SETUP.md
5. Then we'll build the React frontend

Let's start with step 1-3 first.
```

## Example Commands to Use Later

Once you've got the foundation set up, you can ask Claude Code things like:

**For building frontend pages:**
- "Create a login page component that takes phone/email, checks if it's a returning user, and either logs them in or shows the registration form"
- "Build a calendar view that shows matches for the current week"
- "Create a 'Create Match' form with date/time picker and court address input"

**For building backend features:**
- "Add an API endpoint for creating a new match that validates the input"
- "Create a function that gets all matches a player is registered for"
- "Build the join/leave match endpoints"

**For debugging:**
- "I'm getting an error when I try to join a match: [paste error]. Can you fix it?"
- "The calendar isn't showing my matches. Can you check the API call?"

## Key Things to Remember

1. **Be specific about what you want** - Instead of "fix the button", say "the Join Match button isn't working when I click it - can you check if the API call is going through?"

2. **Tell Claude Code what you're trying to do** - "I want to be able to click on a date in the calendar and create a match for that date"

3. **If something doesn't look right**, describe it clearly - "The match details aren't showing the player's phone numbers" or "The calendar is showing all matches from 2020"

4. **Start small, build up** - Get one feature working before moving to the next. Don't ask for everything at once.

5. **You can paste error messages** - If something breaks, copy the error and paste it to Claude Code. It will help debug.

## Good Phrases to Use

- "Can you show me how this works?"
- "Can you explain why you chose that approach?"
- "I'd prefer if... [describe what you want]"
- "That looks good, now let's add [next feature]"
- "I don't understand this part, can you simplify it?"

## If You Get Stuck

Just type: `/help` in Claude Code to see all available commands, or ask Claude Code questions like:
- "What files have we created so far?"
- "Can you show me the current structure of the project?"
- "What do I do next?"

Claude Code is designed to work conversationally - talk to it like a colleague who's helping you build something!
