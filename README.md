# PromaxCare staff mobile app

# Overview

This Expo application is the native iOS/Android staff companion to PromaxCare.
It supports staff authentication, assigned-shift access, governed attendance,
shift reports, documents, notifications and profile maintenance. Organisation
administration, rostering and finance remain in the responsive Care OS web app.

# Features

## Assigned shifts

- View assigned shifts and shift details.
- Receive notifications for any shift changes or updates.

## Attendance and evidence

- Clock in and out with foreground location, server-side geofence validation and
  governed exception reasons.
- Fail closed while offline; the app never displays a false attendance success.
- Complete shift reports and maintain supporting documents.

# Technologies Used

- Frontend: Expo App, Zustand for state management.
- Backend: PromaxCare .NET API.
- Authentication: JSON Web Tokens (JWT) for secure authentication.
- Deployment: Expo Application Services release profiles.

# Installation

1. Clone the repository:

### `git clone <authorised-repository-url>`

2. Navigate to the project directory:

### `cd your-project-directory`

3. Install dependencies:

### `npm install`

4. Start the development server:

### `npm start`

# Usage

Copy `.env.example` to `.env` for local work and supply only an authorised API
base. The app refuses UAT/production environment mismatches. See
`docs/MOBILE_RELEASE_GATE.md` for candidate qualification.

# Contributing

- We welcome contributions from the community to enhance the functionality and usability of our application. If you'd like to contribute, please fork the repository, make your changes, and submit a pull request.

# License

This project is licensed under the (MIT License.)
