-- SQL commands to create the tables used by this version of Rose City Resource

CREATE EXTENSION IF NOT EXISTS citext;

-- ISSUE 10 TABLES (FOR REFERENCE)

-- CREATE TABLE listing (
--   id VARCHAR(255),
--   general_category VARCHAR(255),
--   main_category VARCHAR(255),
--   parent_organization VARCHAR(255),
--   listing TEXT,
--   service_description TEXT,
--   covid_message VARCHAR(255),
--   emergency_message VARCHAR(255),
--   street VARCHAR(255),
--   street2 VARCHAR(255),
--   city VARCHAR(255),
--   postal_code VARCHAR(10),
--   website VARCHAR(1024),
--   hours TEXT,
--   lon VARCHAR(255),
--   lat VARCHAR(255)
-- )

-- CREATE TABLE phone (
--   id VARCHAR(50),
--   phone_id VARCHAR(50),
--   phone VARCHAR(50),
--   phone2 VARCHAR(50),
--   type VARCHAR(255)
-- )

-- CREATE TABLE meta (
--   last_update timestamp without time zone
-- )

CREATE TABLE prod_listing (
  id VARCHAR(255),
  general_category VARCHAR(255),
  main_category VARCHAR(255),
  parent_organization VARCHAR(255),
  listing TEXT,
  service_description TEXT,
  covid_message VARCHAR(255),
  emergency_message VARCHAR(255),
  street VARCHAR(255),
  street2 VARCHAR(255),
  city VARCHAR(255),
  postal_code VARCHAR(10),
  website VARCHAR(1024),
  hours TEXT,
  lon VARCHAR(255),
  lat VARCHAR(255),
  phone VARCHAR(50),
  phone2 VARCHAR(50)
)

CREATE TABLE prod_meta (
  last_update timestamp without time zone
)

CREATE TABLE prod_user (
  id serial primary key,
  email citext
)

CREATE TABLE etl_run_meta (
  start_time timestamp without time zone,
  end_time timestamp without time zone,
  started_by int
)

CREATE TABLE etl_run_log (
  time_stamp timestamp without time zone,
  log_message text
)

DROP FUNCTION IF EXISTS etl_log;
CREATE FUNCTION etl_log(in message character varying, out void) AS '
  INSERT INTO public.etl_run_log (time_stamp, message)
  VALUES (current_timestamp, message)
' LANGUAGE sql;

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

DROP FUNCTION IF EXISTS etl_merge_import_tables;
CREATE FUNCTION etl_merge_import_tables(out void) AS $$
  DROP TABLE IF EXISTS etl_staging_1; CREATE TABLE etl_staging_1 AS
	  SELECT general_category, main_category, I6.name as parent_organization,
	  I5.listing_organization as listing, service_description, covid_message,
	  I3.street, street2, city, postal_code, website, hours, '' as lon, '' as lat,
	  REPLACE((
      SELECT string_agg(I2.phone || ' (' || I2.type || ')', ', ')
      FROM etl_import_2 as I2 WHERE I1.listing = I2.listing GROUP BY I2.listing
    ), ' ()', '') as phone,
	  (SELECT I3.street || ', ' || city || ', OR ' || postal_code) as full_address
	  FROM etl_import_1 as I1
	  LEFT JOIN etl_import_3 as I3 ON I1.street = I3.id
	  LEFT JOIN etl_import_5 as I5 ON I1.contacts = I5.id
	  LEFT JOIN etl_import_6 as I6 ON I1.parent_organization = I6.id
	  ORDER BY listing;
  ALTER TABLE etl_staging_1 ADD COLUMN id SERIAL PRIMARY KEY;
$$ LANGUAGE sql;

DROP FUNCTION IF EXISTS etl_finalize_staging_table;
CREATE FUNCTION etl_finalize_staging_table(in message character varying, out void) AS '
  ALTER TABLE etl_staging_1 DROP COLUMN full_address;
' LANGUAGE sql;

DROP FUNCTION IF EXISTS etl_validate_staging_table;
CREATE FUNCTION etl_validate_staging_table(out void) AS $$
  -- Address exists but either lat or lon is an empty string
  SELECT 'Address (missing geolocation)' as Test,
  'Address: ' || street as Details, id, listing
  FROM etl_staging_1
  WHERE (street IS NOT NULL AND street <> '' AND (lon = '' OR lat = ''))
  UNION ALL
  -- Phone number exists but type is null (causing it not to show up in the phone field)
  SELECT 'Phone (missing type)' as Test,
  'Number: ' || phone as Details, id, listing
  FROM etl_staging_1
  WHERE phone NOT LIKE '%(%'
$$ LANGUAGE sql;
