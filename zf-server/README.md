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
