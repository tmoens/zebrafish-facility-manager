## Apache setup

This guide assumes you have apache set up and running. It covers creation of a virtual host
for each facility you want to manage.

In this case we are going to create a virtual host for the Example University of Examples and
another for Staging (i.e. a test facility).

### Prerequisites: 
1. you have purchased the domain _example-zfm.com_
1. you have set up a sub-domain for the Example University of Examples called _eue.example-zfm.com_
1. you have chosen to run the zf-server for _eue_ on port 3004.
1. you have set up a sub-domain for the Staging called _staging.example-zfm.com_
1. you have chosen to run the zf-server for _staging_ on port 3199.
1. you have built the zf-client and installed it in the appropriate directory.
In the deployment doc we suggested /var/www/zfm/staging/zf-client and /var/www/zfm/live/zf-client
   
### Virtual Host Files

You are now ready to create your virtual host for eue.example-zfm.com and staging.example-zfm.com

---
**Note**

This is what the file looks like _before_ you do the SSL configuration.
That process will update this file.
---

1. go to your apache configuration directory. 
On Debian this is in /etc/apache2/sites-available.
1. create a new virtual host configuration file called eue.example-zfm.com.conf.
1. edit the file appropriately by copying the example below and adjusting it to how you have
deployed your client and configured your server.

```bash 
<VirtualHost *:80>
    ServerAdmin email_for_your_server_administrator@some_email_provider.whatever
    ServerName eue.example-zfm.com

    # Note *ALL Live* facilities share the same zf-client from the "live" build
    DocumentRoot /var/www/zfm/live/zf-client

    ErrorLog ${APACHE_LOG_DIR}/eue.error.log
    CustomLog ${APACHE_LOG_DIR}/eue.access.log combined

    # We need to use the RewriteEngine
    RewriteEngine On

    # If the incoming request is aimed at the server,
    # proxy to the port the facility-specific server is running on.
    # The port you choose has to be different for each facility.
    # The port you choose must be added to server configuration file to this facility.
    RewriteRule ^/zf-server/(.*) http://localhost:3004/$1 [P]

    # If there is an existing asset or directory in the request, then route to it.
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]

    # Otherwise links like /stock_manager (for which there is no static file)
    # are all written to /index.html where the angular app will handle the route.
    RewriteRule ^ /index.html
</VirtualHost>
```

For the staging server, the differences are ServerName, DocumentationRoot, Logs,
and the port used in the rewrite rule. The DocumentationRoot in this case points
at the staging build rather than the live build.
```bash 
<VirtualHost *:80>
    ServerAdmin email_for_your_server_administrator@some_email_provider.whatever
    ServerName staging.example-zfm.com

    # Note *ALL Staging* facilities share the same zf-client from the staging build
    DocumentRoot /var/www/zfm/staging/zf-client

    ErrorLog ${APACHE_LOG_DIR}/staging.error.log
    CustomLog ${APACHE_LOG_DIR}/staging.access.log combined

    # We need to use the RewriteEngine
    RewriteEngine On

    # If the incoming request is aimed at the server,
    # proxy to the port the facility-specific server is running on.
    # The port you choose has to be different for each facility.
    # The port you choose must be added to server configuration file to this facility.
    RewriteRule ^/zf-server/(.*) http://localhost:3199/$1 [P]

    # If there is an existing asset or directory in the request, then route to it.
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]

    # Otherwise links like /stock_manager (for which there is no static file)
    # are all written to /index.html where the angular app will handle the route.
    RewriteRule ^ /index.html
</VirtualHost>
```

After editing the files, in the shell you need to:
```bash
# enable the new sites
sudo a2ensite .../sites-available/eue.example-zfm.com.conf
sudo a2ensite .../sites-available/staging.example-zfm.com.conf

# validate your configuration
sudo apachectl configtest

# reload apache
sudo systemctl reload apache2
```

#### Am I ready to move on?

