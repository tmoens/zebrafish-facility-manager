#Zebrafish Facility Manager Development

If you are developing, I don't need to hold your hand.  Pretty much everything goes as per
the normal deployment environment.  However, there are a few things to be aware of.

## Running in Development mode on localhost

### Running the client

You are going to be running the client with ng serve which will mean it 
is running at http://localhost:some_port and every time you save the code,
Angular rebuilds and runs it for you.

#### Where to put the client's *facility config file*

In production the client gets it's facility configuration from a file in
/your_deployment_root/zf-client/facility-config/facility_sub_domain.json

This works really well because supporting a new facility does not require
a new instance of the zf-client, nor worse, a recompile.

But in development the client not running in a proper subdomain, but is running at
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
1. your web server (Apache) many not have a certificate
1. your routes will all be on localhost rather than on proper subdomains

### Client

```shell
cd zf-client
npm install
# build the app in production mode. This updates the dist directory.
ng build --prod
# copy the contents to wherever your apache server serves the client
# edit any of the 

```




