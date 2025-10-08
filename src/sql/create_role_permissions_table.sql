CREATE TABLE RolePermissions (
	role_id int(11) UNSIGNED NOT NULL,
    permission_id int(11) UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)
		REFERENCES Roles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY (permission_id)
		REFERENCES Permissions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
