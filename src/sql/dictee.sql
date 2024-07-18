-- Connect to dictee
\c dictee

-- Create the users table
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    noteid VARCHAR(255) NOT NULL PRIMARY KEY,
    userid INTEGER NOT NULL,
    notebody TEXT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New Note Title',
    FOREIGN KEY (userid) REFERENCES users(userid)
);

