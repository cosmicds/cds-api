CREATE TABLE UserExperienceRatings (
	story_name varchar(32) NOT NULL,
    rating ENUM("very_bad", "poor", "good", "excellent") DEFAULT NULL,
    uuid varchar(36) NOT NULL,
    comments TEXT DEFAULT NULL,
    question TEXT NOT NULL,
    
    PRIMARY KEY(uuid),
    INDEX(story_name),
    INDEX(uuid, story_name),
    FOREIGN KEY(story_name)
		REFERENCES Stories(name)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
