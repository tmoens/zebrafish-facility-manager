# Updating the System

## Introduction

Assuming there is a new version of the system available on GitHub
and you want to update your deployment, what has to happen?

---
**Warning**

Do not upgrade over multiple releases that involve a database schema change.
This is because we use TypeORM's automated database synchronization that
brings the schema up to date automatically instead of doing 
explicit database migration with scripts.

While I have never had a problem with the automated synchronization there is always
the potential for that type of problem.
---

## Assumptions

1. You followed the guidelines in the "Initial Deployment Guide" when setting up the system
1. You followed the guidelines in the "Per Facility Guide" when setting up facilities

These directories will be in place:

1. your host system will have a directory like: /var/www/zfm/2021-02-27
1. There will also be a symbolic link like /var/www/zfm/staging pointing to that directory.
1. There will also be a symbolic link like /var/www/zfm/live pointing to that directory.

Every existing facility will have:

1. A sub-domain named in your Apache certificate
1. An enabled Apache vhost
1. A database
1. A service config file like /etc/systemd/system/zfm-staging.service so systemd can run it
1. A server configuration in .../live/zf-server/environments named something like eue.env or staging.env
1. A client configuration is .../live/zf-client/src/facility-config named (facility-subdomain).json, e.g.
staging.examplezfmdomain.com.json
   
If these things are not the case, then I'll assume you know what you are doing, and you have
just made different deployment choices.
In this case you will still have to do the same logical steps, but you will have to
figure out how to do those in your chosen environment.

## Deploy a new "staging" build

### Stop any facility servers that use the "staging" build

If you have followed the general approach we suggest, one (or more) of your facilities
will be for staging and test and will therefore use zf-server and zf-client from the
staging build.

Since you are now going to make a new "staging" build, you need to stop any such servers.


```shell
# if you cannot remember which are your staging facilities
grep staging /etc/systemd/system/*.service
# which should tell you which services are using executables from the staging directory

# assuming you find zfm-staging.service and zfm-test.service, then
sudo systemctl stop zfm-staging
sudo systemctl stop zfm-test
```
### Make a backup of the databases used by the staging facilities

This just is in case you need to back out because of problems with db migration.

I simply do this in my home directory.
Assuming the databases zfm_staging and zfm_test are in use:

```shell
cd ~
mkdir whatever_you_want
cd whatever_you_want
mysqldump -u admin -p zfm_staging > zfm_staging.sql
mysqldump -u admin -p zfm_test > zfm_test.sql
```

### Clone the Github repository

```shell
# go to the base directory
cd /var/www/zfm

# create a new directory for staging the new version
mkdir 2021-04-01

# this will become your new "staging" repo,
# remove the old link and add a new one
rm staging
ln -s 2021-04-01 staging

# go to your staging directory and clone the repo
cd staging
git clone https://github.com/tmoens/zebrafish-facility-manager
```

At this point in the proceeding, the staging server has been stopped and there is no staging
client so any user trying to access the client for any facility that uses the staging build
will not be working at all.

## Migrate Configuration Files

You have to copy client and server config files from the live system to the staging system.

If there have been changes to the format of the configuration files or an expansion
of the available configuration knobs and buttons, now is the time to edit
the configuration files. See the Per Facility guide for details on config files.

```shell
# from the root of the staging build, 
# copy the config files from live system to the staging system.
cd /var/www/staging/zebrafish-facility-manager
cp ../../live/zebrafish-facility-manager/zf-client/src/facility-config/*.json zf-client/src/facility-config
cp ../../live/zebrafish-facility-manager/zf-server/environments/*.env zf-server/environments
```

### zf-server build

```shell
# navigate to the zf-server sub-directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-server
npm install
npm run build
```

### zf-client build

Make sure you edit client configuration files *before* you build the client because the build process
deploys the configuration files.

```shell
# navigate to the the zf-client sub-directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-client
npm install
ng build --configuration=production
```

The result of this operation will be a directory called /dist/zf-client.
We suggest you make a copy of this directory for deployment.
```shell
# go to the "distribution" client directory
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-client/dist

# copy the zf-client to a well known place
sudo cp -R zf-client /var/www/zfm/staging
```

