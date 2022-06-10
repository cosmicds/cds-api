CREATE TABLE AsyncMergedHubbleStudentClasses (

    /*
    The student ID.
    The student is in the class specified by class_id
    */
    student_id int(11) UNSIGNED NOT NULL UNIQUE,

    /*
    The ID of the class that needs more data
    i.e. it's too small
    Note that we allow this value to be null
    for students that aren't in a class at all
    */
    class_id int(11) UNSIGNED DEFAULT NULL,

    /* The ID of the class that's merged in */
    merged_class_id int(11) UNSIGNED NOT NULL,

    merged datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(student_id, class_id, merged_class_id),
    INDEX(student_id),
    ADD CONSTRAINT FK_Student_Class
    FOREIGN KEY(student_id, class_id)
    REFERENCES StudentsClasses(student_id, class_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
