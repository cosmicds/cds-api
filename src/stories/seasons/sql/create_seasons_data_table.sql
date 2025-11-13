CREATE TABLE SeasonsData (
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    user_uuid varchar(36) NOT NULL UNIQUE,
    user_selected_dates JSON NOT NULL DEFAULT (JSON_ARRAY()),
    user_selected_dates_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    user_selected_locations JSON NOT NULL DEFAULT (JSON_ARRAY()),
    user_selected_locations_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    response TEXT DEFAULT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(id),
    INDEX(user_uuid)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
