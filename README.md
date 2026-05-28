# Cyber Threat Intelligence (CTI) Portal

A complete, clean, and simple CTI Portal built for student internship projects.

## Tech Stack
- **Frontend:** React.js, Bootstrap, Chart.js, Lucide-React
- **Backend:** Node.js, Express.js, JWT
- **Database:** MySQL

## Features
- User Authentication (Register/Login) with JWT
- Role-based Access (Admin/User)
- Threat Intelligence Management (Add/View/Delete)
- Automated Risk Scoring Logic
- Interactive Dashboard with Threat Statistics

## Setup Instructions

### 1. Database Setup
- Open your MySQL terminal or phpMyAdmin.
- Run the SQL commands found in `database.sql` to create the database and tables.
- By default, it expects a database named `cyber_threat_db` with `root` user and no password.

### 2. Backend Setup
- Open a terminal in the `backend/` directory.
- Run `npm install` to install dependencies.
- Update the `.env` file if your MySQL credentials are different.
- Run `npm run dev` to start the backend server on port 5000.

### 3. Frontend Setup
- Open a new terminal in the `frontend/` directory.
- Run `npm install` to install dependencies.
- Run `npm start` to launch the React application.
- The app will be available at `http://localhost:3000`.

## Usage
1. Register a new user (choose "Admin" role if you want to test deletion).
2. Login with your credentials.
3. Go to the **Threat Intelligence** page to report new threats.
4. Try adding threats with keywords like "malicious" or "phishing" to see the automated risk scoring in action.
5. Check the **Dashboard** for visual statistics.

## Risk Scoring Logic
- **High:** If the threat value contains the keyword `malicious`.
- **Medium:** If the threat value contains the keyword `phishing`.
- **Low:** For all other threats.
