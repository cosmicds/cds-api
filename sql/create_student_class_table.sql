CREATE TABLE StudentsClasses (
    student_id int(11) UNSIGNED NOT NULL,
    class_id int(11) UNSIGNED NOT NULL,
    joined datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(student_id, class_id),
    FOREIGN KEY(student_id)
        REFERENCES Students(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(class_id)
        REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
