#Zebrafish Facility Manager Development

If you are developing, I don't need to hold your hand.  Pretty much everything goes as per
the normal deployment environment.  However, there are a few things to be aware of.

## Running in Development mode on localhost

### Running the client

You are going to be running the client with ng serve which will mean it 
is running at http://localhost:some_port and every time you save the code,
Angular rebuilds and runs it for you.

#### Where to put the client's *facility config file*

In production the client gets its facility configuration from a file in
/your_deployment_root/zf-client/facility-config/facility_sub_domain.json

This works really well because supporting a new facility does not require
a new instance of the zf-client, nor worse, a recompile.

However, in development the client is not running in a proper subdomain, but is running at
http://localhost:some_port_number.  Which means the convention for naming the
client's facility config file will not work because the client's domain name has a colon in it.

So if running in development, the code automatically looks for a facility config
file here: /localhost:some_port/zf-client/facility-config/development.json

So if you need to make changes to the client's facility configuration during development,
that's the place to do it.

### Running the server

During development there are a couple of things to be aware of.

In production, the client expects the server to be at
facility_sub_domain/zf-server.
In development however, that would mean the server has up to run at localhost:some_port/zf-server.
I do not know how to do this.

So during development, the client instead assumes the server will be running at localhost:3005, which
means you have to run the development server on port 3005.

This is how you do it:
```shell
cd zf-server
export FACILITY=some_facility_name
# make sure there is a config file in environments/some_facility_name.env
# make sure the PORT configuration variable is 3005 in some_facility_name.env
# the rest of the configuration file does need to be set up properly.
# run the server in watch mode so that it restarts when you change code
npm run start:dev
```

Note that during development there are some corners being cut!

1. You do not need an Apache server to be set up, the client talks directly to the server.
1. We have to use http rather than https, so take a little care to validate the server is
doing the right thing in production.

## Running in Production Mode locally

While the tools are great, sometimes the move from development mode to production
mode reveals some problems in the system.  So you want to run in production mode locally.

This is not exactly the same as running in full production mode because 
1. your web server (Apache) may not have a certificate
1. your routes will not have subdomains
1. your server will not be running as a service

### Client

```shell
cd zf-client
npm install
# build the app in production mode. This updates the dist directory.
ng build --prod
# copy the contents to wherever your apache server serves the client
```

### Hosts file

You want to find your local hosts file and create an alias like zf_prod_test for 127.0.0.1

### Apache config

Unless you have SSL locally, your apache config file needs to be for http, not https.
The ServerName field would be zf_prod_test. You can use any port for the rewrite rules
so long as it matches the port the server is running on.

### Server config file

The server config file should have 
```
FACILITY_URL=zf_prod_test
```

And the PORT should match
the port used in the rewrite rules in the apache config file.

The file could be called zf_prod_test.env. You would run the server with:
```
export FACILITY=zf_prod_test
#from the root of the repo
cd zf-server
npm run start:prod
```

Now you can finally run the client by going to 
```
http:zf_prod_test
```



