## Apache setup

This guide assumes you have apache set up and running. It covers creation of a virtual
server for each facility you want to manage.

In this case we are going to create a virtual host for the the Example University of Examples.

Prerequisites: 
1. you have purchased the domain _example_zfm.com_
1. you have set up a sub-domain for the Example University of Examples called _eue.example_zfm.com_
1. you have already set up the zf-server for _eue_ and it is running on port 3004.
1. you have built the zf-client and installed it in the appropriate directory.  Likely /var/www/zf-client.

You are now ready to create your host for eue.example_zfm.com.

**Note** - this is what the file looks like _before_ you do the SSL configuration.  That process will update this file.

1. go to your apache configuration for example_zfm.com. On Debian this is in /etc/apache2/sites-available.
1. make a make a copy to a file by the same name, except prefaced by eue.
1. edit the file appropriately. 

```bash 
<VirtualHost *:80>
    ServerAdmin ted.moens@gmail.com
    ServerName eue.zebrafishfacilitymanager.com
    #ServerAlias 
    DocumentRoot /var/www/zf-client
    ErrorLog ${APACHE_LOG_DIR}/eue.error.log
    CustomLog ${APACHE_LOG_DIR}/eue.access.log combined

    # This section is required to deploy the zf-client to an apache server
    RewriteEngine On

    # If the request is aimed at the server, proxy to the port the server is running on.
    # Check the zf-server configuration file to see which port the server for
    # a particular facility is using.
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
