# Feature Guide

## Landing Page Features

### Registration Form
- **First Name & Last Name**: Required fields for participant identification
- **Email & Phone**: Contact information with validation
- **Location Selection**: Radio buttons for Södermalm or Gärdet
- **Week Selection**: Dropdown showing 10 available weeks
- **Terms Checkbox**: Required acceptance of terms
- **Real-time Validation**: Instant feedback on errors
- **Capacity Display**: Shows remaining spots for selected week/location
- **Submit Button**: Disabled when week is full

### User Experience
- Clean, modern design matching original mockup
- Responsive layout (mobile, tablet, desktop)
- Clear error messages in Swedish
- Success confirmation after submission
- Image showcase on desktop view
- Quick access to admin dashboard (bottom-right button)

---

## Admin Dashboard Features

### 1. Statistics Cards (Top Section)
Three cards showing:
- **Total Registrations**: Overall count with Users icon
- **Södermalm**: Count with Calendar icon
- **Gärdet**: Count with Calendar icon

### 2. Week Overview Table
Shows all 10 upcoming weeks with:
- **Week Number**: e.g., "Vecka 10"
- **Date Range**: e.g., "2 Mar - 8 Mar"
- **Södermalm Capacity**: Badge showing X/15
  - Green: 0-11 participants
  - Yellow: 12-14 participants
  - Red: 15 participants (full)
- **Gärdet Capacity**: Same color coding
- **Total**: Combined count
- **Status**: "Öppen" (Open) or "Stängd" (Closed)
- **Manage Button**: Opens week management modal

### 3. Participant Table
Comprehensive table with:

#### Columns
1. **Förnamn** (First Name) - Sortable
2. **Efternamn** (Last Name) - Sortable
3. **E-post** (Email) - Sortable
4. **Telefon** (Phone)
5. **Plats** (Location) - Sortable
6. **Vecka** (Week) - Sortable
7. **Anmäld** (Registered) - Sortable
8. **Åtgärder** (Actions) - Delete button

#### Sorting
- Click any column header to sort
- First click: Ascending
- Second click: Descending
- Visual indicator (↑/↓) shows current sort

#### Filtering & Search
Three filter controls:
1. **Search Box**: 
   - Searches across name, email, and phone
   - Real-time filtering
   - Placeholder: "Namn, e-post eller telefon..."

2. **Week Filter**:
   - Dropdown with all 10 weeks
   - "Alla veckor" (All weeks) option
   - Shows week number and date range

3. **Location Filter**:
   - Dropdown: All, Södermalm, Gärdet
   - Filters table instantly

#### Actions
- **Delete**: Trash icon, requires confirmation
- **Add Participant**: Green button with Plus icon
- **Export CSV**: Gray button with Download icon

#### Results Counter
Shows: "Visar X av Y anmälningar"

### 4. Week Management Modal

Accessed via "Hantera veckor" button:

#### Features
- Lists all 10 upcoming weeks
- Each week shows:
  - Week number and date range
  - Södermalm capacity (X/15)
  - Gärdet capacity (X/15)
  - Total registrations
  - Status toggle button

#### Toggle Button
- **Green** (Öppen/Open): Week is available for registration
- **Red** (Stängd/Closed): Week is disabled
- Click to toggle
- Warning if week has existing registrations

#### Visual Feedback
- Open weeks: White background, gray border
- Closed weeks: Red tinted background, red border

### 5. Add Participant Modal

Accessed via "Lägg till deltagare" button:

#### Form Fields
Same as landing page:
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone (required)
- Location (radio buttons, required)
- Week (dropdown, required)

#### Features
- Real-time capacity checking
- Shows available spots for selected week/location
- Prevents adding to full weeks
- Success message on completion
- Auto-closes after successful addition

---

## Data Flow

### Registration Process
1. User fills form on landing page
2. System checks week availability
3. System checks capacity (< 15)
4. If valid: Creates registration
5. Saves to LocalStorage
6. Shows success message

### Admin Process
1. Admin views dashboard
2. Sees all registrations in table
3. Can filter/sort/search
4. Can add/delete registrations
5. Can manage week availability
6. Can export data to CSV

---

## Business Rules

### Capacity Management
- **Maximum**: 15 participants per week per location
- **Total per week**: 30 (15 Södermalm + 15 Gärdet)
- **Enforcement**: Automatic on both public and admin forms
- **Override**: Admin can manually add (use with caution)

### Week Availability
- **Default**: All weeks open
- **Admin Control**: Can close specific weeks
- **Effect**: Closed weeks don't appear in public form
- **Existing Registrations**: Not affected by closing week

### Time Window
- **Booking Window**: 10 weeks in advance
- **Calculation**: From next Monday
- **Auto-update**: Weeks roll forward automatically

---

## CSV Export

### Exported Columns
1. Förnamn (First Name)
2. Efternamn (Last Name)
3. E-post (Email)
4. Telefon (Phone)
5. Plats (Location - Swedish)
6. Vecka (Week number)
7. Anmäld (Registration timestamp)

### File Format
- Comma-separated values
- UTF-8 encoding
- Filename: `anmalningar-YYYY-MM-DD.csv`
- Respects current filters (exports what you see)

---

## Color Scheme

### Primary Colors
- **Teal** (#0F4C5C): Primary actions, headers
- **Cream** (#F5F1E8): Background
- **Sage** (#D4E5D4): Accents, info boxes
- **Peach** (#FFE5D9): Highlights

### Status Colors
- **Green**: Available, success (0-11 participants)
- **Yellow**: Warning (12-14 participants)
- **Red**: Full, error (15 participants)
- **Gray**: Neutral, disabled

---

## Responsive Breakpoints

- **Mobile**: < 768px
  - Single column layout
  - Stacked form fields
  - Scrollable tables
  
- **Tablet**: 768px - 1024px
  - Two column forms
  - Compact tables
  
- **Desktop**: > 1024px
  - Full layout with sidebar image
  - Expanded tables
  - Optimal spacing

---

## Keyboard Shortcuts

- **Tab**: Navigate form fields
- **Enter**: Submit form
- **Escape**: Close modals
- **Click column header**: Sort table

---

## Accessibility

- Semantic HTML
- Form labels
- Error messages
- Focus indicators
- Color contrast compliance
- Screen reader friendly

---

## Performance

- Instant filtering and sorting
- Optimized re-renders
- Lazy loading
- Efficient state management
- Fast LocalStorage operations

---

## Error Handling

### Form Validation
- Required field messages
- Email format validation
- Real-time feedback
- Clear error styling

### Capacity Errors
- "Veckan är fullbokad" message
- Disabled submit button
- Visual capacity indicator

### System Errors
- Graceful fallbacks
- User-friendly messages
- No data loss
