CREATE TABLE ClassStories (
    class_id int(11) UNSIGNED NOT NULL,
    story_name varchar(50) NOT NULL,
    active tinyint(2) NOT NULL DEFAULT 1,

    PRIMARY KEY(class_id, story_name),
    INDEX(class_id),
    INDEX(story_name),
    FOREIGN KEY(class_id)
        REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(story_name)
        REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
