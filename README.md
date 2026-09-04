# My Roster

My Roster is a mobile-first weekly roster web app for planning personal work shifts. It is designed around a 7-day by 24-hour visual schedule, similar to an employee roster view, rather than a normal calendar or to-do list.

The app runs in the browser with HTML, CSS, and vanilla JavaScript. It can work locally without login, and it can optionally sync data through Firebase when the user signs in.

## Features

- Weekly roster view with all 7 days visible at once: Monday through Sunday
- 24-hour vertical timeline from 00:00 to 24:00
- Shift blocks positioned by real start and end times
- Shift block height reflects actual duration
- Monthly view with shift summaries by day
- Yearly view showing all 12 months
- Today highlighting across views
- Previous and next navigation for week, month, and year
- Add, edit, and delete shifts
- Manage custom workplaces
- Workplace default colors, including common color presets and custom color picker
- Weekly, monthly, and yearly hour totals
- Workplace-level hour breakdowns
- Pay / Earnings page calculated from saved shifts
- Workplace base hourly rates, editable pay split times, penalty multipliers, and final hourly rate previews
- Payslip-style earnings details grouped by ordinary and penalty rates
- Weekly, monthly, and yearly estimated gross pay
- Manually added public holidays with optional notes
- Persistent browser storage with `localStorage`
- Optional Firebase sync with email/password sign-in
- Works by opening `index.html` directly
- Compatible with GitHub Pages

## Views

### Weekly

The weekly view is the main roster interface.

It shows:

- `MON` to `SUN` at the same time
- One vertical column per day
- A 24-hour schedule grid
- Major time labels at `00:00`, `06:00`, `12:00`, `18:00`, and `24:00`
- Shift blocks placed exactly according to their scheduled time

For example, a shift from `07:00` to `10:00` starts at the 07:00 position and takes up 3 hours of height.

### Monthly

The monthly view shows a full month calendar with shift chips inside each date.

Clicking a date or a shift chip opens a preview of that day's shifts. It does not open the edit form directly.

### Yearly

The yearly view shows all 12 months in one screen layout. Dates with shifts are highlighted using the workplace color.

Clicking a highlighted date opens a shift preview for that day.

## Workplaces

Workplaces are fully user-created. The app does not create or hard-code any workplace names.

In **Manage Workplaces**, users can:

- Add a workplace
- Rename a workplace
- Delete a workplace
- Choose a default color
- Change the default color later
- Set a base hourly rate
- Set weekday, Saturday, Sunday, and public holiday pay multipliers
- Set custom early morning and evening time boundaries for weekday, Saturday, Sunday, and public holiday shifts
- Preview the final hourly rate for each rule

When adding a shift, the workplace dropdown is populated from the user's saved workplaces.

## Shifts

Each shift includes:

- Workplace
- Date
- Start time
- End time

Times use a 24-hour format. The time selector supports 5-minute steps.

Pay rule split times also use 24-hour format. They can be typed manually or adjusted with the hour and minute stepper controls.

In the weekly view, each shift appears as a colored block. The color comes from the selected workplace's default color.

## Pay / Earnings

Open the top-left menu and choose **Pay / Earnings** to view estimated pay.

The earnings page reads the existing shifts automatically. Users do not need to enter hours again.

It shows:

- Total hours for the current week, month, or year
- Estimated gross pay for the selected period
- A workplace-level breakdown with hours and pay
- Payslip-style detail rows with description, hours, final hourly rate, period begin/end dates, and earnings
- A public holiday list for dates that should use public holiday rules
- Automatic shift splitting when a shift crosses a pay boundary

Pay is estimated as:

```text
shift segment hours × workplace base hourly rate × matching penalty multiplier
```

Public holidays are entered manually for now. If a shift date is in the public holiday list, the public holiday rule set is used before weekday, Saturday, or Sunday rates.

Public holiday entries can include a short note, such as the holiday name. Notes are displayed beside the date.

For non-public-holiday shifts, the calculator splits each shift by the workplace's saved time boundaries:

- Weekdays: before the custom early time, base period, and after the custom evening time
- Saturdays: before the custom early time, base period, and after the custom evening time
- Sundays: before the custom early time, base period, and after the custom evening time
- Public holidays: before the custom early time, base period, and after the custom evening time

## Data Storage

All data is stored locally in the browser using `localStorage`.

The app saves:

- Workplaces
- Workplace colors
- Workplace pay settings
- Shifts
- Public holiday dates and notes

Data remains available after refreshing the page or closing and reopening the browser on the same device and browser profile.

Without Firebase sign-in, data is not synced between different browsers or devices.

If another person opens the public website link, they will not see your saved roster. They will get their own separate browser storage. This makes the app useful as a shared tool, but not as a shared live roster database.

With Firebase enabled and signed in, roster data is stored in Firestore at:

```text
users/{userId}/rosters/default
```

Each signed-in user has their own private document.

Firebase stores the same roster data as the browser version: workplaces, pay settings, shifts, public holiday dates, and public holiday notes.

## Firebase Sync

Firebase is optional. The app still works locally if Firebase is not configured.

To enable cloud sync:

1. Create a Firebase project at:

```text
https://console.firebase.google.com/
```

2. Add a Web app in Firebase Project Settings.

3. Copy the Firebase config into:

```text
firebase-config.js
```

It should look like this:

```js
window.MY_ROSTER_FIREBASE_CONFIG = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

4. In Firebase Authentication, enable **Email/Password** sign-in.

5. In Firestore Database, create a database.

6. Use these Firestore security rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/rosters/{rosterId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

7. Add your hosted domain to Firebase Authentication authorized domains:

```text
elzira1121.github.io
```

After this, open the app and use **Sign in to sync**.

## Project Structure

```text
my-roster/
├── index.html
├── style.css
├── app.js
└── README.md
```

## How To Run

Open this file directly in a browser:

```text
index.html
```

You can also run a simple local server from the project folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Public Website

After GitHub Pages finishes deploying, the public website is available at:

```text
https://elzira1121.github.io/my-roster/
```

You can open this link on a phone, bookmark it, or send it to other people.

## GitHub Pages

This project is compatible with GitHub Pages because it is a static site.

The repository includes a GitHub Actions workflow at:

```text
.github/workflows/pages.yml
```

The workflow deploys the site whenever the `weekly-roster` branch is updated.

If GitHub asks for manual Pages settings, use:

- Source: GitHub Actions
- Branch: `weekly-roster`
- Folder: repository root

## Technical Notes

- No React
- No Vue
- No npm packages
- No backend
- No external libraries
- No external calendar integration
- No account system

The app is intentionally simple and portable, so it can be hosted anywhere that supports static files.
