CREATE TABLE HubbleClassData (
    class_id int(11) UNSIGNED NOT NULL UNIQUE,
    hubble_fit_value FLOAT,
    hubble_fit_unit varchar(20),
    age_value FLOAT,
    age_unit varchar(20),

    PRIMARY KEY(class_id),
    FOREIGN KEY(class_id),
      REFERENCES Class(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
