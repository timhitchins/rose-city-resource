-- SQL commands to create the tables used by this version of Rose City Resource

CREATE EXTENSION citext;

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

CREATE TABLE etl_staging (
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

CREATE FUNCTION etl_log(in message character varying, out void) AS '
  INSERT INTO public.etl_run_log (time_stamp, message)
  VALUES (current_timestamp, message)
' LANGUAGE sql;

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