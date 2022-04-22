CREATE TABLE StoryStates (
    student_id int(11) UNSIGNED NOT NULL,
    story_name varchar(50) NOT NULL,
    story_state JSON NOT NULL,

    PRIMARY KEY(student_id, story_name),
    INDEX(student_id),
    INDEX(story_name),
    FOREIGN KEY (student_id)
        REFERENCES Students(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (story_name)
        REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
