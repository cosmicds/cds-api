ALTER TABLE Galaxies
ADD element varchar(10) NOT NULL DEFAULT "H-α"

UPDATE Galaxies
SET element = "Mg-I"
WHERE type = "E";
