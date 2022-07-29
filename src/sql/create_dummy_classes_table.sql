CREATE TABLE DummyClasses (
    story_name varchar(50) NOT NULL,
    class_id int(11) UNSIGNED NOT NULL,

    PRIMARY KEY(story_name, class_id),
    INDEX(story_name),
    INDEX(class_id),
    FOREIGN KEY(story_name)
        REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(class_id)
        REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
