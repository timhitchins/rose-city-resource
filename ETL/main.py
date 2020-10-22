import psycopg2
import sys
import os
import json
from airtable import Airtable
import pandas

# The database connection string is the first argument passed to this script when run from node.js
# connection_string = str(sys.argv[1])


# Connect to the database
db = psycopg2.connect(connection_string)
cursor = db.cursor()


# --------- Helper Functions --------- #

def log(message):
    query = ("select etl_log('{msg}');").format(msg=message)
    cursor.execute(query)
    db.commit()


def create_import_table(table_name, json_data):

    # Normalize the JSON data to simplify processing
    data = pandas.json_normalize(json_data)

    # Strip off the 'fields.' prefix that pandas adds to the column names
    columns = data.columns
    new_columns = []
    for column in columns:
        new_columns.append(str(column).replace("fields.", ""))
    data.columns = new_columns

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
# log("Import the 'listings' airtable")
# listings_airtable = Airtable(AIRTABLE_BASE_ID, 'listings', AIRTABLE_API_KEY)
# listings = listings_airtable.get_all()
# create_import_table('etl_import_1', listings)
# del listings_airtable
# del listings
# log("Import the 'phone' airtable")
# phone_airtable = Airtable(AIRTABLE_BASE_ID, 'phone', AIRTABLE_API_KEY)
# phone = phone_airtable.get_all()
# create_import_table('etl_import_2', phone)
# del phone_airtable
# del phone
# log("Import the 'address' airtable")
# address_airtable = Airtable(AIRTABLE_BASE_ID, 'address', AIRTABLE_API_KEY)
# address = address_airtable.get_all()
# create_import_table('etl_import_3', address)
# del address_airtable
# del address

# --------- PHASE 2: Merge multiple tables into a single staging table --------- #
query = ("select etl_log('{msg}');").format(msg=message)
cursor.execute(query)
db.commit()

# --------- PHASE 3: Validate data --------- #


# --------- PHASE 4: Geocode addresses --------- #


# --------- PHASE 5: Additional data pre-processing --------- #


# Close the connection
log("Python ETL Script End")
cursor.close()
db.close()
