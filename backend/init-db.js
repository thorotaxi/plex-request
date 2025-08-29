const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the backend directory
const dbPath = path.join(__dirname, 'plex-requests.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Requests table
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('movie', 'tv', 'season', 'episode')),
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'pending', 'complete')),
      requester_id TEXT NOT NULL,
      poster_path TEXT,
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_date DATETIME,
      comment TEXT,
      admin_comment TEXT,
      show_id INTEGER,
      show_title TEXT,
      season_number INTEGER,
      episode_number INTEGER,
      episode_title TEXT,
      FOREIGN KEY (requester_id) REFERENCES users (id)
    )
  `);

  // Insert sample data
  const sampleUsers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' }
  ];

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)');
  sampleUsers.forEach(user => {
    insertUser.run(user.id, user.name);
  });
  insertUser.finalize();

  // Sample requests
  const sampleRequests = [
    {
      id: '1',
      tmdb_id: 1,
      title: 'The Shawshank Redemption',
      type: 'movie',
      status: 'new',
      requester_id: '1',
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      comment: 'Great classic movie!'
    },
    {
      id: '2',
      tmdb_id: 2,
      title: 'Breaking Bad',
      type: 'tv',
      status: 'complete',
      requester_id: '2',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      admin_comment: 'Added to Plex server'
    },
    {
      id: '3',
      tmdb_id: 3,
      title: 'The Dark Knight',
      type: 'movie',
      status: 'pending',
      requester_id: '3',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      comment: 'Best Batman movie ever!'
    },
    {
      id: '4',
      tmdb_id: 4,
      title: 'Game of Thrones',
      type: 'tv',
      status: 'complete',
      requester_id: '4',
      poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      admin_comment: 'All seasons added'
    }
  ];

  const insertRequest = db.prepare(`
    INSERT OR IGNORE INTO requests (
      id, tmdb_id, title, type, status, requester_id, poster_path, 
      request_date, completed_date, comment, admin_comment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleRequests.forEach(request => {
    const completedDate = request.status === 'complete' ? new Date().toISOString() : null;
    insertRequest.run(
      request.id,
      request.tmdb_id,
      request.title,
      request.type,
      request.status,
      request.requester_id,
      request.poster_path,
      new Date().toISOString(),
      completedDate,
      request.comment,
      request.admin_comment
    );
  });
  insertRequest.finalize();
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialized successfully!');
    console.log('Database file created at:', dbPath);
  }
});
