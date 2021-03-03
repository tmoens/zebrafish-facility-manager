# Per Facility Configuration

Setting up a facility really means two things:

1. configuring and starting a facility specific server
1. adding a configuration file for the client

This document describes how to configure the system to manage a new facility.
We suggest that you create a "staging" facility that is used to validate
the most recent version of the system before you deploy any "live" facilities.

It assumes you have already created a full deployment as described in the
[Initial Deployment Guide](InitialDeployment.md).

If you are setting up your first facility you can save time by
doing several facilities at the same time.
At least, you probably want to set up a "staging" facility and a live facility.

For the purpose of a running example we will assume that your live facility

1. you have a domain set up called _examplezfm.com_
1. you are setting up a "staging" facility that uses the "staging" build
1. you are setting up a facility for _Example University of Examples_ that uses the "live" build

If you know in advance that you will be setting up facilities for more facilities
we suggest do them all at once.

### Sub-domain setup

You need to create a sub-domain for your facilities. 
In the example they could be called _staging.examplezfm.com_ and _eue.examplezfm.com_.
The main thing you need to do is create DNS records that points from your
sub-domain to your host's IP address.
After you add the sub-domain it usually takes an hour or so for it to
propagate around the world.

If you do not know how to do this, it is probably a capability available at
the service you used to buy your domain.  Alternately your web hosting service
probably has a DNS you can use to set up your DNS records.

#### Am I ready to move on?

If you can successfully ping
your new subdomain _eue.examplezfm.com_, you are ready.
If the ping fails, it may simply be that the new DNS record you
configured has not yet propagated.

In the meantime, you can go ahead and configure a Virtual Host on your web server,
but you cannot do your SSL configuration until your DNS configuration is working.

### Virtual Host setup

For each facility supported by your deployment you need to set up a
Virtual Host. This is how we suggest you do the [Apache Virtual
Host Configuration](Apache.md).

For the purpose of the running example in this guide,
will assume you configured the port for _eue.examplezfm.com_ to be 3004 and
_staging.examplezfm.com_ to be 3199.

## Host Setup

### Set up a database for the facility data

The process of setting up a database for your a facility is covered [here](MariaDB.md).
Once you have configured the db, in keeping with the running example, you will have:
1. database: _zf_eue_
1. db user: _zf_eue_
1. db password: _some_very_good_eue_password_

Remember to add the new database to your backup process.

Repeat the process to create a database for the staging system.

####Am I ready to move on?

On the command line,
```bash
mariadb -u zf_eue -p
password:
```

Enter your very good password at the prompt.  If login succeeds, you are good to go.

### zf_server configuration file

You need to create a configuration file for each facility.
In keeping with the example, we will create a configuration file called eue.env and another called staging.eue
```bash 
# copy the sample configuration file
cp environments/sample.env environments/eue.env
cp environments/sample.env environments/staging.env
```

Edit your configuration files
In addition to following the instructions in the file, you will need to have at hand

1. the port you set in the Virtual Host configuration file.
in this case 3004 for eue and 3199 for staging.
1. the database user, name and password you configured for this facility.
1. the gmail address the system will use to send notifications to users.
1. the site that hosts the user documentation

#### Am I ready to move on?

You can (temporarily) run a facility specific server now from the command line.  
The server rejects bad or missing configuration with useful error messages.

```bash
# on the command line, navigate to the *LIVE* zf-server directory
cd /var/www/zfm/live/zebrafish-facility-manager/zf-server

# tell the server where to find the eue config file (eue.env)
export FACILITY=eue

# run the server
npm run start:dev
```

If the configuration is good, you will get a bunch of Info level logs about routes that
have been set up.  If not, you need to address the errors.

You now have to stop the server (^C) as we need to set it up as a service.

To check the staging facility:
```bash
# on the command line, navigate to the *STAGING* zf-server directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-server

# tell the server where to find the eue config file (eue.env)
export FACILITY=eue

# run the server
npm run start:dev
```

Remember to stop it with ^C once you are satisfied that it is running properly.

### Run the zf-server as a service

You want the zf-server to be persistent.
Should it fail, it should be restarted automatically.
Should the computer restart, the service should be restarted automatically.
So, running the server from the command line is inappropriate.

Instead, we suggest running it as a service using systemd.
Here is a suggested procedure:

The following is an example of a systemd service configuration file.

Note that only the lines marked with *** differ between the servers for each facility.
The other lines repeat in every service config file.
```shell
[Unit]
# *** The next line should be different for each facility
Description=EUE Zebrafish Server

# tell systemd to wait for mysql/mariadb before our service is started
After=network.target mysql.service

[Service]

# assuming the system is in /var/www/zebrafish-facility-manager
# this is where the executable lies
ExecStart=/usr/bin/node /var/www/zfm/live/zebrafish-facility-manager/zf-server/dist/main.js
# *** For facilities using the staging server
# ExecStart=/usr/bin/node /var/www/zfm/staging/zebrafish-facility-manager/zf-server/dist/main.js

Restart=always

# choose an appropriate user and group to run the services.
User=some_appropriate_user
Group=some_appropriate_group

Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production

# tell the service where to find it's configuration file.
# *** The next line will be different for each facility.
Environment=FACILITY=eue

# Note the absence of dist at the end of this path.
WorkingDirectory=/var/www/zfm/live/zebrafish-facility-manager/zf-server
# *** For facilities using the staging server
WorkingDirectory=/var/www/zfm/staging/zebrafish-facility-manager/zf-server

[Install]
WantedBy=multi-user.target
```

On the command line:
```shell
# create service configuration file in the directory /etc/systemd/system
# name the file something like zfm-eue.service (If all your services start with
# a shared prefix like zfm, they will be easier to find, edit and extend.)
# Use whatever editor you want - the example uses vi because I am old.
sudo vi /etc/systemd/system/zfm-eue.service

# copy the file content from above (or from an existing zfm-xxx.service file),
# paste it in the editor and edit as appropriate. Save the file

# enable the service
sudo systemctl enable zfm-eue

# start the service
sudo systemctl start zfm-eue

# check that it is running properly
sudo journalctl -u zfm-eue
```

Repeat for zfm-staging service config file.

#### Am I ready to move on?

If, when you did your journalctl, the log messages ended with "Nest application successfully started"
your server is up and will stay that way indefinitely.

