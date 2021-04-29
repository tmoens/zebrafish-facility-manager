#Zebrafish Facility Manager

## Description

A software package for maintaining information about a zebrafish facility
used in genetics labs.

It has two parts.  The zf_client part runs in any web browser and
presents a user interface for managing the stocks in a facility.
The zf_client uses Angular.

The zf_server part runs on a computer with a database and is responsible
for storing the data for a particular facility. The zf_server is a Node.js
application written using the NestJS framework.

The two communicate via an API.

## Main Features

The main purpose of the software is to track zebrafish stocks including
- their lineage
- their genetic markers (mutations and transgenes)
- the lineage of their markers
- which tank(s) the stock occupies
- various notes and data associated with the stock (age, researchers, research notes...)
- simple and seamless creation of new stocks from crosses
- it provides excellent search, navigation and editing capabilities to allow users to focus
on their work.

An ancillary aspect of the system is that it tracks the genetic markers used in a facility
so that absolute consistency is maintained throughout the system.

It also provides reports to support things like auditing a zebrafish facility.

## Deployment Documentation

The deployment documentation is written in markdown.
You can use it as is in your IDE.
Alternately you use [MkDocs](https://mkdocs.org) to build a static doc site
complete with nice navigation.

MkDocs is written in Python, so you will need to install Python3 (and pip) inorder to build the documentation.
The installation process is documented [here](https://mkdocs.org/#installation);

I also use the mkdocs-material theme, so you will have to install that too.
See [here](https://squidfunk.github.io/mkdocs-material/getting-started/#with-pip)

Once that's done, you build the documentation website:

```shell
# navigate to the root of the repository
cd /var/www/zfm/staging/zebrafish-facility-manager/zf-deployment-docs
mkdocs build
```

This generates (or overwrites) the /site sub-directory in zf-deployment-docs.
The /site directory is straight HTML, so I won't go into detail on how to deploy
it.

## Deploying the system

There are a lot of moving parts to this system, so the deployment itself is quite
a lot of work.  Follow the [InitialDeplyoment Guide](zf-deployment-docs/docs/InitialDeployment.md) to learn how to deploy the system.

A single deployment can be used to manage several zebrafish facilities.

## Per Facility Configuration

Once your system is deployed, you need to configure it for each facility you want to manage.
Follow the [Facility ConfigurationGuide](zf-deployment-docs/docs/PerFacility.md) to learn how to configure the system
for each facility.

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application framework.
- [TypeORM](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by defaul
- [MkDocs](https://mkdocs.org)
