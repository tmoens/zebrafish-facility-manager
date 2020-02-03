# Zebrafish Facility Manager zf-server
## Description

This is the server side of the Zebrafish Facility Manager.  It is written in
typescript and runs in Node.js

## Deployments

Every deployment of the system as a whole needs one build of the zf-server. 
Each zebrafish facility requires a dedicated database an a dedicated instance of the 
zf-server along with a facility specific configuration file.

## Pre-Deployment setup of server environment

In order to create a facility manager system, a number of pre-requisites must be met.
There are many server environments you *can* use to deploy the system and the process
can get complicated - especially if you consider long-term maintenance and upgrades.
However, I do provide some help for setting up a Debian Unix system for facility.

On Debian, make sure everything is up to date:
```bash
> sudo apt-get update
> sudo apt-get upgrade
```

### MariaDB

Please refer to MariaDB resources to determine how to install in your server
environment.  Other databases are supportable in theory, but have not been tested.

Here is an great article for [how to install it securely on 
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10).

### Web Server

The system uses a web server to serve the zf_client to the end user
and also to
handle HTTP traffic between the zf_clients and the zf_server.

This has been successfully tested with both Apache and Nginx as the web server.
However, we will only provide configuration guidance for configuring Nginx.

Please refer to your selected web server documentation for installation
instructions in your server environment.

Here is an article on [how to install it on
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-10)

I will note here that your Debian installation may already have Apache installed
and you may want to migrate that installation to Nginx, or leave it as Apache
and configure Zebrafish Stock Manager through Apache instead of Ngnix - it isn't hard
if you know what you are doing. 

```bash
# incase you want to stop using apache2...
# stop apache
sudo systemctl stop apache2
# don't let it restart on reboot
sudo systemctl diable apache2
```

### Passenger

We have chosen to use [Passenger](https://www.phusionpassenger.com/library/)
to simplify the management of the system.

At time of writing, you *can* install Passenger on Debian 10 (buster), but the on-site
installation guides only go as far as Debian 9 (stretch). Not to worry, just change
the word "stretch" to the word "buster" in the install guide for Passenger and all
is well.

### Download & build the server code

**TODO** git clone part is TDB until I get it on GitHub.


```bash
# Download npm packages for the zf_server build process
> npm install
# Build the zf_server
> npm run build
```

## Deployment

There is a separate facility setup required to customize the system for each
zebrafish facility.  This section takes you through the required steps.

### Set up a database for the facility

The process of setting up a database for your a facility is covered [here](MariaDB.md).

### zf_server Deployment

You will need to set up two environment variables.  Choose a DEPLOYMENT name that is short
and reflects which facility you are deploying a system for.
```bash 
export NODE_ENV=production
export DEPLOYMENT=your_short_deployment_name
```

The next thing you need to do is create a zf_server configuration file for your
facility. Copy the sample.env file and call the copy 
production.your_short_deployment_name.env (obviously using the name you chose)

Edit your configuration file. It should be simple as the file contains
detailed instructions.  Don't worry about configuring TANK_LABEL_LAYOUT, you
can tune that later when it is time to tune the system.

You can change the configuration file any time you want, but you will have
to restart the zf_server for those changes to take place.

### Test the server facility (optional)

The testing process actually uses the database, so the facility configuration
must be set up correctly for it to run.

If the database is empty, this will create all the tables.
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
