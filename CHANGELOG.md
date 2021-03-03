# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.2.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.3...v2.2.0) (2021-03-03)


### Features

* **config:** Remove client configuration files, all configuration loaded by server ([3fa438d](https://github.com/tmoens/zebrafish-facility-manager/commit/3fa438dd53ed01fd096ed3e7846a4c57a12845db))

### [2.1.3](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.2...v2.1.3) (2021-03-02)

### [2.1.2](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.1.0...v2.1.2) (2021-02-27)


### Bug Fixes

* **GUI:** reseacher selection not properly updating researcher on cross-label ([e28b4d4](https://github.com/tmoens/zebrafish-facility-manager/commit/e28b4d441d6305325a4d2366387e0423b2aa1e19))
* **GUI:** Stock filter for any researcher changed to ANY not NONE. PI too ([a3d714f](https://github.com/tmoens/zebrafish-facility-manager/commit/a3d714ff548846291903e6384bc938d5f2df1fbc))


## [2.1.0](https://github.com/tmoens/zebrafish-facility-manager/compare/v2.0.2...v2.1.0) (2021-02-26)


### Features

* **doc:** Add user documentation ([059d5a7](https://github.com/tmoens/zebrafish-facility-manager/commit/059d5a713274b30967fe10a52d4abe96532579a7))

### [2.0.2](https://github.com/tmoens/zebrafish-facility-manager/compare/v0.0.4...v2.0.2) (2021-02-26)


### Bug Fixes

* example configuration files ([5482d4e](https://github.com/tmoens/zebrafish-facility-manager/commit/5482d4e026a96b08b30619ae13e3cca7f293ea29))
* set default values for new user so that form fills without error messages. ([82daa73](https://github.com/tmoens/zebrafish-facility-manager/commit/82daa737ebaa6c782cdc12ad5a647823b34eec66))
* update to package.json ([aced118](https://github.com/tmoens/zebrafish-facility-manager/commit/aced118cd3ee6c591992665f8eee8d33e2c7b1fb))

### 2.0.0 (2021-02-25) Database change for stock.researcher and stock.pi, new label features

1. stock.researcher used to be a string is replaced with stock.researcherUser which is
a reference to a User.
1. stock.pi - same
1. new cross-label feature
1. improve tank label feature to allow user editing
1. bunches of other things - see the git log.


### 1.0.0 (Sept 2020) initial release features all in place, several facilities gone live
