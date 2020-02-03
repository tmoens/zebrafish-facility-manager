#Zebrafish Facility Manager

## Description

A software package for maintaining information about a zebrafish facility
used in genetics labs.

It has two parts.  The zf_client part runs in any web browser and
presents a user interface for managing the the stocks in a facility.
For the technically inclined, the client uses Angular.

The zf_server part runs on a computer with a database and is responsible
for storing the data for a particular facility. In case you care, it is a Node.js process.

## Main Features

The main purpose of the software is to track zebrafish stocks including
- their lineage
- their genetic markers (mutations and transgenes)
- the lineage of their markers
- which tank(s) the stock occupies
- various notes and data associated with the stock (age, researchers, research notes...)
- simple and seamless creation of new stocks from crosses
- it provides excellent search, navigation and editing capabilities to allow users to focus
on thier work.

An ancillary aspect of the system is that it tracks the genetic markers used in a facility
so that absolute consistency is maintained throughout the system.

It also provides reports to support things like auditing a zebrafish facility.

## Deployments

A single deployment of the system can be used to manage several zebrafish facilities.

You need to set up your web server and some external systems as will be covered in this
README.  When that is complete, you can proceed to build, deploy and configure the
[zf-server](zf-server/README.md) and the [zf-client](zf-client/README.md).
But that comes later.

## Pre-Deployment Host Setup

In order to create a facility manager facility, a number of pre-requisites must be met.
There are many server environments you *can* use to deploy the system and the process
can get complicated - especially if you consider long-term maintenance and upgrades.
However, help is provided for setting up a Debian Unix system for deploying
the Zebrafish Facility Manager.

On Debian, make sure everything is up to date:
```bash
> sudo apt-get update
> sudo apt-get upgrade
```

### MariaDB

Please refer to MariaDB resources to determine how to install MariaDB in your server
environment.  Other databases are supportable in theory by simply configuring TypeORM, but
this has not been tried.

Here is a friendly article for [how to install MariaDB securely on 
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10).

You will need to set up a separate database for each facility the sytem manages.
The process of setting up a database for a facility is covered [here](MariaDB.md).

### Web Server

The system uses a web server to:
1. serve the zf-client to the end user
1. serve zebrafish facility specific files to the zf-client
1. handle HTTP traffic between the zf_clients and the zf_servers

We outline how to set up Nginx and configure it for each managed facility.
Apache can be equally well used if you are so inclined.

Please refer to your selected web server documentation for installation
instructions in your server environment.

Here is friendly article on [how to install Nginx on
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-10)

Please note that your Debian installation may already have Apache installed
and you may want to migrate that installation to Nginx, or leave it as Apache
and configure Zebrafish Stock Manager through Apache instead of Nginx - it isn't hard
if you know what you are doing. 

```
# incase you want to stop using apache2...
# stop apache
sudo systemctl stop apache2
# don't let it restart on reboot
sudo systemctl disable apache2
```

When you are satisfied that your web server is up and running you need to create
a directory which will hold one configuration file per zebrafish facility. 
While you *can* put this wherever you like, it may become tiresome as you go
through this manual process to have to remember that you did and to
adjust commands accordingly. So, for now, we recommend that you create it in
`/path/to/webserver/root/zfm/config`

TODO make this a script.

### Passenger

We have chosen to use [Passenger](https://www.phusionpassenger.com/library/)
to simplify the management of the system.

At time of writing, you *can* install Passenger on Debian 10 (buster), but the on-line
installation guides only go as far as Debian 9 (stretch). Not to worry, just change
the word "stretch" to the word "buster" in the install guide for Passenger and all
is well.

## Auth0 Configuration

We have outsourced user management, authentication and authorization to Auth0.  This is by
far more secure than a "roll your own" version.


### zf_server set up

Next step is to set up the [zf-server](zf-server/README.md).

### zf_client set up

Next step is to set up the [zf-client](zf-client/README.md).

Per Facility Configuration


## Stay in touch

- Author - 

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
