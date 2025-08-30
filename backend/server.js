require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
console.log('🔧 Setting up database...');
const dbPath = path.join(__dirname, 'plex-requests.db');
console.log(`📁 Database path: ${dbPath}`);

const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.log('⚠️  Database not found, initializing...');
  const { execSync } = require('child_process');
  try {
    console.log('🔄 Running database initialization...');
    execSync('node init-db.js', { stdio: 'inherit' });
    console.log('✅ Database initialization completed.');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
} else {
  console.log('✅ Database file exists, skipping initialization.');
}

console.log('🔌 Creating database connection...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Database connected successfully.');
});

// API Routes

// Get all requests
app.get('/api/requests', (req, res) => {
  console.log('📥 GET /api/requests - Fetching all requests...');
  const query = `
    SELECT 
      r.*,
      u.name as requester_name
    FROM requests r
    LEFT JOIN users u ON r.requester_id = u.id
    ORDER BY r.request_date DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching requests:', err);
      res.status(500).json({ error: 'Failed to fetch requests' });
      return;
    }
    
    // Convert database rows to match frontend format
    const requests = rows.map(row => ({
      id: row.id,
      tmdbId: row.tmdb_id,
      title: row.title,
      type: row.type,
      status: row.status,
      requesterName: row.requester_name,
      posterPath: row.poster_path,
      requestDate: new Date(row.request_date),
      completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
      comment: row.comment,
      adminComment: row.admin_comment,
      showId: row.show_id,
      showTitle: row.show_title,
      seasonNumber: row.season_number,
      episodeNumber: row.episode_number,
      episodeTitle: row.episode_title
    }));
    
    res.json(requests);
  });
});

// Create a new request
app.post('/api/requests', (req, res) => {
  const {
    tmdbId,
    title,
    type,
    requesterName,
    posterPath,
    comment,
    showId,
    showTitle,
    seasonNumber,
    episodeNumber,
    episodeTitle
  } = req.body;

  // First, ensure the user exists (create if not)
  const userId = uuidv4();
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)');
  insertUser.run(userId, requesterName);
  insertUser.finalize();

  // Create the request
  const requestId = uuidv4();
  const query = `
    INSERT INTO requests (
      id, tmdb_id, title, type, requester_id, poster_path, comment,
      show_id, show_title, season_number, episode_number, episode_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    requestId,
    tmdbId,
    title,
    type,
    userId,
    posterPath,
    comment,
    showId,
    showTitle,
    seasonNumber,
    episodeNumber,
    episodeTitle
  ], function(err) {
    if (err) {
      console.error('Error creating request:', err);
      res.status(500).json({ error: 'Failed to create request' });
      return;
    }
    
    res.status(201).json({ 
      message: 'Request created successfully',
      id: requestId 
    });
  });
});

// Update request status
app.patch('/api/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const completedDate = status === 'complete' ? new Date().toISOString() : null;
  
  const query = `
    UPDATE requests 
    SET status = ?, completed_date = ?
    WHERE id = ?
  `;
  
  db.run(query, [status, completedDate, id], function(err) {
    if (err) {
      console.error('Error updating request status:', err);
      res.status(500).json({ error: 'Failed to update request status' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    res.json({ message: 'Request status updated successfully' });
  });
});

// Add comment to request
app.patch('/api/requests/:id/comment', (req, res) => {
  const { id } = req.params;
  const { comment, isAdmin } = req.body;
  
  const field = isAdmin ? 'admin_comment' : 'comment';
  const query = `UPDATE requests SET ${field} = ? WHERE id = ?`;
  
  db.run(query, [comment, id], function(err) {
    if (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Failed to add comment' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    res.json({ message: 'Comment added successfully' });
  });
});

// Delete request
app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM requests WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting request:', err);
      res.status(500).json({ error: 'Failed to delete request' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }
    
    res.json({ message: 'Request deleted successfully' });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }
    
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('📥 GET /api/health - Health check request');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// TMDB API proxy endpoints
const TMDB_API_KEY = process.env.TMDB_API_KEY || '4372e0039cf875a6cf1eb9db96a10c3e';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('🔑 TMDB API Key loaded:', TMDB_API_KEY ? 'YES' : 'NO');
console.log('🔑 TMDB API Key length:', TMDB_API_KEY ? TMDB_API_KEY.length : 0);

// Search multi endpoint
app.get('/api/tmdb/search', async (req, res) => {
  const { query, page = 1 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }
  
  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    console.log('🔍 TMDB Search:', url.replace(TMDB_API_KEY, '***'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Filter out non-movie and non-tv results
    const filteredResults = data.results.filter(
      (result) => result.media_type === 'movie' || result.media_type === 'tv'
    );
    
    res.json({ ...data, results: filteredResults });
  } catch (error) {
    console.error('❌ TMDB search error:', error);
    res.status(500).json({ error: 'Failed to search TMDB' });
  }
});

// TV show details endpoint
app.get('/api/tmdb/tv/:showId', async (req, res) => {
  const { showId } = req.params;
  
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }
  
  try {
    const url = `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&append_to_response=seasons`;
    console.log('📺 TMDB TV Details:', url.replace(TMDB_API_KEY, '***'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('❌ TMDB TV details error:', error);
    res.status(500).json({ error: 'Failed to fetch TV show details' });
  }
});

// Season details endpoint
app.get('/api/tmdb/tv/:showId/season/:seasonNumber', async (req, res) => {
  const { showId, seasonNumber } = req.params;
  
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }
  
  try {
    const url = `${TMDB_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
    console.log('📺 TMDB Season Details:', url.replace(TMDB_API_KEY, '***'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('❌ TMDB season details error:', error);
    res.status(500).json({ error: 'Failed to fetch season details' });
  }
});

// Start server
console.log('Starting server...');
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Requests API: http://localhost:${PORT}/api/requests`);
});
