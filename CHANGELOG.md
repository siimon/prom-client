# Changelog
All noteable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
### Changed

## [9.1.1] - 2017-06-17
### Changed
- Don't set timestamps for metrics that are never updated

## [9.1.0] - 2017-06-07
### Added
- Ability to merge registries

### Changed
- Correct typedefs for object constructor of metrics

## [9.0.0] - 2017-05-06
### Added
- Support for multiple registers
- Support for object literals in metric constructors
- Timestamp support

### Changed
- Collection of default metrics is now disabled by default. Start collection by running `collectDefaultMetrics()`.

### Deprecated
- Creating metrics with one argument per parameter - use object literals instead.


[Unreleased]: https://github.com/siimon/prom-client/compare/v9.1.1...HEAD
[9.1.1]: https://github.com/siimon/prom-client/compare/v9.1.0...v9.1.1
[9.1.0]: https://github.com/siimon/prom-client/compare/v9.0.0...v9.1.0
[9.0.0]: https://github.com/siimon/prom-client/commit/1ef835f908e1a5032f228bbc754479fe7ccf5201
