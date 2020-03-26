## Apache setup

This guide assumes you have apache set up and running. It covers creation of a virtual
server for each facility you want to manage.

In this case we are going to create a virtual host for the the Example University of Examples.

Prerequisites: 
1. you have purchased the domain _example_zfm.com_
1. you have set up a sub-domain for the Example University of Examples called _eue.example_zfm.com_
1. you have already set up the zf-server for _eue_ and it is running on port 3003.
1. you have built the zf-client and installed it in the appropriate directory.  Likely /var/www/zf-client.

You are now ready to create your host for eue.example_zfm.com.

1. go to your apache configuration for example_zfm.com. On Debian this is in /etc/apache2/sites-available.
1. make a make a copy to a file by the same name, except prefaced by eue.
1. edit the file appropriately.  You

```bash 
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerAdmin your.email@somewhere.com
    ServerName eue.example_zfm.com
    DocumentRoot /var/www/zf-client
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    # The client will automatically send all server requests to
    # <ServerName>/zf_server, we have to redirect those requests
    # to the appropriate zf-server instance identified by the
    # port the zf-server is running on.
    ProxyPreserveHost On
    ProxyPass /zf_server http://localhost:3003
    ProxyPassReverse /zf_server http://localhost:3003

    # This is where the SSL certificate is referenced.
    # All virtual hosts use the same certificate.
    # Make sure the server name is added to the certificate.
    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile /etc/letsencrypt/live/testzfc.tk/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/testzfc.tk/privkey.pem
</VirtualHost>
</IfModule>
<IfModule mod_ssl.c>

# Automatically redirect insecure traffic (http) trafic to the secure site (https)
<VirtualHost *:80>
    ServerAdmin ted.moens@gmail.com
    ServerName fhcrc.testzfc.tk
    ServerAlias www.fhcrc.testzfc.tk
    Redirect / https://fhcrc.testzfc.tk/
</VirtualHost>

# Allow .htaccess file in the zf-client directory
</IfModule>
<Directory /var/www/zf-client>
    AllowOverride All
    Require all granted
</Directory>
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
