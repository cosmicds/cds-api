CREATE TABLE UserExperienceRating(
	story_name varchar(32) NOT NULL,
    rating ENUM("very_bad", "poor", "medium", "good", "excellent") DEFAULT NULL,
    uuid varchar(36) NOT NULL UNIQUE,
    comments TEXT DEFAULT NULL,
    
    PRIMARY KEY(uuid),
    INDEX(story_name),
    FOREIGN KEY(story_name)
		REFERENCES Stories(name)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
