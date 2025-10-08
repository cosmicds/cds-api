CREATE TABLE APIKeyRoles (
    api_key_id int(11) UNSIGNED NOT NULL,
	role_id int(11) UNSIGNED NOT NULL,
    PRIMARY KEY (api_key_id, role_id),
	FOREIGN KEY (api_key_id)
		REFERENCES APIKeys(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (role_id)
		REFERENCES Roles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
