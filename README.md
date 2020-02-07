#Zebrafish Facility Manager

## Description

A software package for maintaining information about a zebrafish facility
used in genetics labs.

It has two parts.  The zf_client part runs in any web browser and
presents a user interface for managing the the stocks in a facility.
The zf_client uses Angular.

The zf_server part runs on a computer with a database and is responsible
for storing the data for a particular facility. The xf_server is a Node.js.

## Main Features

The main purpose of the software is to track zebrafish stocks including
- their lineage
- their genetic markers (mutations and transgenes)
- the lineage of their markers
- which tank(s) the stock occupies
- various notes and data associated with the stock (age, researchers, research notes...)
- simple and seamless creation of new stocks from crosses
- it provides excellent search, navigation and editing capabilities to allow users to focus
on thier work.

An ancillary aspect of the system is that it tracks the genetic markers used in a facility
so that absolute consistency is maintained throughout the system.

It also provides reports to support things like auditing a zebrafish facility.

## Deploying the system

There are a lot of moving parts to this system so the deployment itself is quite
a lot of work.  Follow the [Deplyoment Guide](Deployment.md) to learn how to deploy the system.

A single deployment can be used to manage several zebrafish facilities.

## Per Facility Configuration

Once your system is deployed, you need to configure it for each facility you want to manage.
Follow the [Facility ConfigurationGuide](PerFacility.md) to learn how to configure the system
for each facility.

## License

  Zebrafish Facility Manager is [MIT licensed](LICENSE).
  
## Thank you

- [Nest](https://github.com/nestjs/nest) provides the zf_server application framework.
- [typeorm](https://typeorm.delightful.studio/) provides the orm
- [MariaDB](https://mariadb.com/) is used by default