In order to proceeed, the DNS configuration for the sites you are going to secure
must be working. You can test this with a simple ping:
```shell
ping eue.example-zfm.com
ping staging.example-zfm.com
# should both tell you the IP address of your deployment host
```

Once that is working, you can now enter your subdomain in your browser.
In the example you would put http://eue.example-zfm.com in
your browser's URL.
If you get a message like "This site can't be reached",
then there is a problem with your Apache configuration.
If you get a blank screen your site has been reached, but it is not up yet.
You can move on.

#### Note: forwarding requests to the appropriate zf-server

When the client sends requests to the zf-server the requests go first to the web server
(Apache in this case) which provides all kinds of value, not the least of which
handling SSL decryption, before passing the request on to the zf-server.

We have configured Apache to do this with the following line in the config file:
```
RewriteRule ^/zf-server/(.*) http://localhost:3004/$1 [P]
```

Apache recommends that you proxy with ProxyPass rather than RewriteRule.
That *could* be accomplished with the following configuration:
```
ProxyPass /zf-server http://localhost:3004
ProxyPassReverse /zf-server http://localhost:3004
```

But we have another RewriteRule in the configuration
that looks like this:
```
RewriteRule ^ /index.html
```

The problem is that this RewriteRule takes precedence over the ProxyPass
rule we would have preferred to use and would therefore rewrite all requests
to the zf_server to index.html *before* the ProxyPass rule would take effect.

Consequently, we have decided to implement proxying to
the server with a RewriteRule.

### Secure your site with SSL

To ensure secure connections, you need to get a certificate that will secure
your domain and all "per-facility" subdomains you are going to deploy.

The process differs for the first facility, when you are getting an SSL
certificate for the first time and for subsequent facilities when you are
extending the certificate to secure new facilities.

#### First facility(ies)

When you support your first facility(ies) you need to generate a certificate
that names your domain and the subdomain for each facility.

Before using the procedure that follows, please note that when
you get to the part where the procedure says to use
certbot to create your certificate, you can use multiple -d options,
one for your domain and one for each sub-domain. For example:

```bash
sudo certbot --apache -d staging.example-zfm.com -d eue.example-zfm.com
```

When you run the above command, we suggest that you allow certbot to modify your
apache configuration to redirect all http traffic to https.

Here it a procedure on
[how to secure Apache](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-debian-10).


#### Subsequent facilities

Your existing certificate needs to explicitly support the new sub-domain,
you need to add it to your certificate.

First, you want to know what domains your certificate already supports.
```bash
# get a list of certificates and the domains they support
sudo certbot certificates
```
Suppose that your certificate says your certificate supports

Domains: example-zfm.com, staging.example-zfm.com, eue.example-zfm.com

You now need to "expand" the certificate to include the domain eue.example-zfm.com.
To do so, you need to issue a new certbot command that includes
all the existing supported domains!

```bash
sudo certbot --expand -d example-zfm.com -d test.example-zfm.com -d demo.example-zfm.com -d eue.example-zfm.com
```
Certbot will guide you through the rest of the process of installing the certificate.
Again, we recommend that you allow it to redirect all http traffic to https.

#### All facilities (first or subsequent)

Certbot will have created and enabled an https site for you.
It will even have tried to edit the Virtual Host file you already created, but
the RewriteRules it added to the config file are insufficient.
Just edit your apache config file (eue.example-zfm.com.conf) to permanently
redirect all insecure (http://) traffic to your secure (https://).

The file will look like this:
```bash
<VirtualHost *:80>
    ServerName eue.example-zfm.com
    Redirect permanent / https://eue.example-zfm.com
</VirtualHost>
```

####Am I ready to move on?

Go to this site:

https://www.ssllabs.com/ssltest/

Enter your subdomain (in this case eue.example-zfm.com) in the Hostname,
hit the "Submit" button. You should get a reasonably good report!
It takes a couple of minutes to run.


