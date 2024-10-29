CREATE TABLE HubbleClassMergeGroups(
	group_id int(11) UNSIGNED NOT NULL,
    class_id int(11) UNSIGNED NOT NULL UNIQUE,
    merge_order int(11) UNSIGNED NOT NULL,
    
    PRIMARY KEY(group_id, class_id),
    INDEX(group_id),
    INDEX(class_id),
    FOREIGN KEY(class_id)
		REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
