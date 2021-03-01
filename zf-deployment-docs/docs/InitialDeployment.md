#Zebrafish Facility Manager - Initial Deployment

This guide is for the initial deployment of a system.
If you are *updating a running deployment*, please go [here](Update.md)

## Domain name

You will need a domain name for the deployment as a whole. 
For the purpose of illustration, this guide will assume you have 
purchased _examplezfm.com_ and that you set up DNS records to point
at your host's IP address.

It is a good idea to set up _staging.examplezfm.com_,
_test.examplezfm.com_, and _demo.examplezfm.com_ as an initial sub-domains.
Later when you are configuring a system for a particular facility, you will be
adding one sub-domain per facility.  If you happen to know that you are going set up
managers for facilities _eue_ and _acdc_, you could create those sub-domains too.
But you can always do that later.
The DNS entries should all point to the ip address of your host.

You can get a domain name and set up your DNS at any number of providers like
[namesilo.com](https://namesilo.com).

## Setting up the server computer environment
### Host setup
Experienced administrators can zip through this guide quickly, but it is
a mini site-admin guide for the benefit of less experienced people.
In truth, it's just a memory aide for me.

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
I noticed that the default node and npm on a fresh Debian 10 machine were a bit behind the times,
so I had to upgrade them.

### MariaDB

Please refer to MariaDB resources to determine how to install MariaDB in your server
environment.

Here is a friendly article for [how to install MariaDB securely on 
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-debian-10).
Later, when you go to create individual databases for each zebrafish facility, the guide will assume
you have followed the good, secure procedure described there.  You will have created an administrative
user called admin, which you will use to create  databases for each facility.
You must remember the password for that administrative user.

###Database Backup

There are many ways to do this.
I install automysqlbackup and by default it gives me exactly what I need.
Daily backups rotated every week, weekly backups rotated every 5 weeks and monthly backups
that are never rotated.

FWIW, the script lives in /etc/sbin/autmysqlbackup and the config file lives in
/etc/default/automysqlbackup (you need to edit the user credentials in there).

By default the backups go to /var/lib/automysqlbackup where the daily weekly and monthly
directories are nicely split up by database.

Of course you also want to do remote storage of the backups, but I leave that to you.

### Web Server

The system uses a web server to:

1. serve the zf-client to the end user
1. serve zebrafish facility-specific configuration to the zf-client
1. handle HTTPS traffic between each zf-client and the correct facility-specific zf-server

Apache2 is usually pre-installed on Linux servers, but just in case, here is friendly 
article on [how to install Apache on
Debian](https://www.digitalocean.com/community/tutorials/how-to-install-the-apache-web-server-on-debian-10)

Set up a virtual host for your domain (in this case examplezfm.com).
You can put anything you want in the root directory, it is a base
website you can use to welcome folks.
You might want to put the user documentation there or a demo system or whatever you like.

You will need to set up a separate virtual host for each zebrafish facility the system manages.
It is a good idea to set up an example one now.
The process of setting up a virtual host for a facility is covered [here](Apache.md).

## zf-server and zf-client deployment

There a many ways to do the following this is just how I do it.
It is done with an eye to making updates easier later on.

```shell
# For the initial deployment, create a working directory like /var/www/zfm
# You probably wont have write privilege so sudo
cd /var/www
sudo mkdir zfm

#change the permissions to you work here
sudo chown -your-username- zfm
sudo chgrp -your-usergroup- zfm
cd zfm

# create a directory with a date where you plan to clone and build the code.
mkdir 2021-02-27


# Create a new symbolic link from the build directory to the staging build area
ln -s 2021-02-27 staging

# For your initial deployment, your "staging" and "live" builds will be the same so
# you need a second symbolic link
ln -s 2021-02-27 live
```

Just for clarity, when we go to do an update to a new revision of the system,

1. we will clone the repo into a new directory,
1. point the "staging" link at the new directory
1. build in the staging directory and verify that the system is fine
1. move the "live" to point at the new directory

### Clone the Github repository

This is where you download all zf-client and zf-server code.
You would normally work in your staging directory until you are satisfied that everything is perfect.

```bash
# go to your staging directory
# For example:
cd /var/www/zfm/staging
git clone https://github.com/tmoens/zebrafish-facility-manager
```

### zf-server build

```bash
# navigate to the zf-server sub-directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-server

# Download npm packages
npm install

# Build the zf-server
npm run build
```

This generates a "dist" directory containing the main server executable main.js.

### zf-client build

```bash 
# navigate to the the zf-client sub-directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-client

# Download npm packages
npm install

# Build the zf-client
ng build --configuration=production
```

The result of this operation will be a directory called /dist/zf-client.
We suggest you make a copy of this directory for deployment.
That way you are able to tweak and rebuild the zf-client without affecting
the users.
```shell
# go to the "distribution" client directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-client/dist

# copy it to a well known place
sudo cp -R zf-client /var/www/staging
```

### User Documentation Build

The user documentation describes best practices for using the zebrafish facility management application.
It is written in MarkDown and built into a static HTML website using [MkDocs](https://mkdocs.org).
MkDocs is written in Python, so you will need to install Python3 (and pip) inorder to build the documentation.
The installation process is documented [here](https://mkdocs.org/#installation);

I also use the mkdocs-material theme, so you will have to install that too.
See [here](https://squidfunk.github.io/mkdocs-material/getting-started/#with-pip)

Once that's done, you build the documentation website:

```shell
# navigate to the root of the repository
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-usage-docs
mkdocs build
```

This generates (or overwrites) the /site sub-directory in zf-usage-docs.
The /site directory is straight HTML, so I won't go into detail on how to deploy
it.
In short you create a site in apache and point the root of that site 
at /var/www/zfm/live/zebrafish-facility-manager/zf-usage-docs.

Alternately you copy the "site" directory to some other place and
point you apache vhost at that directory.
If you take that approach, remember to do the copy every time you build the docs.

There is nothing facility specific in the documentation so all servers
can use the same doc site.

## GMAIL Sender

The application needs to send emails.
For example, when a user is created, they get an email with password reset instructions.

We did not invest a huge amount of time here, we simply send them via gmail which
means that you will need to provide a gmail address the server can use for sending
emails.

What is more, since the application sends the emails programmatically, the gmail account
it logs into is deemed insecure by Google, no matter how good the password is.

1. You need to create such a Google/gmail account - do not use your own.
1. You need to give it a very good password (again, use a password generator).
1. You need to configure the account to allow "insecure access".

In the "per facility" guide you will be entering the id and password for this account.


## Facility Configuration

You are finally ready to configure the system to manage a zebrafish facility.
Here is the [Facility Configuration Guide](PerFacility.md).

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf-server application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
