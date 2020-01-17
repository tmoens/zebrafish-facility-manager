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
A deployment consists of a database, one running instance of the zf_server using a
facility specific configuration file, the zf-client served by an web-server and
a facility specific configuration for the zf-client.

## Pre-Deployment Setup

In order to create a facility manager deployment, a number of pre-requisites must be met.
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

Please refer to MariaDB resources to determine how to install in your server
environment.  Other databases are supportable in theory, but have not been tested.

Here is an great article for [how to install it securely on 
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10).

### Web Server

The system uses a web server to serve the zf_client to the end user and also to
handle HTTP traffic between the zf_clients and the zf_servers.

We outline how to set up Nginx and configure it for each managed facility.
Apache can be equally well used if you are so inclined.

Please refer to your selected web server documentation for installation
instructions in your server environment.

Here is an article on [how to install Nginx on
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-10)

Please note that your Debian installation may already have Apache installed
and you may want to migrate that installation to Nginx, or leave it as Apache
and configure Zebrafish Stock Manager through Apache instead of Nginx - it isn't hard
if you know what you are doing. 

```bash
# incase you want to stop using apache2...
# stop apache
sudo systemctl stop apache2
# don't let it restart on reboot
sudo systemctl disable apache2
```

### Passenger

We have chosen to use [Passenger](https://www.phusionpassenger.com/library/)
to simplify the management of the system.

At time of writing, you *can* install Passenger on Debian 10 (buster), but the on-site
installation guides only go as far as Debian 9 (stretch). Not to worry, just change
the word "stretch" to the word "buster" in the install guide for Passenger and all
is well.

### Build and deploy the zf_server
**TBD**

### Build and deploy the zf_client
**TBD**

## Manage a facility

There is a separate setup required to customize the system for each
zebrafish facility.  This section takes you through the required steps.

### Set up a database for the facility

The process of setting up a database for a facility is covered [here](MariaDB.md).

### zf_server configuration
**TBD**

### zf_client configuration
**TBD**

## Stay in touch

- Author - 

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
