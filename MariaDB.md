
## MariaDB setup

This guide assumes you have MariaDB installed and running.

## Database Creation

If you followed the Debian installation instructions
when you installed MariaDB (securely), you will not be able to log in as
as the database root user, but you will have created an admin user with sufficient
privileges to create new databases.

```bash
# Log into the MariaDB server
> mysql -u admin -p
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 90
Server version: 10.2.10-MariaDB mariadb.org binary distribution

Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

Choose a good name for the database and the user. I usually use the same name for
both and it reflects something about the facility you are creating a deployment for.
 
Chose a very good password - probably generated from LastPass or wherever.

**You will need to keep  a copy of the password to configure the
zf_server for this deployment.**

Edit the script below and replace the obvious zf_good_name and 
some_really_good_password with your chosen values.  Then run the 
edited script in your MariaDB terminal.

```bash 
CREATE USER 'zf_good_name'@'localhost' IDENTIFIED BY 'some_really_good_password';
GRANT USAGE ON *.* TO 'zf_good_name'@'localhost'
REQUIRE NONE
WITH MAX_QUERIES_PER_HOUR 0
MAX_CONNECTIONS_PER_HOUR 0
MAX_UPDATES_PER_HOUR 0
MAX_USER_CONNECTIONS 0
CREATE DATABASE IF NOT EXISTS `zf_good_name`;
GRANT ALL PRIVILEGES ON `zf\_good\_name`.* TO 'zf_good_name'@'localhost';
```
