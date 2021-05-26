# Zebrafish Facility Manager Development

This document is imprecise. 
It needs work to become both simple and workable for a brand new user.

It's a prerequisite of this document that you read the production deployment documentation.
Pretty much everything goes as per the normal deployment environment.  
However, there are a few things to be aware of.

## Running in Development mode on localhost

In this mode there is no Apache server.
The client is running on port 4200 on the local host and the server runs on port 3005.
The client communicates directly with the server rather than through an Apache vhost.


### Running the client

```
# from the root directory of the repo
cd zf-client
ng serve
```

The client will be running at http://localhost:4200 and every time you save the code, Angular rebuilds and runs
it for you and it will reload on your browser.

### Running the server

In production, the client expects the server to be at facility_sub_domain/zf-server.
In development however, the client instead assumes the server will be running
at localhost:3005, which means you have to run the development server on port 3005.

This is how you do it:

```shell
cd zf-server
export FACILITY=some_facility_name
# make sure there is a config file in environments/some_facility_name.env
# make sure the PORT configuration variable is 3005 in some_facility_name.env
# run the server in watch mode so that it restarts when you change code
npm run start:dev
```

You can equally well run the server from within your IDE, even in debug mode.
This is fine and normal, just make sure that the configuration for running it
includes setting the FACILITY environment variable to match a configuration file
in the server's environment directory.

Note that during development there are some corners being cut!

1. You do not need an Apache vhost to be set up to redirect client traffic to the server.
   The client talks directly to the server on port 3005.
1. We use http rather than https, between the client and server so take a 
   little care to validate the server is doing the right thing in production.

### Running the Documentation

Go to the zf-docs directory.  
You can build and deploy the documentation as per production, but you can also use:

```
mkdocs serve
```

Which will constantly rebuild your documentation and run it at localhost:8000.

## Running in Production Mode locally

While the tools are great, sometimes the move from development mode to production mode reveals some problems in the
system. So you want to run in production mode locally.

This is not exactly the same as running in full production mode because

1. your web server (Apache) may not have a certificate
1. your server will not be running as a service

Here is what you need to do:

### Domain Name Service

You may not have a Domain Name Server running in your local environment,
but you need host names for any facilities you want to run.
There are several ways to do this, but I found that my local router could be configured to make a map
from an arbitrary name to a static IP address.
So, I make sure that any computer that is going to run servers is granted a reserved
IP address by DHCP, then I can make as many maps to that address as I want by configuring the router.

So you could set up a computer to have a static IP address of 192.168.1.123.
Then you could use your router to map names to that IP address e.g.
facility1.local_zfm.com -> 192.168.1.123
facility2.local_zfm.com -> 192.168.1.123
facility3.local_zfm.com -> 192.168.1.123

### Client

```shell
cd zf-client
npm install
# build the app in production mode. This updates the dist directory.
ng build --prod
# copy the contents to wherever your apache server serves the client
```

### Apache config

Unless you have SSL locally, your apache config file needs to be for http, not https.
The ServerName field would be whichever name you set up in your local domain name configuration. 
For example facility1.local_zfm.com.
You can use any port for the rewrite rules so long as it matches the port the server is running on.

### Server config file

The server config file should have

```
FACILITY_URL=facility1.local_zfm.com
```

And the PORT should match the port used in the rewrite rules in the apache config file.

The file could be called facility1.env. You would run the server with:

```
export FACILITY=facility1
#from the root of the repo
cd zf-server
npm run start:prod
```

Now you can finally run the client by going to

```
http:facility1.local_zfm.com
```



