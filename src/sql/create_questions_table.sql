CREATE TABLE Questions (
	id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    tag varchar(50) NOT NULL,
    text varchar(3000) NOT NULL,
    shorthand varchar(500) NOT NULL,
    story_name varchar(50) NOT NULL,
    version int(11) NOT NULL DEFAULT 1,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id),
    INDEX(tag),
    FOREIGN KEY(story_name)
		REFERENCES Stories(name)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
    
