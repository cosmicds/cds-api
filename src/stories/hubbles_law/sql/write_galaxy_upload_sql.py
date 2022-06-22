import csv

sql = "INSERT INTO Galaxies (name, ra, decl, z, type) VALUES (\"%s\", %f, %f, %f, \"%s\");"
filename = "Galaxies.csv"
output = "insert_galaxy_data_raw.sql"
with open(filename, 'r') as csvfile, open(output, 'w') as outfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        data = (row["name"], float(row["ra"]), float(row["decl"]), float(row["z"]), row["type"])
        statement = sql % data
        outfile.write(statement)
        outfile.write('\n')
