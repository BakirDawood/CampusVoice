# CampusVoice — React/Vite Prototype

CampusVoice is a student-project prototype adapted from the uploaded Civic Quest React app. It intentionally carries forward Civic Quest's design language: DM Sans + Plus Jakarta Sans typography, teal/green and mint surfaces, warm gold accents, rounded cards, Lucide icons, generous spacing, responsive sidebar/bottom-width navigation behaviour, and soft shadows.

## Features included
- Overview dashboard with announcement cards, feedback counts, upcoming events, and the Campus Communication Loop
- Searchable and filterable announcements with notice-detail modal
- Student Voice form with category, subject, description, optional suggested solution, and demo anonymous toggle
- Feedback reference IDs and statuses: Received, Under Review, Responded, Closed
- My Feedback timeline and response messages
- Events calendar with add-event interaction
- Communication Guide with notice-writing, listening, tone, privacy, and closure tips
- Response Desk to update sample feedback statuses
- Browser `localStorage` persistence for locally created notices, events, and feedback
- Responsive desktop/mobile layouts and reduced-motion preference support

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

The GitHub Actions workflow builds the app and publishes it to GitHub Pages whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The project is configured for the `CampusVoice` repository URL.

After the first successful workflow run, the site will be available at `https://<your-github-username>.github.io/CampusVoice/`.

## Prototype limitations
- This is a front-end demonstration, not an official Islamia College service.
- Sample announcements, event entries, and responses are illustrative and must not be treated as verified college information.
- Data is stored only in the current browser via localStorage. There is no backend, real authentication, server database, email/SMS/push notifications, or secure multi-user access.
- Do not enter sensitive or confidential complaints in this demo.
- Before any real pilot, get college authorization and implement secure authentication, authorization, privacy controls, retention/deletion, backups, moderation, and an official response process.
