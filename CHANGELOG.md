# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Breaking
### Added
### Changed

## [10.0.4] - 2017-08-22
### Changed
- Include invalid values in the error messages

## [10.0.3] - 2017-08-07
### Added
- Added registerMetric to definitions file
### Changed
- Fixed typing of DefaultMetricsCollectorConfiguration in definitions file
- Don't pass timestamps through to pushgateway by default

## [10.0.2] - 2017-07-07
### Changed
- Don't poll default metrics every single tick

## [10.0.1] - 2017-07-06
### Added
- Metrics should be initialized to 0 when there are no labels

## [10.0.0] - 2017-07-04
### Breaking
- Print deprecation warning when metrics are constructed using non-objects
- Print deprecation warning when `collectDefaultMetrics` is called with a number
### Added
- Ability to set default labels by registry
- Allow passing in `registry` as second argument to `collectDefaultMetrics` to use that instead of the default registry
### Changed
- Convert code base to ES2015 code (node 4)
  - add engines field to package.json
  - Use object shorthand
  - Remove `util-extend` in favor of `Object.assign`
  - Arrow functions over binding or putting `this` in a variable
  - Use template strings
  - `prototype` -> `class`

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


[Unreleased]: https://github.com/siimon/prom-client/compare/v10.0.4...HEAD
[10.0.4]: https://github.com/siimon/prom-client/compare/v10.0.3...v10.0.4
[10.0.3]: https://github.com/siimon/prom-client/compare/v10.0.2...v10.0.3
[10.0.2]: https://github.com/siimon/prom-client/compare/v10.0.1...v10.0.2
[10.0.1]: https://github.com/siimon/prom-client/compare/v10.0.0...v10.0.1
[10.0.0]: https://github.com/siimon/prom-client/compare/v9.1.1...v10.0.0
[9.1.1]: https://github.com/siimon/prom-client/compare/v9.1.0...v9.1.1
[9.1.0]: https://github.com/siimon/prom-client/compare/v9.0.0...v9.1.0
[9.0.0]: https://github.com/siimon/prom-client/commit/1ef835f908e1a5032f228bbc754479fe7ccf5201
