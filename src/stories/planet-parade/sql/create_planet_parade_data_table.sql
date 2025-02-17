CREATE TABLE PlanetParadeData (
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
	user_uuid varchar(36) NOT NULL UNIQUE,
    user_selected_search_locations JSON NOT NULL,
    user_selected_search_locations_count INT NOT NULL,
    user_selected_map_locations JSON NOT NULL,
    user_selected_map_locations_count INT NOT NULL,
    app_time_ms INT NOT NULL DEFAULT 0,
    info_time_ms INT NOT NULL DEFAULT 0,
    video_time_ms INT NOT NULL DEFAULT 0,
    video_opened tinyint(1) NOT NULL DEFAULT 0,
    video_played tinyint(1) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    wwt_time_reset_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_reverse_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_play_pause_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_speedups JSON NOT NULL DEFAULT ("[]"),
    wwt_slowdowns JSON NOT NULL DEFAULT ("[]"),
    wwt_rate_selections JSON NOT NULL DEFAULT ("[]"),
    wwt_start_stop_times JSON NOT NULL DEFAULT ("[]"),

    PRIMARY KEY(id),
    INDEX(user_uuid)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
