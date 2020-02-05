# Zebrafish Facility Manager zf-server
## Description

This is the server side of the Zebrafish Facility Manager.  It is written in
typescript and runs in Node.js

## Deployments

Every deployment of the system as a whole needs only one build of the zf-server. 
Each zebrafish facility requires a dedicated database an a dedicated instance of the 
zf-server along with a facility specific configuration file.

### Build the server code

You already cloned the repository into a directory.  Now:
```bash
# navigate to the zf-server sub-directory
cd path/to/zebrafish-facility-manager/zf-server

# Download npm packages
npm install

# Build the zf_server
npm run build
```

## Facility Configuration

There is a separate facility setup required to customize the system for each
zebrafish facility.  This section takes you through the required steps.

Choose a short or abbreviated name for your facility. As an example you might choose "ubc" for 
"The University of British Columbia". 

### Set up a database for the facility

The process of setting up a database for your a facility is covered [here](MariaDB.md).
Make a note of the database, database user and password for the facility.  For the purpose
of illustration, we will assume these are zf_ubc, zf_ubc, and zf_ubc_really_good_password.

### Set up Auth0 stuff

--tbd--
For the purpose of illustration, we will assume these are blah blah blah.

### zf_server configuration file

You need to create a server configuration file for each facility
```bash 
# copy the sample configuration file
cp environments/sample.env environments/ubc.example
```

Edit your configuration file. It should be simple as the file contains
detailed instructions.

You can change the configuration file any time you want, but you will have
to restart the zf_server for those changes to take place.

### Test the server facility (optional)

The automated testing process actually uses the database and it assumes a facility
called "test".
Please follow all the steps above and create a facility called test.

```bash 
npm run test
```

### Run the server

This will change when we start to use passenger.

If the database is empty, this will create all the tables.
```bash 
npm run start:prod
```

## Stay in touch

- Author - 

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Credit

- [Nest](https://github.com/nestjs/nest) provides the application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
