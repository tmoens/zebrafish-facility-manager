## MariaDB For a single facility

If you followed the instructions when installing MariaDB (securely) for the deployment
as a whole, you will not 
be able to log in as the database root user, but you will have created an admin
user with sufficient privileges to create new databases and you will know that the
admin user's password.  If you did not follow the instructions when installing
MariaDB, it is ok, but you have to do equivalent
operations to what is presented here.

Following the running example, 
1. you are setting up a database for the the Example University of Examples
1. you plan to use _eue_ as an abbreviation for the university.
1. we will assume that you set up the admin user with the password "x238JJp21Mo"

## Database Creation

Choose a good name for the database and the corresponding database user.
Following the example, let's call them both _zf_eue_
 
Chose a very good password - probably generated from LastPass or some other
service.  Please do not skimp on this.
Strictly for illustration, we will use _very_bad_eue_password_.

**You will need to remember whatever password you choose to configure the zf_server for this facility.**

Log in to MariaDB, create the user and the corresponding database.  Obviously,
you would use your own values instead of _zf_eue_ and _very_bad_eue_password_.

```bash 
# Log into the MariaDB server
mysql -u admin -p x238JJp21Mo
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 90
Server version: 10.2.10-MariaDB mariadb.org binary distribution

Copyright (c) 2000, 2017, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
CREATE USER 'zf_eue'@'localhost' IDENTIFIED BY 'very_bad_eue_password';
GRANT USAGE ON *.* TO 'zf_eue'@'localhost'
REQUIRE NONE
WITH MAX_QUERIES_PER_HOUR 0
MAX_CONNECTIONS_PER_HOUR 0
MAX_UPDATES_PER_HOUR 0
MAX_USER_CONNECTIONS 0;
CREATE DATABASE IF NOT EXISTS `zf_eue`;
GRANT ALL PRIVILEGES ON `zf\_eue`.* TO 'zf_eue'@'localhost';
```

You now have a database.  There are no tables in it, but they will be created automatically
when the zf_server runs for the first time.

