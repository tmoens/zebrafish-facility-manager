#Zebrafish Facility Manager  "Per Facility Configuration"

This document describes how to configure the system to manage a new facility.

It assumes you have already created a full deployment as described in the
[Deployment Guide](Deployment.md).

For the purpose of a running example we will assume that 
1. you have a domain set up called _examplezfm.com_
1. you are setting up a new facility for _Example University of Examples_
1. you will be using _eue_ as the abbreviation for the university

If you are setting up your first facility you can save a bunch of time by
doing several facilities at the same time.  

If you know in advance that you will be setting up facilities for
_eue.examplezfm.com_, _xxx.examplezfm.com_, and _yyy.examplezfm.com_, we
suggest you do them all at once and that you also set up 
_demo.examplezfm.com_ and _test.examplezfm.com_.

The rest of the guide will describe setting up a single facility, but at each
step you can do a bunch at the same time.

### Sub-domain setup

You need to create a sub-domain for this facility. 
In the example this would be called _eue.examplezfm.com_.
The main thing you need to do is create a DNS record that points from your
sub-domain to your host's IP address.
After you add the sub-domain it usually takes an hour or so for it to
propagate around the world.

If you do not know how to do this, it is probably a capability available at
the service you used to buy your domain.  Alternately your web hosting service
probably has a DNS you can use to set up your DNS record.

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
will assume you configured the port for eue.examplezfm.com to be 3004.

####Am I ready to move on?
At this point you must be able to ping your subdomain.
If that is working, you can now enter your subdomain in your browser.
In the example you would put http://eue.examplezfm.com in
your browsers URL.
If you get a message like "This site can't be reached",
then there is a problem with your Apache configuration.
If you get a blank screen your site has been reached, but it is not up yet.
You can move on.

### Set up SSL on your Web Server

To ensure secure connections, you need to get a certificate that will secure
your domain and all "per-facility" subdomains you are going to deploy.

The process differs for the first facility, when you are getting an SSL
certificate for the first time and for subsequent facilities when you are
extending the certificate to secure new facilities.

Reminder: for every facility you are going to support you need to have a working
sub-domain and a fully configured Virtual Host.

#### First facility(ies)

When you support your first facility(ies) you need to generate a certificate
that names your domain and the subdomain for each facility.

Before using the procedure that follows, please note that when 
you get to the part where the procedure says to use 
certbot to create your certificate, you can use multiple -d options,
one for your domain and one for each sub-domain. For example:

```bash
sudo certbot --apache -d test.example-zfc.com -d demo.example-zfc.com
```

When you run the above command, we suggest that you allow certbot to modify your
apache configuration to redirect all http traffic to https.
                                                       
Here it a procedure on
[how to secure Apache](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-debian-10).


#### Subsequent facilities

Your existing certificate needs to explicitly support the new sub-domain,
you need to add it to your certificate.

First, you want to know what domains your certificate already supports.
```bash
# get a list of certificates and the domains they support
sudo certbot certificates
```
Suppose that your certificate says your certificate supports

Domains: examplezfm.com, test.examplezfm.com, demo.examplezfm.com

You now need to "expand" the certificate to include the domain eue.examplezfm.com.
To do so, you need to issue a new certbot command that includes
all the existing supported domains!

```bash
certbot --expand -d examplezfm.com -d test.examplezfm.com -d demo.examplezfm.com -d eue.examplezfm.com
```
Certbot will guide you through the rest of the process of installing the certificate.
Again, we recommend that you allow it to redirect all http traffic to https.

#### All facilities (first or subsequent)

