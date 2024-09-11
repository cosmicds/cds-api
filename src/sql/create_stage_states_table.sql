CREATE TABLE StageStates (
    student_id int(11) UNSIGNED NOT NULL,
    story_name varchar(50) NOT NULL,
    stage_name varchar(50) NOT NULL,
    state JSON NOT NULL,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(student_id, story_name, stage_name),
    INDEX(student_id),
    INDEX(story_name),
    INDEX(stage_name),
    FOREIGN KEY(student_id)
        REFERENCES Students(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(story_name)
        REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
