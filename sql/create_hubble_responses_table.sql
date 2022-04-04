CREATE TABLE HubbleResponses (
    student_id int(11) UNSIGNED NOT NULL UNIQUE,

    PRIMARY KEY(student_id),
    FOREIGN KEY (student_id)
      REFERENCES Students(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
