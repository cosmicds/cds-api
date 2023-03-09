CREATE TABLE StudentOptions (
    student_id int(11) UNSIGNED NOT NULL,
    speech_autoread tinyint(2) NOT NULL DEFAULT 0,
    speech_rate FLOAT NOT NULL DEFAULT 1,
    speech_pitch FLOAT NOT NULL DEFAULT 1,

    PRIMARY KEY(student_id),
    FOREIGN KEY(student_id)
        REFERENCES Students(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