Certbot will have created and enabled an https site for you.
It will even have tried to edit the Virtual Host file you already created, but
the RewriteRules it added to the config file are insufficient.
Just edit your apache config file (eue.examplezfm.com.conf) to permanently
redirect all insecure (http://) traffic to your secure (https://).

The file will look like this:
```bash
<VirtualHost *:80>
    ServerName eue.examplezfm.com
    Redirect permanent / httpd:eue.examplezfm.com
</VirtualHost>
```

####Am I ready to move on?

Go to this site:

https://www.ssllabs.com/ssltest/

Enter your subdomain (in this case eue.examplezfm.com) in the Hostname,
hit the "Submit" button and you should get a reasonably good report!
It takes a couple of minutes to run.


## Host Setup

### Set up a database for the facility data

The process of setting up a database for your a facility is covered [here](MariaDB.md).
Once you have configured the db, in keeping with the running example, you will have:
1. database: _zf_eue_
1. db user: _zf_eue_
1. db password: _some_very_good_eue_password_

####Am I ready to move on?

On the command line,
```bash
mariadb -u zf_eue -p
password:
```

Enter your very good password at the prompt.  If login succeeds, you are good to go.

### zf_server configuration file

You need to create a server configuration file for each facility.
In keeping with the example, we will create a configuration file called eue.env
```bash 
# copy the sample configuration file
cp environments/sample.env environments/eue.env
```

Edit your configuration file. 
In addition to following the instructions in the file, you will need to have at hand
1. the port you set in the Virtual Host configuration file.
in this case 3004.
1. the database user, name and password you configured for this facility.
1. the gmail address the system will use to send notifications to users.

#### Am I ready to move on?

You can (temporarilly) run the server now from the command line.  
The server rejects bad or missing configuration with useful error messages.

```bash
# on the command line, navigate to the zf-server directory

# tell the server where to find the eue config file (eue.env)
export FACILITY=eue

# run the server
npm run start:dev
```

If the configuration is good, you will get a bunch of Info level logs about routes that
have been set up.  If not, you need to address the errors.

You now have to stop the server (^C) as we need to set it up as a service.

### Run the zf-server as a service

You want the zf-server to be persistent.
Should it fail, it should be restarted automatically.
Should the computer restart, the service should be restarted automatically.
So, running the server from the command line is inappropriate.

Instead, we suggest running it as a service using systemd.
Here is a suggested procedure:

First, example content for the service config file for _eue_.
Note that only the lines marked with *** differ between servers for each facility.
The other lines repeat in every service config file.
```
[Unit]
# *** The next line should be different for each facility
Description=EUE Zebrafish Server

# tell systemd to wait for mysql/mariadb before our service is started
After=network.target mysql.service

[Service]

# assuming the system is in /var/www/zebrafish-facility-manager
# this is where the executable lies
ExecStart=/usr/bin/node /var/www/zebrafish-facility-manager/zf-server/dist/main.js

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
WorkingDirectory=/var/www/zebrafish-facility-manager/zf-server

[Install]
WantedBy=multi-user.target
```

On the command line:
```
# create service configuration file in the directory /etc/systemd/system
# name the file something like zfm-eue.service (If all your services start with
# a shared prefix like zfm, they will be easier to find, edit and extend.)
sudo vi /etc/systemd/system/zfm-eue.service

# copy the file content from above (or from an existing zfm-xxx.service file),
# paste it in the editor and edit as appropriate. Save the file

# enable the service
sudo systemclt enable zfm-eue

# start the service
sudo systemctl start zfm-eue

# check that it is running properly
sudo journalctl zfm-eue

#### Am I ready to move on?

If, when you did your journalctl, the log messages ended with "Nest application successfully started"
your server is up and will stay that way indefinitely.

### zf_client configuration file

This file contains configuration the client needs to customize the interface for a particular facility.
The file must go in the directory zf-client/src/facility-config.
The file is named by the facility's subdomain followed by .json.
So for eue.examplezfm.com, the file would live in:
```
zf-client/src/facility-config/eue.examplezfm.com.json
```

This file automatically gets copied to the 'dist/zf-client' when you build the client an then
copied to your hosting service's directory when you deploy the client.

You do not need to rebuild and redeploy the client when you add a new client config file.  Just add
it in the directory as described above and copy it to the deployment directory
which might be /var/www/zf-client/facility-config

Detailed instructions for the file have not been written yet.  The only non obvious part
is creating the label layout.  The label layout is just an array of array of tags.
Each tag indicates what bit of information you can put on a tank label.  Each row of the array
gets printed out as a separate line on the label.  The items within the row are spread out
across the width of the label.

The set of supported tags are found here: zf-client/src/app/printing/tank-label/tank-label.ts

