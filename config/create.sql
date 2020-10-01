CREATE TABLE listing (
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
  lat VARCHAR(255)
)

CREATE TABLE phone (
  id VARCHAR(50),
  phone_id VARCHAR(50),
  phone VARCHAR(50),
  phone2 VARCHAR(50),
  type VARCHAR(255)
)
