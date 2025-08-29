# Family Media Request Tool

A React + TypeScript + Tailwind CSS application for managing family media requests for your Plex server. Users can search for movies and TV shows via the TMDb API and submit requests that can be managed by an admin.

## Features

- **Search Movies & TV Shows**: Search the TMDb database for movies and TV shows
- **Request Management**: Add requests with requester name and track status
- **Admin Controls**: Mark requests as complete (admin mode)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Mock Data**: Works without API key for development

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **TMDb API** - Movie and TV show data
- **React Hooks** - State management

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.tsx    # Search input component
│   ├── SearchResults.tsx # Search results display
│   ├── RequestList.tsx  # List of all requests
│   ├── RequestCard.tsx  # Individual request card
│   └── RequestModal.tsx # Modal for adding requests
├── services/            # API services
│   └── tmdbApi.ts       # TMDb API integration
├── types/               # TypeScript interfaces
│   └── index.ts         # Type definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles with Tailwind
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plex-request
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### TMDb API Setup (Optional)

To use real TMDb data instead of mock data:

1. Get a free API key from [TMDb](https://www.themoviedb.org/settings/api)
2. Copy `env.example` to `.env`:
```bash
cp env.example .env
```
3. Edit `.env` and add your API key:
```env
REACT_APP_TMDB_API_KEY=your_api_key_here
```
4. Restart the development server

Without an API key, the application will use mock data for demonstration purposes.

**Note**: The API key is now properly secured using environment variables instead of being hardcoded.

## Usage

### For Users

1. **Search**: Use the search bar to find movies or TV shows
2. **Request**: Click "Request" on any search result
3. **Add Name**: Enter your name in the modal and submit
4. **Track**: View your requests in the requests list below

### For Admins

1. **Enable Admin Mode**: Click the "Admin Mode" button in the header
2. **Mark Complete**: Click "Mark Complete" on pending requests
3. **Filter**: Use the filters to view requests by status or type

## Component Architecture

### SearchBar
- Handles search input and submission
- Shows loading state during search
- Validates input before searching

### SearchResults
- Displays search results in a responsive grid
- Shows poster, title, year, and overview
- Handles missing poster images gracefully

### RequestList
- Displays all requests with filtering options
- Shows request statistics
- Provides admin controls when in admin mode

### RequestCard
- Individual request display with status badges
- Shows requester name and dates
- Admin action buttons for pending requests

### RequestModal
- Modal for adding new requests
- Validates requester name input
- Shows preview of selected media item

## Data Models

### SearchResult
```typescript
interface SearchResult {
  id: number;
  title: string;
  name?: string; // For TV shows
  release_date?: string;
  first_air_date?: string; // For TV shows
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  overview: string;
}
```

### MediaRequest
```typescript
interface MediaRequest {
  id: string;
  tmdbId: number;
  title: string;
  type: 'movie' | 'tv';
  status: 'pending' | 'complete';
  requesterName: string;
  posterPath: string | null;
  requestDate: Date;
  completedDate?: Date;
}
```

## Future Enhancements

- **Database Integration**: Replace in-memory storage with a real database
- **User Authentication**: Add user accounts and login system
- **Notifications**: Email/SMS notifications for request status changes
- **Plex Integration**: Direct integration with Plex server
- **Request Approval**: Admin approval workflow for requests
- **Media Library Sync**: Check if requested media already exists
- **Request History**: Detailed history and analytics
- **Mobile App**: React Native version for mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## User Preferences

See `user_preferences.md` for important UX preferences and terminal interaction guidelines.

## Acknowledgments

- [TMDb](https://www.themoviedb.org/) for providing the movie and TV show data API
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [React](https://reactjs.org/) for the UI framework


