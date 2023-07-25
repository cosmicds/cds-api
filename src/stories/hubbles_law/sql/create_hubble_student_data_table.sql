CREATE TABLE HubbleStudentData (
    student_id int(11) UNSIGNED NOT NULL UNIQUE,
    hubble_fit_value FLOAT,
    hubble_fit_unit varchar(20),
    age_value FLOAT,
    age_unit varchar(20),
    last_data_update TIMESTAMP NOT NULL,

    PRIMARY KEY(student_id),
    FOREIGN KEY(student_id)
      REFERENCES Students(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
