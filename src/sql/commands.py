import os
import sys
from os.path import join
from dotenv import load_dotenv
from mysql.connector.errors import ProgrammingError
from mysql_utils import connect_to_db
from os.path import dirname, join, realpath

script_dir = dirname(realpath(sys.argv[0]))
dotenv_path = join("..", "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

def connect_to_cds_db():
    host = os.getenv("DB_HOSTNAME")
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")

    conn = connect_to_db(host, username, password)
    return conn

def connect_to_local_db():
    host = "localhost"
    username = "jon"
    password = "Testp@ss123"

    conn = connect_to_db(host, username, password)
    return conn

def execute_file(cursor, filepath, multi=True):
    with open(filepath, 'r') as f:
        command = f.read()
    cursor.execute(command, multi=multi)

def create_student_table(cursor):
    execute_file(cursor, join(script_dir, "create_student_table.sql"))

def create_educator_table(cursor):
    execute_file(cursor, join(script_dir, "create_educator_table.sql"))

def create_class_table(cursor):
    execute_file(cursor, join(script_dir, "create_class_table.sql"))

def create_student_class_table(cursor):
    execute_file(cursor, join(script_dir, "create_student_class_table.sql"))

def create_galaxy_table(cursor):
    execute_file(cursor, join(script_dir, "create_galaxy_table.sql"))

def create_hubble_data_table(cursor):
    execute_file(cursor, join(script_dir, "create_hubble_data_table.sql"))

def create_hubble_measurements_table(cursor):
    execute_file(cursor, join(script_dir, "create_hubble_measurements_table.sql"))

def create_hubble_responses_table(cursor):
    execute_file(cursor, join(script_dir, "create_hubble_responses_table.sql"))

def create_story_states_table(cursor):
    execute_file(cursor, join(script_dir, "create_story_states_table.sql"))

def insert_dummy_entries(cursor):
    for kind in ["students", "educators", "classes"]:
        execute_file(cursor, f"insert_dummy_{kind}.sql")

def drop_table(cursor, table_name):
    cursor.execute(f"DROP TABLE {table_name}")

def create_database(cursor, db_name):
    cursor.execute(f"CREATE DATABASE {db_name}")

def use_database(cursor, db_name):
    cursor.execute(f"USE {db_name}")

def drop_database(cursor, db_name):
    cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")

def upload_galaxy_data(cursor):
    execute_file(cursor, join(script_dir, "insert_galaxy_data.sql"))

#conn = connect_to_cds_db()
conn = connect_to_local_db()

cursor = conn.cursor()
use_database(cursor, "cosmicds_db")

if len(sys.argv) > 1:
    arg = sys.argv[1]
    if arg == 'create':
        create_student_table(cursor)
        create_educator_table(cursor)
        create_class_table(cursor)
        create_student_class_table(cursor)
        create_hubble_measurements_table(cursor)
        create_story_states_table(cursor)
    elif arg == 'drop':
        for table in reversed(["Students",
                               "Educators",
                               "Classes",
                               "StudentsClasses",
                               "StoryStates",
                               "HubbleMeasurements"
                            ]):
            try:
                drop_table(cursor, table)
            except ProgrammingError as e:
                print(e)
