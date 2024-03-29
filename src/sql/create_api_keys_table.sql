CREATE TABLE APIKeys (
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    hashed_key varchar(100) NOT NULL UNIQUE,
    client varchar(64) NOT NULL,
    permissions_root varchar(50) DEFAULT NULL,
    allowed_methods JSON DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=0 DEFAULT CHARSET=UTF8 COLLATE = UTF8_UNICODE_CI PACK_KEYS=0;
