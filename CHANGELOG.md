# Changelog

## Unreleased

Mostly focused on performance improvements on slower systems.

On a fast system, the initial processing for a large (180,000 line) gcode file was reduced from 5.5 seconds to 0.7 sec.  
On a slow system (Raspberry Pi 3b+), reduced processing time from 43 seconds to about 10 sec.

### Added

* New option: `ui.throttle` - Limit the draw frequency for a given button (_Stream Deck only_)
* New option: `ui.gcodeLimit` - Limit the number of lines of gcode that will be processed for slower systems,
affecting both gcode rendering, and gcode dimension display (_Stream Deck only_)

### Changed

* Commandline options for Stream Deck service now override config.json values
* Faster error when no streamdeck devices are connected (no longer waits for other initialization steps)
* Exit from service (quickly) if initial websocket connection to cncjs fails
* Updated socket-io.client
* Reduce data transferred from gcode processor
* Much faster, and less strict, gcode processing
* Cache images loaded from disk

### Fixed

* Fixed websocket connection ignoring configured socket port
* Fixed missing license and readme in web build
* Fixed incorrect dependency for canvas module
* Adding missing 'Home' workflow state
* When smooth jogging, fix soft limits generating a backlog of unacknowledged moves, resulting in unexpected movement later
* Reduced unnecessary re-rendering for some button states
* Fixed very small gcode files not rendering correctly