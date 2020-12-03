import psycopg2
import sys
import os
import json
from airtable import Airtable
import pandas
from geopy.geocoders import Nominatim

AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')

if AIRTABLE_API_KEY == None or AIRTABLE_API_KEY == '':
    print('The Airtable API key is missing')
    sys.exit(10)

if AIRTABLE_BASE_ID == None or AIRTABLE_BASE_ID == '':
    print('The Airtable Base ID is missing')
    sys.exit(11)

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL == None or DATABASE_URL == '':
    if sys.argv[1] != None and sys.argv[1] != '':
        DATABASE_URL = sys.argv[1]

if DATABASE_URL == None or DATABASE_URL == '':
    print('The postgres connection string DATABASE_URL is missing')
    print('The local development postgres connection string requires manually adding environment variables')
    print('The DATABASE_URL string can be found by logging into Heroku and navigating to the postgres add-on details')
    print('The DATABASE_URL from Heroku should be copied verbatim to the same local development environment variable')
    print('Use the env command to verify that the current terminal instance contains the DATABASE_URL environment variable')
    sys.exit(12)

# Connect to the database
db = psycopg2.connect(DATABASE_URL)
cursor = db.cursor()

# --------- Helper Functions --------- #

# Log activity to a postgres table


def log(message):
    query = ("select etl_log('{msg}');").format(msg=message)
    cursor.execute(query)
    db.commit()

# Create a table in postgres


def create_import_table(table_name, json_data):
    # Data from airtables is NOT homogenous
    # Normalize the JSON data to simplify processing
    data = pandas.json_normalize(json_data)

    # Strip off the 'fields.' prefix that pandas adds to the column names
    columns = data.columns
    new_columns = []
    for column in columns:
        new_columns.append(str(column).replace(
            "fields.", "").replace(" ", "_").replace("-", ""))
    data.columns = new_columns
    print(new_columns)
    # Drop and Create the table
    sql = "DROP TABLE IF EXISTS {}; ".format(table_name)
    sql += "CREATE TABLE {} (".format(table_name)
    for name in data.columns:
        sql += "{} TEXT".format(name)
        if name != list(data.columns)[-1]:
            sql += ','
    sql += "); "
    cursor.execute(sql)
    db.commit()

    # Iterate through each row and add values
    sql = "INSERT INTO {} (".format(table_name) + \
        ','.join(data.columns) + ") VALUES "
    allrowvalues = []
    for index, row in data.iterrows():
        currentrowvalues = []
        for col in data.columns:
            # Get the values for the current row and sanitize them into clean string data
            currentrowvalues.append(
                "'" + str(row[col]).replace("'", "").replace("[", "").replace("]", "").replace("nan", "") + "'")
        allrowvalues.append(','.join(currentrowvalues))
    for item in allrowvalues:
        sql += "({})".format(item)
        if item != list(allrowvalues)[-1]:
            sql += ','
    cursor.execute(sql)
    db.commit()


log("Python ETL Script Start")

# --------- PHASE 1: Import from Airtables --------- #

log("Import the listings airtable")
listings_airtable = Airtable(AIRTABLE_BASE_ID, 'listings', AIRTABLE_API_KEY)
listings = listings_airtable.get_all()
create_import_table('etl_import_1', listings)
del listings_airtable
del listings

log("Import the phone airtable")
phone_airtable = Airtable(AIRTABLE_BASE_ID, 'phone', AIRTABLE_API_KEY)
phone = phone_airtable.get_all()
create_import_table('etl_import_2', phone)
del phone_airtable
del phone

log("Import the address airtable")
address_airtable = Airtable(AIRTABLE_BASE_ID, 'address', AIRTABLE_API_KEY)
address = address_airtable.get_all()
create_import_table('etl_import_3', address)
del address_airtable
del address

log("Import the contacts airtable")
contacts_airtable = Airtable(
    AIRTABLE_BASE_ID, 'contacts', AIRTABLE_API_KEY)
contacts = contacts_airtable.get_all()
create_import_table('etl_import_4', contacts)
del contacts_airtable
del contacts

log("Import the contacts airtable")
parent_airtable = Airtable(
    AIRTABLE_BASE_ID, 'parent_organization', AIRTABLE_API_KEY)
parent = parent_airtable.get_all()
create_import_table('etl_import_5', parent)
del parent_airtable
del parent

# --------- PHASE 2: Merge multiple tables into a single staging table --------- #

log("Merge the import tables")
query = ("select etl_merge_import_tables();")
cursor.execute(query)
db.commit()

# --------- PHASE 3: Geocode addresses --------- #

log("Geocode addresses")
# GeoPy Nominatim usage policy requires the HTTP User-Agent to be set to the application name
geolocator = Nominatim(user_agent="rose-city-resource")
query = "SELECT * FROM etl_staging_1;"
cursor.execute(query)
columns = []
for column in cursor.description:
    columns.append(column.name)
i_lat = columns.index('lat')
i_lon = columns.index('lon')
i_id = columns.index('id')
i_full_address = columns.index('full_address')
rows = cursor.fetchall()

for row in rows:

    address = row[i_full_address]
    if address == None or address == '':
        continue

    location = geolocator.geocode(address)
    lat = ''
    lon = ''

    try:
        lat = location.latitude
    except:
        lat = ''
    try:
        lon = location.longitude
    except:
        lon = ''

    sql = "UPDATE etl_staging_1 SET lat='{0}', lon='{1}' WHERE id='{2}';".format(
        lat, lon, row[i_id])
    cursor.execute(sql)
    db.commit()

# --------- PHASE 4: Additional data pre-processing and sanitization --------- #

# Log resource utilization
query = "select get_database_numrows()"
cursor.execute(query)
numrows = cursor.fetchone()[0]

query = "select get_database_size()"
cursor.execute(query)
size = cursor.fetchone()[0]

log("Peak postgres resource utilization: " +
    str(numrows) + " rows, " + str(size) + " disk space")

log("Finalize the staging table")
query = ("select etl_finalize_staging_table();")
cursor.execute(query)
db.commit()

# --------- END --------- #

# Close the connection
log("Python ETL Script End")
cursor.close()
db.close()