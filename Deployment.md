#Zebrafish Facility Manager

Each deployment has includes 

1. Setting up the computer environment including all the software required
by the zebrafish manager
1. Deploying the zf_server which is the part that maintains all of the data on a server.
1. Deploying the zf_client which is the part of the system that the the end-user runs in
their web browser

## Deployments Part 1 Setting up the deployment compute environment

## Host Setup

Experienced administrators can zip through this guide quickly, but it is
a mini site-admin guide for the benefit of less experienced people.  
And let's face it, it's just a memory aide for me.

**For this guide, we will deploy on a Debian 10(+) computer**.

The system can be deployed in other environments in which case, you will need to
understand how to perform equivalent operations in that environment.

On Debian, make sure everything is up to date:
```bash
sudo apt-get update
sudo apt-get upgrade
```
### Node and NPM

We need to use node and the node package manager.
```bash
sudo apt install nodejs npm
```
I noticed that the default node and npm a fresh Debian 10 machine were a bit behind the times
and I had to upgrade them.

### MariaDB

Please refer to MariaDB resources to determine how to install MariaDB in your server
environment.

Here is a friendly article for [how to install MariaDB securely on 
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10).
Later, when you go to create individual databases for each zebrafish facility, the guid will assume
you have followed this procedure.

The "good parts" version of that article is.

```bash
# install mariadb (if it isnt already installed)
sudo apt install mariadb-server

# make the installation more secure, run this and follow the prompts
sudo mysql_secure_installation

# Create an admin account
sudo mysql
...
...
...
MariaDB [(none)]> GRANT ALL ON *.* TO 'admin'@'localhost' IDENTIFIED BY 'password' WITH GRANT OPTION;
MariaDB [(none)]> exit
```

### Domain name

You will need a domain name for the deployment as a whole. 
For the purpose of illustration, this guide will assume you have 
purchased _example_zfm.com_ and that you set up DNS records to point at your host's IP address.

It is a good idea to set up _test.example_zfm.com_ as a an initial sub-domain.
Later when you are configuring a system for a particular facility, you will be
adding one sub-domain per facility.  If you happen to know that you are going set up
managers for facilities _eue_ and _acdc_, you could create those sub-domains too.
But you can always do that later.
The DNS entries should all point to the ip address of your host.

You can get a domain name and set up your DNS at any number of providers like
[Namecheap.com](https://namecheap.com).


### Web Server

The system uses a web server to:
1. serve the zf-client to the end user
1. serve zebrafish facility-specific configuration to the zf-client
1. handle HTTP traffic between the facility-specific zf_clients and the facility-specific zf_servers

Apache2 as it is usually pre-installed on Linux servers, but just in case, here is friendly 
article on [how to install Apache on
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-debian-10)

Set up a virtual host for your domain.
Later, you will need to set up a separate virtual host for each facility the system manages.
The process of setting up a virtual host for a facility is covered [here](Apache.md).

### Set up SSL on your Web Server

Before you start, you should have set up DNS for your domain (and any sub-domains you can think of
in advance) and your apache Web Server is running.

Here is a great article on how [how to secure Apache](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-debian-10).

When you get to the part where the tutorial says to use certbot to create your certificate,
you can use multiple -d options, one for your domain and one for each sub-domain.  Using the example
above, your command might look like

```bash 
sudo certbot --apache -d example_zfm.com -d test.example_zfc.com -d eue.example_zfc.com -d acdc.example_zfc.com
```

Later when you want to add another facility, you will create a sub-domain and add
it to your certificate.
This is covered in the "Per Facility" guide.

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

## Server and client deployment

### Clone the Github repository

This is where you download all zf-client and zf-server code.
Go to a directory on the server where you plan to download the code. Then:
```bash
git clone https://github.com/tmoens/zebrafish-facility-manager
```

### zf_server set up

```bash
# navigate to the zf-server sub-directory
cd path/to/zebrafish-facility-manager/zf-server

# Download npm packages
npm install

# Build the zf_server
npm run build
```

### zf_client set up

```bash 
# navigate to the the zf-client sub-directory
cd path/to/zebrafish-facility-manager/zf-server

# Download npm packages
npm install

# you need to install angular-cli
sudo npm install @angular/cli

# Build the zf_server
ng build --prod
```

The result of this operation will be a directory called /dist/zf-client.
You need to deploy the directory to your Web Server.  Assuming that the
root of your web server is _/var/www/_, just deploy the directory there.

## Wrap up

You are finally ready to configure the system to manage a zebrafish facility.
Here is the [Facility Configuration Guide](PerFacility.md). 

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
