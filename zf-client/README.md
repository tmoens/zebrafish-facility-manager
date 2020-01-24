# ZfClient

This is the client side of the Zebrafish Stock Manager project.  In order to make use of this,
You should first install the server side.

## Authorization

For better or for worse, we chose to outsource authentication for this app to Auth0.
Therefore, before running the app, you also need to set up a service for handling Authentication
Even during development because I have not stubbed it out.
Details to follow, but ya gotta do it.

## Deployment

Every deployment of the system needs it's own build and each build required its own
configuration file. One deployment is capable of serving multiple facilities.

### Deployment Configuration

The main configuration variable tells the client where to look for further configuration
specific to the various facilities supported by the deployment. 

The configuration file for the deployment is a copy of src/environments/environment.ts or 
one of the other configurations. 

In this file you will specify the place the client goes to look for "per facility" configuration.

`configServerPrefix: "http://yourhost/zf-facility-manager/facility-config`

Then, you would need to create such a directory on your web server and later you will populate it with
per-facility client configuration files.

### Build & Deploy

`ng build --prod`

The resulting build will be in zf-client/dist/zf-client
Please note that by default, the zf-client is built with a base-href of /zfm/zf-client
and should therefore be deployed in

`/path/to/your/webserver/root/directory/zf-facility-manager/zfclient`

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
