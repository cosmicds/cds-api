import os
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
    INNER JOIN Students
		ON Students.id = HubbleMeasurements.student_id
WHERE
    rest_wave_value IS NOT NULL
        AND obs_wave_value IS NOT NULL
        AND est_dist_value IS NOT NULL
        AND velocity_value IS NOT NULL
        AND ang_size_value IS NOT NULL
        AND Students.seed = 1
        AND Students.team_member != "jon"
	GROUP BY student_id
	HAVING COUNT(student_id) = 5
"""

cursor.execute(STUDENT_IDS)
data = [x for x in cursor]

index = 0
class_size_bounds = [22, 28]
num_classes = ceil(len(data) * len(class_size_bounds) / sum(class_size_bounds))
educator_id = 1
for i in range(num_classes):
    size = randint(*class_size_bounds)
    new_class = data[index:index+size]
    class_name = f"Test class {i}"
    cursor.execute(MAKE_CLASS, (class_name, educator_id, class_name))
    cursor.execute(GET_CLASS_BY_NAME, [class_name])
    class_info = next(cursor)
    class_id = class_info[0]
    student_classes = [(sid[0], class_id) for sid in new_class]
    cursor.executemany(ADD_STUDENT_TO_CLASS, student_classes)

conn.commit()
