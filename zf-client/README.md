# Zebrafish Facility Manager zf-client

This is the client side of the Zebrafish Stock Manager project.

It is a "single-page web app" written in Angular.

You should build and test the zf-server before building and deploying the zf-client.

## Deployment

Every deployment of the system as a whole needs only one build of the zf-client.
One deployment is capable of managing several zebrafish facilities each governed by
a facility-specific configuration file.

### Apache Web Server Configuration

Was described in the overall installation ToDo add a link.

### zf-client Deployment Configuration

The main configuration variable tells the client where to look for further configuration
specific to each facility supported by the deployment. 

The configuration file for the deployment is a copy of src/environments/example.environment.prod.ts
Rename it to src/environments/environment.prod.ts and edit it. Follow the directions in the file.
You need to know the domain name you configured earlier.

If you are planning to run the client for debugging (i.e. running ng serve), you will also need
to create and edit environments/environment.ts.

### Build & Deploy

`ng build --prod`

The resulting build will be in zf-client/dist/zf-client
Please note that by default, the zf-client is built with a base-href of /zfm/zf-client
and should therefore be deployed in

`/path/to/your/webserver/root/directory/zfm/zf-client`

You can, of course, change this by building with --base-href, or by changing the build
in angular.json.  If you do, you will also need to make a corresponding change to the .htaccess
file and you will need to adjust the URLs in the facility's Auth0 Client Application 
configuration as described below.

## Per Facility Configuration

The client is customizable by configuration for each zebrafish facility.  For this to work,
the client goes to a configuration server and gets configuration data for the facility the user
wants to work with.  (There is a possibility that some users might work for two or more facilities.)

The config server is really just a directory with one json file per facility, as described above.

There are some examples one level up in the facility config directory.
TODO put documentation in that directory and a link to that documentation here.

## Per Facility Configuration on Auth0

The Zebrafish Facility Manager outsources user management, authorization and authentication to Auth0.

If you do not have an Auth0 account, you will have to create one.
Because every facility has its own users and user management, we must create
one Auth0 Application per facility. 

TODO details on configuration of said application on Auth0.



## Acknowledgements

I used [Angular CLI](https://github.com/angular/angular-cli) to generate the project.
