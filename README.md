# Hypnos - Screen Time Management

A web application to help users track and manage their screen time with timers, goals, mood tracking, and basic analytics.

---

## Features

- **Timer** - Track screen time by category (Social Media, Work, Gaming, etc.)
- **Goals** - Set and monitor daily screen time goals
- **Mood Tracker** - Log daily mood and see correlations with screen time
- **Insights** - View analytics with charts and personalized recommendations based on your screentime and mood inputs
- **Profile** - Manage account settings

---

## Technology Infrastructure

- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** HTML, CSS, JavaScript, Handlebars, Chart.js
- **Auth:** bcrypt, express-session

### Setup

1. Clone the repository by downloading the contents of the repository or use the command below.
```bash
git clone https://github.com/Tomeitowo/CBAPDEV---Project.git
```
2. Go to the project folder and open Command Prompt.

3. Initialize and install all necessary modules used in the project by running the command below.
```bash
npm install
```

4. Run the command node index.js to run the server.
```bash
node index.js
```

5. Open browser and paste the http link below.
```
http://localhost:3000
```

---

## Project Folder Structure

```
hypnos/
- controllers/      # Contains all the controllers for each feature
- models/           # MongoDB schemas (User, Session, Goal, Mood)
- middleware/       # Authentication middleware to check if user is accessing pages while logged in or not
- views/            # Handlebars templates
- public/           # CSS, JS, images
- routes/           # API routes
- index.js          # Server entry point
```

---

## Usage

1. **Register** - Create an account
2. **Login** - Sign in with credentials
3. **Track** - Use timer to log screen time
4. **Set Goals** - Create daily time limits
5. **Log Mood** - Track how you feel
6. **View Insights** - See your progress and analytics

---

## Database Collections

- **user** - User accounts (username, email, password)
- **session** - Activity tracking (category, duration, date)
- **goal** - User goals (name, time limit, progress)
- **mood** - Mood entries (mood type, date, screen time)

---

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

### Sessions
- `GET /sessions` - View sessions page
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Goals
- `GET /goals` - View goals page
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/update-progress` - Update goal progress from session
- `PUT /api/goals/:id/complete` - Mark goal as completed
- `PUT /api/goals/:id/reactivate` - Reactivate completed goal

### Mood
- `GET /mood` - View mood history page
- `POST /api/mood` - Log new mood entry
- `PUT /api/mood/:id` - Update mood entry
- `DELETE /api/mood/:id` - Delete mood entry

### Insights
- `GET /insights` - View analytics and insights page

### Profile
- `GET /profile` - View profile page
- `PUT /api/profile` - Update username/email
- `PUT /api/profile/password` - Change password
- `DELETE /api/profile` - Delete account

---

## Color Palette
- Primary Colors: 
  - Blues (#667eea, #a3bffa, #bee3f8)
  - Greens (#48bb78, #9ae6b4, #c6f6d5)
  - Purples (#b794f6, #d6bcfa, #e9d8fd)
- Background: Gradient from sky blue to light purple
- Text: Dark gray readability

---

## Notes

- Sample datas are loaded via seed.js
- New users are saved in the local computer only
- Timer works with real JavaScript setInterval functionality
- Charts use real Chart.js library from CDN
- SVGs are from an online source (https://www.svgviewer.dev/s/497869/edit)

---

## Authors

- Cruz, Janah Vianca
- Fajardo, Matthew Rafael
- Landong, Leo Timothy
- Project for CBAPDEV T1Y2526
