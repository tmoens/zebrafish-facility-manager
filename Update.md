# Updating the System

Assuming you have written and tested some changes and pushed them
to github,
how do you go about updating a running system.

Caveat.  This is "by the seat of my pants" for now and full of risk.

Make sure your users know you are going to do this.
It may take a little while.

Take real pains to make sure your server will build properly before you do this,
because this does not cover undoing what you have done.

On your web host, go to the root directory of your repo.

Pull the version you want, update packages. For example.
```
git pull origin master
```

ToDo - have two builds, a staging build, and a live build. Because
doing it all in place is stupid.

## Build the Client

You can build the client and make it ready for deployment before you
work on the server.

Update npm packages and build:
```
# from the root of the repo 
cd zf-client
npm install
ng build --configuration=production
```

## Server

If you have no changes to your server, you don't have to do this.
If you *do* have changes to your server you might want to create
a temporary "under maintenance" client and deploy it before carrying on.

### Server - Update npm packages
```
# from the root of the repo 
cd zf-server
npm install
```

### Server - Stop all running services you have.

Assuming you have them all running as services as per the documentation.
Make sure you stop all of them or there will problems building the server.
Don't build the server until you have stopped the services.

```
sudo systemctl stop zfm-eue
sudo systemctl stop zfm-another
sudo systemctl stop zfm-thelastone
```

The clients will now have nothing to talk to, so they will appear broken.

### Server - Build the server
```
# in the zf-server directory
npm run build
```

## Deploy the Client

Deploy the new client. Assuming you are deploying to var/www/zf-client.
```
cd /var/www
sudo mv zf-client zf-client-todays-date-or-something
# copy the newly built zf-client from your 
# cd to your root of your repo
cd zf-client
sudo cp -r dist/zf-client /var/www
```

## Restart your services

```
sudo systemctl start zfm-eue
sudo systemctl start zfm-another
sudo systemctl start zfm-thelastone
```

Make sure your sites are running.

