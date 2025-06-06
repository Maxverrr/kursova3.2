CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an initial admin user (password: admin123)
INSERT OR IGNORE INTO Users (username, password, role)
VALUES ('admin', '$2a$10$XgXB8bi4WZfxF8q1QQf0K.NSv/yqQbV1RBw9Y5YIKxK3qkUOqB1Hy', 'admin');

-- Create an initial regular user (password: user123)
INSERT OR IGNORE INTO Users (username, password, role)
VALUES ('user', '$2a$10$8KzaNdKIMyOkASCH4QvSB.Ys0rFxQeGGm4TKR8THyID1EJGS9jFC.', 'user'); 