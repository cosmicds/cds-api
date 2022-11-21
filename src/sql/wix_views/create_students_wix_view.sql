CREATE VIEW StudentsWixView AS
    SELECT 
        id AS _id,
        profile_created AS _createdDate,
        last_visit AS _updatedDate,
        username,
        password,
        institution,
        seed,
        verified,
        email,
        'cosmicds' AS _owner
    FROM
        Students;
