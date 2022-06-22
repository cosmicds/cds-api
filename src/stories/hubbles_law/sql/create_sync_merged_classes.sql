CREATE TABLE SyncMergedHubbleClasses (

    /*
    The ID of the class that needs more data
    i.e. it's too small
    */
    class_id int(11) UNSIGNED NOT NULL UNIQUE,

    /* The ID of the class that's merged in */
    merged_class_id int(11) UNSIGNED NOT NULL,

    merged datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (class_id, merged_class_id),
    FOREIGN KEY(class_id)
        REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(merged_class_id)
        REFERENCES Classes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
