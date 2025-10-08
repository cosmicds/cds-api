CREATE TABLE Permissions (
	id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    action varchar(50) NOT NULL,
    resource_pattern varchar(255) NOT NULL,
    name varchar(50) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
