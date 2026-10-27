# Sudhaar

Sudhaar is a civic issue reporting and tracking platform. It allows residents to report local problems, view community reports, and follow the status of submitted complaints. Administrators can review complaints, record progress, and attach evidence when marking an issue as resolved.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Complaint Lifecycle](#complaint-lifecycle)
- [Security and Access Control](#security-and-access-control)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Testing](#testing)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Problem Statement

Residents frequently encounter civic issues such as damaged roads, overflowing waste, water leakage, drainage problems, broken streetlights, and unsafe footpaths. Reporting these problems and finding out what happened afterward can be difficult when information is scattered across different channels.

Sudhaar provides a shared platform where residents can report local issues, associate them with a location, and follow their status. Community reports also help residents see issues reported by others.

## Objectives

- Provide a straightforward way to report civic issues.
- Associate reports with addresses and geographic coordinates where available.
- Maintain a shared view of community complaints.
- Track complaints from submission through resolution.
- Allow administrators to manage complaints and publish status updates.
- Restrict administrative operations through role-based access control.
- Maintain a history of complaint updates.

## Features

### Citizen features

- User registration and authentication.
- Complaint submission with a title, category, description, address, and optional coordinates.
- Photo attachments for complaints.
- Community complaint listing.
- Individual complaint detail pages.
- Complaint status and update history.
- User profile management.
- Complaint voting, where enabled in the current application build.

### Administrative features

- Role-restricted admin dashboard.
- Complaint overview and status statistics.
- Search and status filtering.
- Complaint status management.
- Administrative notes attached to updates.
- Resolution evidence uploads.
- CSV export of available dashboard data.

Dashboard statistics depend on the records returned by the current queries. If a query limits the number of records loaded, the displayed figures may not represent the entire database.

### Map and interface

- Interactive issue map.
- Responsive layouts for desktop and mobile.
- Loading, empty, and error states in supported data-driven components.
- Navigation for community reports, complaint reporting, profiles, and administrative pages.

The map's functionality depends on the current map component and the location information available for each complaint.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and production build |
| Tailwind CSS | Styling and responsive layouts |
| React Router | Client-side routing |
| Supabase Auth | Authentication and session management |
| Supabase PostgreSQL | Application database |
| Supabase Storage | Complaint photos and resolution evidence |
| Lucide React | Interface icons |
| Leaflet | Interactive map components, where used |

## Architecture

Sudhaar uses a React frontend backed by Supabase services.

```text
Browser
   |
   v
React Application
   |
   |-- Pages and UI Components
   |-- React Router
   |-- Authentication Context
   |-- Supabase Client
   |
   v
Supabase
   |
   |-- Authentication
   |-- PostgreSQL Database
   |-- Row Level Security
   |-- Storage Buckets
```

The frontend communicates with Supabase through its client library. PostgreSQL stores complaint records and related updates, while Supabase Storage holds uploaded files.

Access restrictions must be enforced by database policies and storage policies. Hiding a page or button in the frontend is not sufficient to secure an operation.

## Getting Started

### Prerequisites

Install the following:

- Node.js, preferably an active LTS release.
- npm.
- A Supabase project.
- Access to the project's database migrations and storage configuration.

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

Replace the placeholders with the actual repository URL and directory name.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the placeholder values with the credentials from your Supabase project.

Do not commit `.env.local` to version control. Never expose a Supabase service-role key or other server-side secret in frontend code.

### 4. Configure Supabase

Before running the application, make sure the following are configured:

- Required database tables and migrations.
- Authentication profile creation trigger.
- Row Level Security policies.
- Required SQL grants.
- `complaint-photos` storage bucket and its policies.
- `resolution-proof` storage bucket and its policies.

See [Database Schema](#database-schema) for the expected data model.

### 5. Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal. Open that URL in your browser.

### 6. Configure an administrator account

Register a user through the application. Assign the `admin` role to the appropriate profile using a trusted administrative process, such as the Supabase SQL editor.

Do not allow users to assign themselves administrative privileges through a public form or unrestricted database policy.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | URL of the Supabase project |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Public client key used by the frontend |

Vite exposes variables prefixed with `VITE_` to browser code. These values must be treated as public.

The publishable key is intended for client-side use. Database and storage access must still be restricted through appropriate policies.

## Database Schema

The application uses PostgreSQL through Supabase. The following describes the expected data model. The migration files in the repository are the source of truth for exact column types, constraints, indexes, triggers, and policies.

### `profiles`

Stores application-specific information associated with an authenticated user.

| Column | Description |
|---|---|
| `id` | References the authenticated user |
| `display_name` | User's display name |
| `role` | Application role, such as `citizen` or `admin` |

A database trigger creates a profile when a user registers, using the configured authentication metadata.

### `complaints`

Stores submitted civic issues.

| Column | Description |
|---|---|
| `id` | Complaint identifier |
| `reporter_id` | User who submitted the complaint |
| `title` | Short issue title |
| `category` | Category of the issue |
| `description` | Issue details |
| `address` | Human-readable location |
| `latitude` | Optional geographic latitude |
| `longitude` | Optional geographic longitude |
| `photo_path` | Optional storage path for a complaint image |
| `status` | Current complaint status |
| `created_at` | Submission timestamp |
| `updated_at` | Last status-change timestamp |

Supported categories include:

- Roads
- Sanitation
- Water
- Drainage
- Streetlights
- Footpaths
- Public spaces
- Other

Supported statuses are:

- `submitted`
- `in_progress`
- `resolved`

### `complaint_updates`

Stores status updates and administrative notes associated with complaints.

| Column | Description |
|---|---|
| `complaint_id` | Associated complaint |
| `actor_id` | User who recorded the update |
| `status` | Status recorded by the update |
| `note` | Optional explanatory note |
| `proof_path` | Optional storage path for resolution evidence |
| `created_at` | Update timestamp |

### `complaint_votes`

Stores votes on complaints.

A composite primary key on `(complaint_id, user_id)` prevents a user from creating multiple vote records for the same complaint.

### Row Level Security

Row Level Security should be enabled on all application tables exposed through the Supabase API.

The intended access model is:

- Public users can read permitted complaint records and complaint updates.
- Authenticated users can create complaints on their own behalf.
- Citizens can delete their own complaints only while they are in the submitted state.
- Users can read their own profile and update permitted profile fields.
- Administrators can update complaint statuses and insert complaint updates.
- Authenticated users can create and remove their own votes.
- Administrative permissions are enforced through trusted database policies or helper functions.

Review the actual migrations before deployment. SQL grants and RLS policies must work together. A grant alone does not establish that every user should be allowed to perform an operation.

### Storage

The application uses two storage buckets:

| Bucket | Purpose |
|---|---|
| `complaint-photos` | Images attached to complaints |
| `resolution-proof` | Evidence attached to resolution updates |

Configure storage policies to restrict uploads and deletions to authorized users and permitted paths.

If complaint photos are publicly readable, users should be warned not to upload sensitive personal information. Resolution evidence should have an explicit access policy appropriate to its contents.

The upload interface has used a 5 MB limit and JPG, PNG, and WebP formats. Verify that storage restrictions match the frontend validation before deployment.

## Complaint Lifecycle

A typical complaint follows this workflow:

1. A citizen signs in and submits a complaint.
2. The complaint is saved with the `submitted` status.
3. The complaint appears in the community reports view.
4. An administrator reviews the complaint and may change its status to `in_progress`.
5. The administrator records updates as work progresses.
6. When the issue is addressed, the administrator marks it `resolved` and provides resolution evidence if required by the interface.
7. The complaint detail page displays its latest status and available update history.

A status change and insertion of its corresponding update may be separate database operations in the current implementation. If one operation succeeds and the other fails, the complaint and its history can become inconsistent. A database transaction or PostgreSQL function would make this workflow safer.

## Security and Access Control

Before deployment, verify the following:

- RLS is enabled on all exposed application tables.
- Database policies restrict writes to the intended users and roles.
- Ordinary users cannot modify their roles to gain administrator privileges.
- Administrative routes are protected in the frontend.
- Administrative database operations are independently protected by RLS policies.
- No service-role key or other server-side secret is included in frontend code.
- File uploads validate size and type.
- Storage policies restrict unauthorized uploads and deletions.
- Publicly accessible files do not expose private information.
- `.env.local` and other local secrets are excluded from version control.

Frontend route protection improves navigation and user experience. It is not a replacement for database authorization.

## Project Structure

The following is the main application structure. Some supporting files may differ by branch.

```text
src/
├── components/
│   ├── home/
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   └── RecentReports.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── IndiaMap.jsx
│   ├── LocationPicker.jsx
│   ├── ProtectedRoute.jsx
│   └── ui/
│       └── SectionHeading.jsx
├── context/
│   └── AuthContext.jsx
├── data/
│   └── demoComplaints.js
├── lib/
│   └── supabaseClient.js
├── pages/
│   ├── HomePage.jsx
│   ├── ReportIssuePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── ComplaintsPage.jsx
│   ├── ComplaintDetailPage.jsx
│   └── AdminDashboardPage.jsx
├── services/
│   └── authService.js
├── App.jsx
└── main.jsx

supabase/
└── migrations/
```

## Development Commands

The standard Vite scripts are expected to be available in `package.json`. Confirm the actual scripts in your checkout.

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the production build before submitting changes. Resolve build errors and inspect the browser console for runtime errors.

## Testing

Use the following checklist before submitting or demonstrating the project.

### Authentication

- [*] A new user can register.
- [*] A registered user can sign in and sign out.
- [*] Invalid credentials produce an appropriate error.
- [*] Protected pages handle unauthenticated users correctly.
- [*] Ordinary users cannot perform administrative operations.

### Complaint reporting

- [*] A signed-in user can submit a valid complaint.
- [*] Required fields are validated.
- [*] Optional coordinates and photos are handled correctly.
- [*] Submitted complaints appear in the community reports view.
- [*] Complaint detail pages display the correct record and status.

### Administration

- [*] An administrator can access the dashboard.
- [*] Search and status filters work.
- [*] Status changes persist after a reload.
- [*] Update notes appear on the correct complaint.
- [*] Resolution evidence follows the configured upload rules.
- [*] CSV export contains the expected records and fields.

### Responsive behaviour and reliability

- [*] The navbar and mobile menu work at narrow viewport widths.
- [*] Forms, maps, tables, and modals remain usable on mobile.
- [*] Loading, empty, and error states are handled.
- [*] Supported routes work after a page refresh.
- [*] `npm run build` completes successfully.
- [*] No credentials or secrets are committed to the repository.

## Known Limitations

- Dashboard figures depend on the records returned by the current queries. Query limits may cause the dashboard to show a subset of all complaints.
- Status changes and update insertion may not be atomic unless implemented through a transaction or database function.
- Public storage access requires care when reports contain identifying information.
- Demo or placeholder records, where present, must be distinguished from real submissions.
- Map accuracy depends on the coordinates provided with complaints and the map implementation.
- A complaint marked as resolved records the platform's reported outcome. It does not guarantee the underlying civic issue has been fully repaired or verified by a third party.

## Future Improvements

- Add automated unit and integration tests for authentication, reporting, voting, and administrative workflows.
- Make status transitions and update history atomic through a PostgreSQL function or transaction.
- Add pagination and server-side aggregation for larger datasets.
- Add map filtering by category, status, and location.
- Add notifications for complaint status changes.
- Add moderation tools for inaccurate or abusive submissions.
- Improve keyboard navigation, accessibility, and screen-reader support.
- Add a continuous integration workflow and deployment documentation.
- Add audit logging for administrative actions.
- Document migrations and storage policies with reproducible setup instructions.

## Contributing

1. Fork the repository or create a branch for your change.
2. Keep changes focused and use clear commit messages.
3. Test the affected workflow locally.
4. Run the production build.
5. Include screenshots for significant UI changes.
6. Document any environment or database changes.
7. Never commit credentials, private user data, or local environment files.

## License

This project does not currently include a license file. Before publishing or distributing the code publicly, add an explicit license that reflects your intended usage and distribution terms.

##Project Demo
Drive Link : https://drive.google.com/drive/folders/1aMqrmtvRrcBam5Tr_VKhPvF-3TFIuham?usp=sharing

