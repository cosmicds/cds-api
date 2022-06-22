CREATE TABLE Galaxies(
    id int(11) UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
    name varchar(32) NOT NULL UNIQUE,
    ra FLOAT NOT NULL,
    decl FLOAT NOT NULL,
    z FLOAT NOT NULL,
    type varchar(10) NOT NULL,
    element varchar(10) NOT NULL DEFAULT "H-α",
    marked_bad tinyint(2) NOT NULL DEFAULT 0,
    is_bad tinyint(2) NOT NULL DEFAULT 0,
    spec_marked_bad int NOT NULL DEFAULT 0,
    spec_is_bad tinyint(2) NOT NULL DEFAULT 0,
    tileload_marked_bad int NOT NULL DEFAULT 0,

    PRIMARY KEY(id)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci PACK_KEYS=0;
