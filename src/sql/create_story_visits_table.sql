CREATE TABLE StoryVisitInfo (
	id int UNSIGNED NOT NULL,
	story_name varchar(50) NOT NULL,
    info JSON NOT NULL,
    timestamp datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(story_name) REFERENCES Stories(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci PACK_KEYS=0;
