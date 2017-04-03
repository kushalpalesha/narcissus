CREATE TABLE IF NOT EXISTS emp (
  name varchar,
  designation varchar,
  salary number,
  address varchar,
  manager varchar,
  username varchar
);

INSERT INTO emp (name, designation, salary, address, manager, username) VALUES ('Manny', 'manager', 10000, 'San Jose', 'Tim', 'manny');
INSERT INTO emp (name, designation, salary, address, manager, username) VALUES ('Trudy', 'employee', 5000, 'San Jose', 'Manny', 'trudy');
INSERT INTO emp (name, designation, salary, address, manager, username) VALUES ('Alice', 'employee', 7000, 'San Jose', 'Manny', 'alice');
