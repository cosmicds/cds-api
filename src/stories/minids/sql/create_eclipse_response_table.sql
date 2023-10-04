CREATE TABLE EclipseMiniResponses (
	id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
	user_uuid varchar(36) NOT NULL UNIQUE,
    response char(1) NOT NULL,
    preset_locations JSON NOT NULL,
    preset_locations_count INT NOT NULL,
    user_selected_locations JSON NOT NULL,
    user_selected_locations_count INT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id),
    INDEX(user_uuid)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
