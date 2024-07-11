-- Connect to dictee
\c dictee

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL
);

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    noteid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    notebody TEXT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);