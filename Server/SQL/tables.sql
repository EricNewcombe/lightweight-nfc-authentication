--- Need this to make foreign keys work
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tags (
    tid INTEGER PRIMARY KEY AUTOINCREMENT,
    trand TEXT NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS clients (
    cid INTEGER PRIMARY KEY AUTOINCREMENT,
    crand TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS scanned (
    tid INTEGER,
    cid INTEGER,
    FOREIGN KEY (tid) REFERENCES tags(tid),
    FOREIGN KEY (cid) REFERENCES clients(cid),
    CONSTRAINT pk_scanned PRIMARY KEY (tid, cid)
);