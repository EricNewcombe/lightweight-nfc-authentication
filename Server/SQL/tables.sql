--- Need this to make foreign keys work
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tags (
    tid TEXT PRIMARY KEY,
    trand TEXT NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS clients (
    cid TEXT PRIMARY KEY,
    crand TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS scanned (
    tid TEXT,
    cid TEXT,
    FOREIGN KEY (tid) REFERENCES tags(tid),
    FOREIGN KEY (cid) REFERENCES clients(cid),
    CONSTRAINT pk_scanned PRIMARY KEY (tid, cid)
);