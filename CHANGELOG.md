# Changelog
All noteable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased
### Added
### Changed

## [9.0.0] - 2017-05-06
### Added
- Support for multiple registers
- Support for object literals in metric constructors
- Timestamp support

### Changed
- Collection of default metrics is now disabled by default. Start collection by running `collectDefaultMetrics()`.

### Deprecated
- Creating metrics with one argument per parameter - use object literals instead.
