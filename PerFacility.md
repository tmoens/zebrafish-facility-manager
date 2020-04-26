#Zebrafish Facility Manager  "Per Facility Configuration"

This document describes how to configure the system to manage a new facility.

It assumes you have already created a full deployment as described in the
[Deployment Guide](Deployment.md).

For the purpose of a running example we will assume that 
1. you have a domain set up called _example_zfm.com_
1. you are setting up a new facility for _Example University of Examples_
1. you will be using _eue_ as the abbreviation for the university

## Sub-domain setup

You need to create a sub-domain for ths facility. 
In the example this would be called _eue.example_zfm.com_.
The main thing you need to do is create a DNS record that points from your
sub-domain to your host's IP address.
After you add the sub-domain it usually takes an hour or so for it to
propagate around the world.

If you do not know how to do this, it is probably a capability available at
the service you used to buy your domain.  Alternately your web hosting service
probably has a DNS you can use to set up your DNS record.

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

### zf_client configuration file

This file contains configuration the client needs to customize the interface for a particular facility.
The file must go in the directory zf-client/src/facility-config.
The file is named by the facility's subdomain followed by .json.
So for eue.examplezfm.com, the file would live in:
```
zf-client/src/facility-config/eue.examplezfm.com.json
```

This file automatically gets copied to the 'dist/zf-client' when you build the client ann then
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

### Web Server

You need to set up a virtual host for every facility you want to manage. 
Here is a [Guide](Apache.md);

### running the server

### passport comes in here.

You can change the configuration file any time you want, but you will have
to restart the zf_server for those changes to take place.

Until then, run it manually 
export FACILITY=eue
npm run start:prod