At this point in the proceeding there is a new client available.
Because we use the logical "staging" directory to configure the documentation
root for all the facilities that use the "staging" build, all those facilities
should now have a working client - but those clients have no servers to talk to.

### Restart any facility servers that use the "staging" build

Double check that you are happy with both the client and server config files for each facility that
uses the staging build.

You now need to restart the servers that rely on the staging build (i.e. the ones you stopped earlier)

---
**Warning**

When you restart the server, TypeORM automatically makes any database schema
changes to bring it in line with the current release of the system.

While I have not had a problem with this yet, TypeORM documentation suggests not using
it on live systems as they cannot guarantee perfection.
___
```shell
sudo systemctl start zfm-staging
sudo systemctl start zfm-test

# If you need to look at the logs for a server you can use
sudo journalctl -u zfm-staging
```

At this point the staging systems should all be up and running.  

### Sanity Test

It is a good idea to visit most of the pages of the staging system, particularly where
new functionality was introduced or areas that involved underlying database changes.
Just go to your browser and navigate to the appropriate sub-domain.
For example https://staging.example-zfm.com.

You can do as little or as much as you like, usually it depends on the scope of the changes
that have been introduced.

Once you are happy, it's time to update the "live" facilities.

## Update "live" facilities

This process can be quite quick and have very little impact on your customers.
Because all your "live" facilities will be working off the same zf-server executable,
you are going to migrate all the "live" facilities at once.

### Schedule a date and inform your customers

Make sure that they know there is going to be an update and tell them what kind of outage they can
expect.

The upgrade should only take a couple of minutes, especially if you write some scripts to help.

### Edit config files, if necessary

Even if the new release introduces a new configuration knob, you generally only need to change
configuration files for facilities that want to use something other than the default setting
for the knob.

With that said, you should do any required editing now.

---
**Note**

Because the client configuration files are copied to the deployment
directory system during the build,
you should rerun the client build and copy the resulting dist/zf-client
directory as described above if you change any client config files.
Alternately you can skip the build and just copy the config files
from the src directory to the dist
directory and then on to the deployment directory if you want.
---

### Server - Stop all running services you have.

You are about to change where the "live" build is, so you need to stop
all the services that are currently using the "live" build.

```shell
# if you cannot remember which are your live facilities
grep /var/www/zfm/live /etc/systemd/system/*.service
# which should tell you which services are using executables from the live directory

# assuming you have zfm-eue.service and zfm-another.services, then
sudo systemctl stop zfm-eue
sudo systemctl stop zfm-another
```
The clients will now have nothing to talk to, so they will appear broken.

### Make a backup of the databases used by the live facilities

You want to do this *after* you stop the servers,
so it might be a good idea to write a script to do it quickly.
I simply do it in my home directory.
Assuming the databases zfm_eue and zfm_another are in use.

```shell
cd ~
mkdir whatever_you_want
cd whatever_you_want
mysqldump -u admin -p zfm_eue > zfm_eue.sql
mysqldump -u admin -p zfm_another > zfm_another.sql
```

### Re-direct the live link to the new build

```shell
# go to the base directory
cd /var/www/zfm

# The new build is in 2021-04-01
# this will become your new "live" build, so remove the old link and add a new one
rm live
ln -s 2021-04-01 live
````

At this point both your live build and your staging build point to the same place which
makes sense because the point of doing the staging build was to make it live in the end.

### Restart your services

---
**Warning**

When you restart the server, TypeORM automatically makes any database schema
changes to bring it in line with the current release of the system.

While I have not had a problem with this yet, TypeORM documentation suggests not using
it on live systems as they cannot guarantee perfection.

So, it is important to have gone through the process with a staging server to make
sure this is all working well.  It is also suggested that you do not wait too
many releases between updates so that the automatic synchronization does not have
too much work to do.
___
```shell
sudo systemctl start zfm-eue
sudo systemctl start zfm-another

# If you need to look at the logs for a server you can use
sudo journalctl -u zfm-eue
```

At this point the live systems should all be up and running.

### Sanity Check

We suggest you log into every live facility
and do a quick sanity check that the new functionality is in place.


