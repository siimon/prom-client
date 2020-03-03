# 2020-02-20, Version 12.0.0

- feature: remove all timestamp support (#333) (Sam Roberts)

- fix: collect metrics on scrape, not timeout (#329) (Sam Roberts)

- feat: implement advanced event loop monitoring (#278) (Yuriy Vasiyarov)

- fix: remove deprecated non-config object support (#330) (Sam Roberts)

- feat: implement GC metrics collection without native(C++) modules (#274) (Yuriy Vasiyarov)

- chore: add GH Actions CI (#323) (Simen Bekkhus)

- chore: update outdated dependencies (#322) (Simen Bekkhus)

- chore: spelling corrections in README (#325) (0xflotus)

- feat: Return the final duration value from startTimer callback (#282) (ricardoe)

- chore: add test for process_start_time_seconds (Sam Roberts)

- chore: correct var name in processStartTime (Sam Roberts)

- chore: remove ignored package-lock.json (#320) (Sam Roberts)

- chore: drop support for Node.js 8.x (appveyor) (#321) (Sam Roberts)

- chore: drop support for Node.js 8.x (#315) (Sam Roberts)

- fix: process_max_fds is process limit, not OS (#314) (Sam Roberts)

- chore: reindent package.json (Sam Roberts)

- Fix performance: avoid empty loops (Aleksei Androsov)

- fix: avoid mutation bug in registry.getMetricsAsJSON() (Aleksei Androsov)

- Cluster metrics aggregation ignores default labels (#170) (dependabot[bot])

- chore: fix CI/drop support for Node.js 6 (Zach Bjornson)

- Lazy-load cluster module to fix Passenger (Laurent Goudet)

- Bump mixin-deep from 1.3.1 to 1.3.2 (dependabot[bot])

- fix: TypeScript declaration - strict label values (#299) (Kobi)

- Messed up version number in Changelog (Simon Nyberg)

# 2019-06-27, Version 11.5.3

- Changelog 11.5.2 (Simon Nyberg)

- Compress t-digest to prevent memory leakage (#234) (Arne Schubert)

# 2019-06-20, Version 11.5.2

- fix: avoid mutation bug in registry (#273) (Jake Verbaten)

# 2019-06-13, Version 11.5.1

- fix: guard against missing constructor (Yuriy Vasiyarov)

# 2019-06-05, Version 11.5.0

- chore: prepare for publish (Simen Bekkhus)

- feat: add option to disable timestamps on defaultMetrics (#255) (Axel Dolce)

- Add validateMetricName() to the public interface (#246) (Paul Melnikow)

- chore: add recommended prettier eslint config (Simen Bekkhus)

- chore: bump dependencies (#269) (Simen Bekkhus)

- fix(types): incorrect return type of collectDefaultMetrics(), should be Timeout in Node (#264) (Nazar Mokrynskyi)

# 2019-06-04, Version 11.4.0

- chore: prepare for release (Simen Bekkhus)

- Split process request and process handles by type (#260) (Yuriy Vasiyarov)

# 2019-04-02, Version 11.3.0

- Changelog for 11.3.0 (Simon Nyberg)

- Fix rare ERR_IPC_CHANNEL_CLOSED bug in cluster mode (#244) (Zach Bjornson)

- Add remove() method for handling dynamic labels (#242) (Russell Centanni)

- Performance improvement (#235) (Denis Fäcke)

- removing the reset functionality from the readme from every single metric type (#243) (Krisztina Hirth)

- chore: test on node 8, not 9 [skip ci] (Simen Bekkhus)

- chore: fix appveyor build (#237) (Simen Bekkhus)

- chore: bump deps (Simen Bekkhus)

# 2018-12-21, Version 11.2.1

- Updated changelog (Simon Nyberg)

- update types for SummaryConfiguration (#231) (Gabriel Castro)

# 2018-11-13, Version 11.2.0

- Updated changelog for release (Simon Nyberg)

- Sliding windows for summaries (#229) (Oscar Tholander)

- Matt jarrett fix child dependency with vulnerability (#230) (Matt Jarrett)

- Create benchmark suite (#222) (Nowell Strite)

# 2018-09-22, Version 11.1.3

- prepare for 11.1.3 (Simen Bekkhus)

- Mutate labels to avoid excessive object cloning. (#220) (Nowell Strite)

- chore: add eslint-plugin-node (#221) (Simen Bekkhus)

# 2018-09-19, Version 11.1.2

- prepare for 11.1.2 (Simen Bekkhus)

- Fix histogram scrape performance (#219) (Nowell Strite)

- chore: upgrade prettier (#218) (Simen Bekkhus)

- Remove Sinon dev dependency (#217) (François Voron)

- Allow setting Gauge values to NaN. (#202) (Tim Joseph Dumol)

- adding prefix to DefaultMetricsCollectorConfiguration, related to the release v11.1.0. (#208) (Oscar Serna)

- Add getMetricsAsArray to index.d.ts (#211) (CubeKap)

- Updated README.md (#204) (Joseph Dalrymple)

# 2018-06-29, Version 11.1.1

- Prepare for 11.1.1 (Simon Nyberg)

- Fix #200 (#201) (François Voron)

# 2018-06-29, Version 11.1.0

- Prepare for 11.1.0 (Simon Nyberg)

- Add optional prefix to default metrics (#198) (Dan Forys)

- Fix aggregator method being lost when aggregating several registries (#193) (stupid cat)

- Validate labels on inc on counters (#190) (Ivan Vasiunyk)

- Fix `startTimer` utility to not mutate passed `startLabels` object (#188) (kdk)

- upgrade dependencies (#175) (Simen Bekkhus)

# 2018-03-10, Version 11.0.0

- Dropped node 4 support (#174) (Simon Nyberg)

- Use base units (seconds) for current time in gauge (#171) (Thom Wright)

# 2018-02-28, Version 10.2.3

- Added new version to changelog (Simon Nyberg)

- Cluster metrics aggregation ignores default labels (#170) (Aleksei Androsov)

- Use prettier on markdown and json (#164) (Simen Bekkhus)

# 2017-11-02, Version 10.2.2

- fixed invalid memory report on linux (#163) (Yurij Mikhalevich)

# 2017-10-27, Version 10.2.1

- Only resolve/reject `clusterMetrics` promise if no callback is provided (#162) (Zach Bjornson)

# 2017-10-16, Version 10.2.0

- Lazily initialize cluster event listeners (#159) (Zach Bjornson)

- fix for issue #156 (#158) (Jan Amoyo)

- reset Metrics (#157) (Erwin Poeze)

- Upgrade outdated dev dependencies (Simen Bekkhus)

# 2017-09-26, Version 10.1.1

- Bugfix - update TypeScript definitions (#154) (Tim Schoenheider)

- Bugfix - cannot get cluster info in node version < 6 (#153) (Simon Emms)

- Update links in changelog (Simen Bekkhus)

- Format changes in changelog (Simon Nyberg)

- Added new unrelased section in changelog (Simon Nyberg)

# 2017-09-04, Version 10.1.0

- Support aggregating metrics from a cluster (#147) (Zach Bjornson)

# 2017-08-22, Version 10.0.4

- Include invalid values in the error messages (#149) (András Tóth)

# 2017-08-07, Version 10.0.3

- Compatibility with pushgateway 0.4 (#146) (Ruben Slabbert)

- Fixed typing of DefaultMetricsCollectorConfiguration in definitions file (#148) (Frederick Cai)

- Enabled collection of default metrics in example (Simon Nyberg)

- Added registerMetric to definitions file (Simon Nyberg)

# 2017-07-07, Version 10.0.2

- Don't poll default metrics every single tick (Simen Bekkhus)

- Updated changelog with 10.0.1 (Simon Nyberg)

# 2017-07-06, Version 10.0.1

- Init metrics to zero (#139) (Simon Nyberg)

# 2017-07-04, Version 10.0.0

- Use deprecation util for collectDefaultMetrics (Simen Bekkhus)

- Allow registering default metrics to other registries (#135) (Simen Bekkhus)

- Print deprecation warnings on deprecated constructors (#134) (Simen Bekkhus)

- Add support for default labels (#137) (nwest1)

- Use public export in example (Simen Bekkhus)

- Upgrade eslint, and activate recommended config (#136) (Simen Bekkhus)

- Upgrade and pin prettier (Simen Bekkhus)

- Fikx wrong import in example (Simen Bekkhus)

- Fix readme typos (Simen Bekkhus)

- Convert prototype to classes (#125) (Simen Bekkhus)

- Replace sinon with lolex (#133) (Simen Bekkhus)

- Add precommit hook to format code (#131) (Simen Bekkhus)

- Make tests pass in node 8 (#126) (Simen Bekkhus)

- Make merge static in ts typings (#132) (Simen Bekkhus)

- Use template strings (#130) (Simen Bekkhus)

- Arrow functions (#123) (Simen Bekkhus)

- Convert var to let/const (#127) (Simen Bekkhus)

- Remove rogue package-lock.json (Simen Bekkhus)

- Format code with prettier (#120) (Simen Bekkhus)

- Remove util-extend (#121) (Simen Bekkhus)

- Use object shorthand (#124) (Simen Bekkhus)

- Remove unused functions (#122) (Simen Bekkhus)

- Use object constructor for built in metrics (#129) (Simen Bekkhus)

- Node 4 package.json changes (#119) (Simen Bekkhus)

- Replace new Date().getTime() with Date.now() (Simen Bekkhus)

- Use jest for tests (#128) (Simen Bekkhus)

- Fix typo in changelog header (Simen Bekkhus)

# 2017-06-17, Version 9.1.1

- Rollback version in package.json to allow using npm to bump (Simen Bekkhus)

- Remove timestamp from static metrics. fixes siimon/prom-client#114 (#115) (Sindre Gulseth)

# 2017-06-07, Version 9.1.0

- Updated changelog, prepare for release (Simon Nyberg)

- Fix index.d.ts and Pushgateway URL can contain a path (#111) (Florian Boulay)

- Include name of unknown label in error (#110) (Simen Bekkhus)

- Correct typedef for constructor object (#109) (Simen Bekkhus)

- Added CHANGELOG (Simon Nyberg)

- move out new date from loop (#105) (Alexander)

# 2017-05-06, Version 9.0.0

- Non-global registries (#100) (eljasala)

- Updated README after constructor changes (Simon Nyberg)

- Renamed labels property to labelNames (Simon Nyberg)

- Updated type definitions with timestamp support (Simon Nyberg)

- Updated examples with new configuration object (Simon Nyberg)

- Move collection of default metrics inside an explicit function call (#101) (Simen Bekkhus)

- Add timestamp to default metrics (#103) (Simen Bekkhus)

- Updated type definitions (Simon Nyberg)

- Prepare for multiple registers (Simon Nyberg)

- Use object instead of separate params as constructor parameters (#102) (Simon Nyberg)

- Fixed spacing (Simon Nyberg)

- Add timestamp field support (#69) (Ricardo Stuven)

# 2017-04-20, Version 8.1.1

- Updated typedef for getSingleMetricAsString() (#98) (Sergey Peshkov)

# 2017-04-19, Version 8.1.0

- Displaying a single metric as a Prometheus string (#97) (Sergey Peshkov)

# 2017-04-04, Version 8.0.0

- Dont add external gauge if external is not supported (Simon Nyberg)

- Throw if there are duplicate default metric names (#92) (Simen Bekkhus)

- Fix shadowing of nodejs*heap_size*\*\_bytes by spaces size (#86) (Alexander)

- Add external memory default metrics (#94) (Alexander)

- Upgrade outdated deps (#93) (Simen Bekkhus)

- Export expected content type (#91) (Simen Bekkhus)

- Fix getSingleMetric type and add exported Metric type (#90) (Alexander)

- Add missing method to typings (#89) (Alexander)

- Fix exception handling for process.memoryUsage() (#87) (Alexander)

# 2017-03-21, Version 7.2.0

- Include node.js version in output (#81) (Simen Bekkhus)

- Added explanation of how to include labels _and_ configuration for histograms (#78) (Andrew Stewart Gibson)

# 2017-02-14, Version 7.1.0

- Reenabled all tests again.. (Simon Nyberg)

- Extend with custom request options in Pushgateway (Simon Nyberg)

- Typings: defaultMetrics overload (#74) (Sergey Kuznetsov)

- Use hrtime for timing (#70) (Dominic Smith)

- Fix array jsdoc and remove unused variables (#68) (Alexander)

# 2017-01-10, Version 7.0.1

- Error handling to catch uncaughts from process.memUsage() (Simon Nyberg)

# 2017-01-02, Version 7.0.0

- Better handling when incrementing counters with 0 (Simon Nyberg)

- Passing authentication data through URI, when pushing to Pushgateway (#65) (Maciej Makowski)

- Add node 6 to travis and node 7 to appveyor (Simon Nyberg)

- Only support current active node.js releases (Simon Nyberg)

- Detailed nodejs v8 heap space metrics (#64) (Alexander)

# 2016-12-07, Version 6.3.0

- Make tests more robust (Simon Nyberg)

- Export split user+system CPU time (#62) (Paul Evans)

# 2016-12-01, Version 6.2.0

- Added scheme to Pushgateway example code. (#61) (Bill Brown)

- Add method to get a registred metric (#60) (Simen Bekkhus)

# 2016-11-18, Version 6.1.2

- Typescript improvements (#59) (Nick Fisher)

# 2016-11-08, Version 6.1.1

- cpu usage: Fix increasing cpu usage (#58) (Arne-Christian Blystad)

# 2016-10-13, Version 6.1.0

- Added typescript definition file (Simon Nyberg)

# 2016-10-07, Version 6.0.0

- Use seconds as base unit for eventloop lag (#52) (Simon Nyberg)

# 2016-10-07, Version 5.0.4

- Revert "Use seconds as base unit for eventloop lag (#52)" (Simon Nyberg)

# 2016-10-06, Version 5.0.3

- Don't inc counter if value is 0 (Simon Nyberg)

- Use seconds as base unit for eventloop lag (#52) (Simen Bekkhus)

- Only register the `max_fds` if the OS is supported (#50) (Simen Bekkhus)

# 2016-09-27, Version 5.0.2

- Parse `maxFds` into a number (#49) (Simen Bekkhus)

- Fix check for open FDs (#48) (Simen Bekkhus)

- Fix method name (#47) (Jonas Wagner)

- Remove newline from process_max_fds value (#46) (Tristan Colgate-McFarlane)

# 2016-09-21, Version 5.0.1

- Remove all default metrics on initalization (#44) (#45) (Simon Nyberg)

- Add link to GC module (#43) (Simen Bekkhus)

# 2016-09-20, Version 5.0.0

- Update description of new metrics (#40) (Simen Bekkhus)

- Add API to remove single metric (#42) (Simen Bekkhus)

- Throw on duplicate metrics (#41) (Simen Bekkhus)

- Enfore tabs as indentation (#39) (Simen Bekkhus)

# 2016-09-20, Version 4.1.0

- Added heap size and heap used defaultMetrics (Simon Nyberg)

- Use delta instead inc total value in processCpuTotal (Simon Nyberg)

- Process cpu seconds should be a counter (Simon Nyberg)

- Use metric types from index.js in example (Simon Nyberg)

- Don't prematurely register processMaxFileDescriptors metrics (#36) (Tristan Colgate-McFarlane)

# 2016-09-07, Version 4.0.0

- Extra metrics (#34) (Simen Bekkhus)

- Fixed tests (Simon Nyberg)

- Removed depricated functions (Simon Nyberg)

- Add the officially recommended metrics (#25) (Simen Bekkhus)

# 2016-09-06, Version 3.5.0

- Add post-timer labels (#1) (#30) (Michael Young)

- Added appveyor badge (Simon Nyberg)

- Add appveyor file (#29) (Simen Bekkhus)

- Test on all supported majors of node, and OSX (#28) (Simen Bekkhus)

- Only include relevant files in package (#26) (Simen Bekkhus)

- Add syntax highlighting to samples in readme (#27) (Simen Bekkhus)

# 2016-08-18, Version 3.4.7

- Added getMetricsAsJSON method (#23) (Vot Z)

# 2016-06-30, Version 3.4.6

- Removed unnecessary condition (Simon Nyberg)

# 2016-06-30, Version 3.4.5

- Changed lint rules to comply with new eslint (Simon Nyberg)

- Removed duplicate entry in eslintrc (Simon Nyberg)

- Moved test-unit to it's on npm run target (Simon Nyberg)

- Bumped dependencies (Simon Nyberg)

- Fixed lint error (Simon Nyberg)

- Removed the dependency to request (Simon Nyberg)

- Escape label names and bugfixes to escaping in general (Simon Nyberg)

- Handle observation of 0s (Simon Nyberg)

# 2016-06-28, Version 3.4.4

- Fixed bug where counter labels were not correctly handled when passed as a parameter to inc() (#19) (Andrew Keating)

- Removed test for now.. (Simon Nyberg)

- labels hash moved (#18) (John Jedborn)

- Fixed npm warning (Simon Nyberg)

- Eliminate dependency on the object-hash package and replace with custom function in lib/util.js (#17) (Michael Pearce)

- Updated version number to 3.4.1 (Paul Nieuwenhuis)

- Summary percentile values should be 0 instead of undefined after reset (Paul Nieuwenhuis)

- Bumped version number to 3.4.0 (Paul Nieuwenhuis)

- Removed seperate reset function (Paul Nieuwenhuis)

- Added reset function to histogram and summary (Paul Nieuwenhuis)

- Enable all tests again (Paul Nieuwenhuis)

- Updated readme with Pushgateway (Simon Nyberg)

- Pushgateway (Simon Nyberg)

- Make sure buckets and percentiles are not mutated (Roger Wilson)

- Added bucket generators (Simon Nyberg)

- All metrics should start with an uppercase letter (Simon Nyberg)

- Changed order to alphabetic of packages in package.json (Paul Nieuwenhuis)

- Added utility function to README + changed some comment references to mention 'summary' instead of 'histogram' (Paul Nieuwenhuis)

- Updated README (Paul Nieuwenhuis)

- Updated version number (Paul Nieuwenhuis)

- Added summary metric type + tests (Paul Nieuwenhuis)

- Changed license in package.json (Simon Nyberg)

- fixed undefined var in the gauge set function (James Maloney)

- Added build info to readme (Simon Nyberg)

# 2016-01-28, Version 3.0.2

- Observe the correct value for the correct labelset (Simon Nyberg)

- Added LICENSE (Simon Nyberg)

- Bugfix for histogram - acc all values to top (Simon Nyberg)

- Handle value > highest bucket (Simon Nyberg)

- Validate label and metric names (Simon Nyberg)

- Escape help and name strings (Simon Nyberg)

- Updated readme with labels (Simon Nyberg)

- Bugfixes for histogram (Simon Nyberg)

- Removed unused dependency (Simon Nyberg)

- Updated example (Simon Nyberg)

- Improved label handling in histograms (Simon Nyberg)

- Improved labels in gauge (Simon Nyberg)

- Fixes label handling in counters (Simon Nyberg)

# 2015-11-30, Version 2.0.2

- Removed express from dependencies (Simon Nyberg)

- Changed git links (Simon Nyberg)

- README (Simon Nyberg)

- Dont crash if value is above most upperbound (Simon Nyberg)

- Removed doc folder (Simon Nyberg)

# 2015-11-24, Version 2.0.0

- First release!
