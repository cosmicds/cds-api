CREATE VIEW ClassesWixView AS
    SELECT 
        id AS _id,
        created AS _createdDate,
        updated AS _updatedDate,
        active,
        educator_id,
        name,
        asynchronous,
        code,
        'cosmicds' AS _owner
    FROM
        Classes;
