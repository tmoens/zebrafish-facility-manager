## Apache setup

This guide assumes you have apache set up and running. It covers creation of a virtual
server for each facility you want to manage.

Let's assume you have set up a domain called zfm_example.com

### Per facility preparation

For the purpose of illustration, let's say you are getting ready to manage a facility at
the Ohio State University.

Let's assume you have already set up the zf_server for OSU and it is running on port 3003.
If you have not, you need to do that before proceeding, because you need that port number.

### Sub Domains

You need to create a sub-domain like osu.zfm_example.com.  You also need to configure
your DNS to point osu.zfm_example.com to your server's IP address.

### Apache Virtual Host




Create a virtual server for your domain name.

Get an SSL certificate to secure your virtual server.

You also need to enable the server to speak https which involves installing a certificate
and changing your firewall settings. [Here is an article you could
use](https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-debian-10)

You probably want to auto-backup (securely) the /etc/letsencrypt directory
if you used letsEncrypt to get your certificate.
