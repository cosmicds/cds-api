CREATE TABLE Sessions (
    id varchar(36) NOT NULL UNIQUE,
    user_id int(11) UNSIGNED NOT NULL UNIQUE,
    username varchar(50),
    email varchar(50),
    expires datetime NOT NULL,

    PRIMARY KEY(id),
    INDEX(user_id)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
