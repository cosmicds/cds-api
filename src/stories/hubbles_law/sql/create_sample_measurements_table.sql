CREATE TABLE SampleHubbleMeasurements (
    student_id int(11) UNSIGNED NOT NULL,
    galaxy_id int(11) UNSIGNED NOT NULL,
    measurement_number ENUM('first', 'second') NOT NULL DEFAULT 'first',
    rest_wave_value FLOAT,
    rest_wave_unit varchar(20),
    obs_wave_value FLOAT,
    obs_wave_unit varchar(20),
    velocity_value FLOAT,
    velocity_unit varchar(20),
    ang_size_value int(11),
    ang_size_unit varchar(20),
    est_dist_value int(11),
    est_dist_unit varchar(20),
    brightness FLOAT NOT NULL DEFAULT 1,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(student_id, galaxy_id, measurement_number),
    INDEX(student_id),
    INDEX(galaxy_id),
    FOREIGN KEY(student_id)
      REFERENCES Students(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
    FOREIGN KEY(galaxy_id)
      REFERENCES Galaxies(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
