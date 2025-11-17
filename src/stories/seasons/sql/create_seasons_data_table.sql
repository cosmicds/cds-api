CREATE TABLE SeasonsData (
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    user_uuid varchar(36) NOT NULL UNIQUE,
    app_time_ms INT NOT NULL DEFAULT 0,
    user_selected_dates JSON NOT NULL DEFAULT (JSON_ARRAY()),
    user_selected_dates_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    user_selected_locations JSON NOT NULL DEFAULT (JSON_ARRAY()),
    user_selected_locations_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    time_slider_used_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    events JSON NOT NULL DEFAULT (JSON_ARRAY()),
    aha_moment_response TEXT DEFAULT NULL,
    wwt_time_reset_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_reverse_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_play_pause_count int(11) UNSIGNED NOT NULL DEFAULT 0,
    wwt_speedups JSON NOT NULL DEFAULT (JSON_ARRAY()),
    wwt_slowdowns JSON NOT NULL DEFAULT (JSON_ARRAY()),
    wwt_rate_selections JSON NOT NULL DEFAULT (JSON_ARRAY()),
    wwt_start_stop_times JSON NOT NULL DEFAULT (JSON_ARRAY()),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(id),
    INDEX(user_uuid)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
