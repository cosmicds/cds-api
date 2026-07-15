SET GLOBAL event_scheduler = ON;

USE cosmicds_db;

-- We need this so that the ";" in the procedure definition isn't read as the statement delimiter
DELIMITER $$

CREATE PROCEDURE DeleteExpiredTemporaryFiles()
BEGIN
    DELETE FROM TemporaryFiles
    WHERE expires_at < NOW();
END

DELIMITER ;


CREATE EVENT run_delete_expired_temporary_files
ON SCHEDULE EVERY 15 MINUTE
STARTS CURRENT_TIMESTAMP
DO
    CALL DeleteExpiredTemporaryFiles();
