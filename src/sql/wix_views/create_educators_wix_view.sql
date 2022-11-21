CREATE VIEW EducatorsWixView AS
    SELECT 
        id AS _id,
        profile_created AS _createdDate,
        last_visit AS _updatedDate,
        email,
        password,
        institution,
        verified,
        'cosmicds' AS _owner
    FROM
        Educators;
