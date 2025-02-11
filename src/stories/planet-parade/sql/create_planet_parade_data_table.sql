CREATE TABLE PlanetParadeData (
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
	user_uuid varchar(36) NOT NULL UNIQUE,
    user_selected_search_locations JSON NOT NULL,
    user_selected_map_locations JSON NOT NULL,
    app_time_ms INT NOT NULL DEFAULT 0,
    info_time_ms INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

    PRIMARY KEY(id),
    INDEX(user_uuid)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
