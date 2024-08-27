CREATE TABLE Stages (
    story_name varchar(50) NOT NULL UNIQUE,
    stage_name varchar(50) NOT NULL UNIQUE,
    stage_index int(11) UNSIGNED DEFAULT NULL,

    PRIMARY KEY(story_name, stage_name),
    INDEX(story_name),
    INDEX(stage_name),
    FOREIGN KEY(story_name)
        REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
