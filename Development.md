#Zebrafish Facility Manager Development

If you are developing, I don;t need to hold your hand.  Pretty much everything goes as per
the normal deployment environment.  However there are a few changes.


In production the client gets it's facility configuration from a file in
/your_deployment_root/zf-client/facility-config/facility_sub_domain.json

This works really well because supporting a new facility does not require
a new instance of the zf-client, nor worse a recompile.

But in development (i.e. wen you use "ng serve") the client is running at
http://localhost:some_port_number.  Which means the convention for naming the
client's config file will not work because the client's domain name has a colon in it.

So if running in development, I just decided to have the client look in a file called 
/localhost:some_port/zf-client/facility-config/development.json

So if you need to make changes to the client configuration during development,
that's the place to do it.

Likewise, in production, the client expects the server to be at
facility_sub_domain/zf-server
Once again, you cannot set the server up to run at localhost:some_port/zf-server.
Or at least, I can't.

So the client instead assumes the server will be running at localhost:3001, which
means you have to run the development server on that port, which means 
that to get the server running correctly, you set the FACILITY environment variable to "development"
and the server's config file is then found at environments/development.env 

