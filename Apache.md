## Apache setup

This guide assumes you have apache set up and running. It covers creation of a virtual
server for each facility you want to manage.

In this case we are going to create a virtual host for the Example University of Examples.

Prerequisites: 
1. you have purchased the domain _example_zfm.com_
1. you have set up a sub-domain for the Example University of Examples called _eue.example_zfm.com_
1. you have chosen to run the zf-server for _eue_ on port 3004.
1. you have built the zf-client and installed it in the appropriate directory.
Likely /var/www/zf-client.

You are now ready to create your virtual host for eue.example_zfm.com.

**Note** - this is what the file looks like _before_ you do the SSL configuration.
That process will update this file.

1. go to your apache configuration directory. 
On Debian this is in /etc/apache2/sites-available.
1. create a new virtual host configuration file called eue.example_zfm.com.conf.
1. edit the file appropriately by copying the example below and adjusting it accordingly.

```bash 

<VirtualHost *:80>
    ServerAdmin email_for_your_server_administrator@some_email_provider.whatever
    ServerName eue.example_zfm.com

    # Note *ALL* facilities share the same zf-client deployment.
    DocumentRoot /var/www/zf-client

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

After editing the file, in the shell you need to:
```bash 
# enable the new site
sudo a2ensite .../sites-available/_your_edited_vhost_file

# validate your configuration
sudo apachectl configtest

# reload apache
sudo systemctl reload apache2
```


### A note about proxying requests to the server

When the client sends requests to the zf-server the requests go first to the web server
(Apache in this case) which provides all kinds of value, not the least of which
handling SSL decryption, before passing the request on to the zf-server.

We have configured Apache to do this with the following line in the config file:
```
RewriteRule ^/zf-server/(.*) http://localhost:3004/$1 [P]
```

But Apache recommends that you proxy with ProxyPass rather than RewriteRule.
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
