/* SQL commands to create the tables used by this version of Rose City Resource */

/*
    NOTE:
    - Tables that begin with 'etl_' are only used during the ETL process and for previewing imported data with '&datatable=staging'
    - Tables neeeded for production are prefaced with 'production_'
    - Run the commands in this file when setting up a new database instance and then run the ETL process at least once to populate with data
*/

/* Extensions */
CREATE EXTENSION IF NOT EXISTS citext; -- Allows case-insensitive data columns such as an email address

/* Contains data related to the production data set */
CREATE TABLE IF NOT EXISTS production_meta (
  last_update timestamp with time zone
)

/* Contains login credentials for the admin page */
CREATE TABLE IF NOT EXISTS production_user (
    id SERIAL PRIMARY KEY,
    name character varying(256) NOT NULL,
    email character varying(128) NOT NULL,
    password character varying(256) NOT NULL
)

/* NOTE: the production_data table is created by the SQL function etl_import_to_production() */

/* Contains data related to the ETL job */
CREATE TABLE IF NOT EXISTS etl_run_meta (
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  started_by int
)

/* Contains the ETL log */
CREATE TABLE IF NOT EXISTS etl_run_log (
  time_stamp timestamp with time zone,
  message text
)

/* Adds an entry to the ETL log */
DROP FUNCTION IF EXISTS etl_log;
CREATE FUNCTION etl_log(in message character varying, out void) AS '
  INSERT INTO public.etl_run_log (time_stamp, message)
  VALUES (current_timestamp, message)
' LANGUAGE sql;

/* Clears data from all ETL tables (tables still exist but with no rows) */
DROP FUNCTION IF EXISTS etl_clear_tables;
CREATE FUNCTION etl_clear_tables() RETURNS void AS $$
  DECLARE row record;
  BEGIN
    FOR row IN
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name LIKE 'etl_%'
	  AND table_schema = 'public'
	  AND table_type = 'BASE TABLE'
    LOOP
      EXECUTE 'DELETE FROM ' || quote_ident(row.table_schema) || '.' || quote_ident(row.table_name);
    END LOOP;
  END;
$$ LANGUAGE plpgsql;

/* Combines the data from the import tables into a single staging table */
DROP FUNCTION IF EXISTS etl_merge_import_tables;
CREATE FUNCTION etl_merge_import_tables(out void) AS $$
  DROP TABLE IF EXISTS etl_staging_1; CREATE TABLE etl_staging_1 AS
	  SELECT general_category, main_category, I5.name as parent_organization,
	  I4.listing_organization as listing, service_description, covid_message,
	  I3.street, street2, city, postal_code, website, hours, '' as lon, '' as lat,
	  REGEXP_REPLACE(
	    REGEXP_REPLACE((
		    SELECT string_agg(I2.type || ':' || I2.phone, ',') FROM etl_import_2 as I2 WHERE I1.phone LIKE '%' || I2.id || '%'
	    ), /* Replace unwanted characters with nothing */'^\:\s*|^\s+|\s+$|\s*\(|\)', '', 'g'),
	       /* Replace spaces between numbers with a dash */'(?<=\d)(\s+|\-\s|\s\-)(?=\d)', '-', 'g') as phone,
	  CASE WHEN I3.street <> '' THEN (SELECT I3.street || ', ' || city || ', OR ' || postal_code) ELSE '' END as full_address
	  FROM etl_import_1 as I1
	  LEFT JOIN etl_import_3 as I3 ON I1.street = I3.id
	  LEFT JOIN etl_import_4 as I4 ON I1.contacts = I4.id
	  LEFT JOIN etl_import_5 as I5 ON I1.parent_organization = I5.id
	  ORDER BY listing;
  ALTER TABLE etl_staging_1 ADD COLUMN id SERIAL PRIMARY KEY;
$$ LANGUAGE sql;

/* Perform additional actions on the staging table after geocoding is complete */
DROP FUNCTION IF EXISTS etl_finalize_staging_table;
CREATE FUNCTION etl_finalize_staging_table(out void) AS '
  ALTER TABLE etl_staging_1 DROP COLUMN full_address;
' LANGUAGE sql;

/* Perform validation against the staging table and return any issues found */
DROP FUNCTION IF EXISTS etl_validate_staging_table;
CREATE FUNCTION etl_validate_staging_table()
RETURNS TABLE (Test text, Details text, id int, listing text) AS $$
  -- Address exists but either lat or lon is an empty string
  SELECT 'Address (missing geolocation)' as Test,
  street as Details, id, listing
  FROM etl_staging_1
  WHERE (street IS NOT NULL AND street <> '' AND (lon = '' OR lat = ''))
  UNION ALL
  -- Phone number exists but type is null (causing it not to show up in the phone field)
  SELECT 'Phone (missing type)' as Test,
  phone as Details, id, listing
  FROM etl_staging_1
  WHERE phone !~ '\w+\:[\d-]+(\,\w+\:[\d-]+)*'
  -- Maybe check for multiple records with the same listing + parent?
  -- Check for latitudes too far off from 45.52345 or longitudes too far off from -122.6762?
$$ LANGUAGE sql;

/* Get the size of the database in human-friendly units */
DROP FUNCTION IF EXISTS get_database_size;
CREATE FUNCTION get_database_size(out character varying) AS '
  SELECT pg_size_pretty(pg_database_size(current_database()));
' LANGUAGE sql;

/* Get the total number of rows in the database */
DROP FUNCTION IF EXISTS get_database_numrows;
CREATE FUNCTION get_database_numrows(out character varying) AS $$
  SELECT CAST(SUM(reltuples) as VARCHAR)
  FROM pg_class C
  LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
  WHERE nspname NOT IN ('pg_catalog', 'information_schema') AND relkind='r';
$$ LANGUAGE sql;

/* Imports the content of the staging table to the production table */
DROP FUNCTION IF EXISTS etl_import_to_production;
CREATE FUNCTION etl_import_to_production(out void) AS '
  DROP TABLE IF EXISTS production_data; CREATE TABLE production_data AS
  SELECT * FROM etl_staging_1;
  DELETE FROM production_meta;
  INSERT INTO production_meta (last_update) VALUES (NOW());
  DELETE FROM etl_run_log;
' LANGUAGE sql;

/* Safety check for the buttons on the admin page */
DROP FUNCTION IF EXISTS get_etl_status;
CREATE FUNCTION get_etl_status()
RETURNS TABLE (etl_started VARCHAR(16), etl_ran_to_completion VARCHAR(16), minutes_since_last_log VARCHAR(64), etl_staging_1_num_rows VARCHAR(16)) AS $$
  SELECT
  	CAST((SELECT COUNT(*) FROM etl_run_log WHERE message LIKE '%Python ETL Script Start%') > 0 as VARCHAR) as etl_started,
    CAST((SELECT COUNT(*) FROM etl_run_log WHERE message LIKE '%Python ETL Script End%') > 0 as VARCHAR) as etl_ran_to_completion,
    CAST((EXTRACT(EPOCH FROM current_timestamp - (SELECT MAX(time_stamp)))/60) as VARCHAR) as minutes_since_last_log,
	CAST((SELECT COUNT(*) FROM etl_staging_1) as VARCHAR) as etl_staging_1_num_rows
  FROM etl_run_log
$$ LANGUAGE sql;

/* Change password for user account matching the provided email address */
DROP FUNCTION IF EXISTS change_password;
CREATE FUNCTION change_password(in _email character varying (128), in _password character varying (256), out void) AS '
  UPDATE production_user
  SET password=_password
  WHERE email = _email;
' LANGUAGE sql;
