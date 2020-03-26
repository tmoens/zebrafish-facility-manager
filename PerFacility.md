#Zebrafish Facility Manager  "Per Facility Configuration"

This document describes how to configure the system to manage a new facility.

It assumes you have already created a full deployment as described in the
[Deployment Guide](Deployment.md).

For the purpose of a running example we will assume that 
1. you have a domain set up called _example_zfm.com_
1. you are setting up a new facility for _Example University of Examples_
1. you will be using _eue_ as the abbreviation for the university

## Sub-domain setup

You need to add a sub-domain for ths facility. 
In the example this would be called _eue.example_zfm.com_.
It points to your host's IP address.
After you add the sub-domain it usually takes an hour or so for it to
propagate around the world.

If you do not know how to do this, it is probably a capability available at
the service you used to buy your domain.

### SSL

Your certificate needs to explicitly support the new sub-domain, you need to add it to your certificate.

TODO tell me how.
## Host Setup

### Set up a database for the facility data

The process of setting up a database for your a facility is covered [here](MariaDB.md).
Once you have configured the db, in keeping with the running example, you will have:
1. database: _zf_eue_
1. db user: _zf_eue_
1. db password: _some_very_good_eue_password_

### Web Server

You need to set up a virtual host for every facility you want to manage.

### zf_server configuration file

You need to create a server configuration file for each facility.
In keeping with the example, we will create a configuration file called eue.env
```bash 
# copy the sample configuration file
cp environments/sample.env environments/eue.env
```

Edit your configuration file. 
It should be simple as the file contains detailed instructions.  
In the file, there is a PORT entry. You need to choose one that is not otherwise in use.
For the moment we will assume you have chosen port 3004.
You will need to remember this port number later when you tell your web server
how to send traffic to the zf_server for _eue_.

### running the server

### passport comes in here.

You can change the configuration file any time you want, but you will have
to restart the zf_server for those changes to take place.

Until then, run it manually 
export FACILITY=eue
npm run start:prod


