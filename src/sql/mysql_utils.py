import mysql.connector

def connect_to_db(host, username, password):
    return mysql.connector.connect(
        host=host,
        user=username,
        password=password
    )


