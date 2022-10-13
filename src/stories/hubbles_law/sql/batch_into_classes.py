import os
import re
from math import ceil
from os.path import join
from dotenv import load_dotenv
from random import randint
from mysql.connector import connect

dotenv_path = join("..", "..", "..", "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

conn = connect(
    host=os.getenv("DB_HOSTNAME"),
    user=os.getenv("DB_USERNAME"),
    password=os.getenv("DB_PASSWORD")
)
cursor = conn.cursor()
cursor.execute("USE cosmicds_db")

CLASS_SIZE_BOUNDS = [15, 20]

MAKE_CLASS = """
INSERT INTO Classes (name, educator_id, code)
VALUES (%s, %s, %s)
"""

ADD_STUDENT_TO_CLASS = """
INSERT INTO StudentsClasses (student_id, class_id)
VALUES (%s, %s)
"""

GET_CLASS_BY_NAME = """
SELECT * FROM Classes WHERE name = %s
"""

STUDENT_IDS = """
SELECT 
    student_id
FROM
    HubbleMeasurements
        INNER JOIN
    Students ON Students.id = HubbleMeasurements.student_id
WHERE
    student_id NOT IN (SELECT 
            student_id
        FROM
            StudentsClasses)
        AND rest_wave_value IS NOT NULL
        AND obs_wave_value IS NOT NULL
        AND est_dist_value IS NOT NULL
        AND velocity_value IS NOT NULL
        AND ang_size_value IS NOT NULL
        AND Students.seed = 1
        AND Students.team_member != 'jon'
GROUP BY student_id
"""

TEST_CLASS_NAMES = """
SELECT 
    name
FROM
    Classes
WHERE
    name LIKE 'Test class%';"""

CLASS_SIZE = """
SELECT COUNT(StudentsClasses.student_id) FROM Classes
INNER JOIN StudentsClasses ON Classes.id = StudentsClasses.class_id
WHERE Classes.id = {id}
GROUP BY StudentsClasses.class_id"""

EXISTING_TEST_CLASSES_TO_USE = """
SELECT 
    id
FROM
    Classes
WHERE
    id IN (SELECT 
            class_id
        FROM
            StudentsClasses
        GROUP BY class_id
        HAVING COUNT(class_id) < {n})
        AND name LIKE 'Test class%'
""".format(n=CLASS_SIZE_BOUNDS[0])

def get_class_size(cursor, class_id):
    cursor.execute(CLASS_SIZE.format(id=class_id))
    data = [x for x in cursor]
    if len(data) == 0:
        return 0
    else:
        return data[0][0]

cursor.execute(STUDENT_IDS)
data = [x for x in cursor]

cursor.execute(TEST_CLASS_NAMES)
test_class_names = [x[0] for x in cursor]
p = re.compile("Test class (\\d+)")
matches = [p.match(name) for name in test_class_names]
tc_num = max(int(m.groups(0)[0]) for m in matches) + 1

cursor.execute(EXISTING_TEST_CLASSES_TO_USE)
existing_classes_to_use = [x[0] for x in cursor]

class_index = 0
data_index = 0
educator_id = 1
while data_index < len(data):
    size = randint(*CLASS_SIZE_BOUNDS)
    if class_index < len(existing_classes_to_use):
        class_id = existing_classes_to_use[class_index]
        existing_class_size = get_class_size(cursor, class_id)
        to_add = max(size - existing_class_size, 0)
        class_index += 1
        if to_add == 0:
            continue
    else:
        to_add = size
        class_name = f"Test class {tc_num}"
        tc_num += 1
        cursor.execute(MAKE_CLASS, (class_name, educator_id, class_name))
        cursor.execute(GET_CLASS_BY_NAME, [class_name])
        class_info = next(cursor)
        class_id = class_info[0]

    new_class = data[data_index:data_index+to_add]
    data_index += to_add
    student_classes = [(sid[0], class_id) for sid in new_class]
    cursor.executemany(ADD_STUDENT_TO_CLASS, student_classes)

conn.commit()
