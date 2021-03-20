--- Triggers
CREATE TRIGGER IF NOT EXISTS delete_client_tags
	AFTER DELETE
	ON clients
BEGIN
	DELETE FROM scanned
	WHERE owner=OLD.cid;
END;

CREATE TRIGGER IF NOT EXISTS delete_tag_clients
	AFTER DELETE
	ON tags
BEGIN
	DELETE FROM scanned
	WHERE owner=OLD.tid;
END;