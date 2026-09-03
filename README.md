# My Roster

My Roster is a mobile-first weekly roster web app for planning personal work shifts. It is designed around a 7-day by 24-hour visual schedule, similar to an employee roster view, rather than a normal calendar or to-do list.

The app runs entirely in the browser with HTML, CSS, and vanilla JavaScript. There is no login, backend, external calendar, or package dependency.

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
- Persistent browser storage with `localStorage`
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

When adding a shift, the workplace dropdown is populated from the user's saved workplaces.

## Shifts

Each shift includes:

- Workplace
- Date
- Start time
- End time

Times use a 24-hour format. The time selector supports 5-minute steps.

In the weekly view, each shift appears as a colored block. The color comes from the selected workplace's default color.

## Data Storage

All data is stored locally in the browser using `localStorage`.

The app saves:

- Workplaces
- Workplace colors
- Shifts

Data remains available after refreshing the page or closing and reopening the browser on the same device and browser profile.

Because the app uses local browser storage, data is not synced between different browsers or devices.

If another person opens the public website link, they will not see your saved roster. They will get their own separate browser storage. This makes the app useful as a shared tool, but not as a shared live roster database.

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
