# Eudora Babyrytmik - Registration Application

A modern web application for managing baby rhythm class registrations at Eudora preschools in Stockholm.

## Features

### Landing Page
- Beautiful, responsive registration form
- Real-time availability checking
- Week selection (10 weeks in advance)
- Location selection (Södermalm or Gärdet)
- Maximum 15 participants per week per location
- Automatic validation and error handling

### Admin Dashboard
- **Comprehensive Overview**
  - Total registrations statistics
  - Week-by-week capacity overview
  - Location-based breakdown

- **Participant Management**
  - View all registrations in a sortable table
  - Sort by: name, email, location, week, registration date
  - Filter by: week, location, search query
  - Delete registrations
  - Manually add participants
  - Export to CSV

- **Week Management**
  - Enable/disable weeks for registration
  - View capacity for each week
  - 10 weeks advance booking window

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Date Handling**: date-fns
- **Tables**: TanStack Table
- **Icons**: Lucide React
- **Storage**: LocalStorage (can be upgraded to database)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
eudora-babyrytmik/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── AddParticipantModal.tsx
│   └── WeekManagementModal.tsx
├── lib/
│   ├── dates.ts              # Date utilities
│   ├── storage.ts            # LocalStorage wrapper
│   └── store.ts              # Zustand store
├── types/
│   └── index.ts              # TypeScript types
└── public/
    └── assets/               # Static assets
```

## Key Features Explained

### Registration Limits
- Each week has a maximum of 15 participants per location
- When a week reaches capacity, users see a "Fullbokad" (Fully booked) message
- Admin can still manually add participants if needed

### Week Availability
- Admin can enable/disable specific weeks
- Disabled weeks don't appear in the registration form
- System automatically shows 10 weeks in advance

### Data Persistence
- Currently uses LocalStorage for data persistence
- Can be easily upgraded to a database (PostgreSQL, MongoDB, etc.)
- All data operations are abstracted in the storage layer

### Admin Features
- **Sorting**: Click column headers to sort
- **Filtering**: Filter by week, location, or search term
- **Export**: Download all registrations as CSV
- **Manual Entry**: Add participants directly through admin panel
- **Week Management**: Control which weeks are available for registration

## Upgrading to a Database

To upgrade from LocalStorage to a database:

1. Install database client (e.g., Prisma, Mongoose)
2. Update `lib/storage.ts` to use database queries
3. Create API routes in `app/api/`
4. Update store actions to call API routes

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Add your environment variables here
# DATABASE_URL=your_database_url
# NEXT_PUBLIC_API_URL=your_api_url
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Eudora Preschools

## Support

For support, contact the development team.
