# cncjs-pendant-streamdeck

A _highly_ configurable mobile web and Elgato Stream Deck pendant for CNCjs and Grbl

The web version acts as a prototype for the stream deck, with the side effect of being a powerful and useful
pendant in its own right.

All configuration takes place in `public/config.json`. An example, mostly matching my own interface, is included to get started.

You can use your own images, or those included with the pendant.

### Wishlist/To-do

* Configurator

## Features

* Unlimited pages
* Mobile web support
* Arbitrary grid dimensions for web version
* Excessively customizable
* Execute one or more actions on press, release, and/or button hold
* Up to 6 axes
* Lots of included icons, or add your own
* Display and animate gcode
* Manage alarms, hold, and pause events (like macro-triggered tool changes)

## Button customization

* Global settings
  * Text color
  * Press-and-hold color
* Images
* Vertical and horizontal text alignment
* Background color
* Templated button text
* Conditionally show/hide buttons
* Conditionally disable buttons
* Buttons with odd grid dimensions (2x1, 4x3 etc)

## Supported actions

Run one or more actions when a button is pressed, released or held for a moment.

* Jogging
* Smooth jogging (with multiple axes)
* Homing
* Run arbitrary gcode
* Execute macros
* Navigate cncjs watch directory, sort and select gcode files
* Run, pause, feed hold
* Override feedrate, spindle and rapid speeds
* Zero work coordinates or set arbitrary offsets
* Move to specific coordinates
* Fullscreen
* Scene changing actions (navigation, swap, reset)
* Store arbitrary values
* Set brightness (stream deck only)

## Installation

### Web

### Streamdeck

## Configuration

Buttons, layout, and other behavior are configured with the `config.json` file.

The top level configuration object has the following keys:

| Key                   | Type     | Description                               |
|-----------------------|----------|-------------------------------------------|
| [`cncjs`](#cncjs)     | `Object` | Connection information                    |
| [`ui`](#ui)           | `Object` | Global grid size and default colors       |
| [`buttons`](#buttons) | `Object` | Button display and actions                |
| [`scenes`](#scenes)   | `Object` | Button layout on individual pages         |
| [`machine`](#machine) | `Object` | Machine axes and per-axis speed modifiers |

### `cncjs`

Used to configure connection to the cncjs server, and controller serial port

| Key              | Type      | Description                                              |
|------------------|-----------|----------------------------------------------------------|
| `baudRate`       | `Integer` | Serial connection baud rate                              |
| `port`           | `String`  | Serial connection port                                   |
| `controllerType` | `Enum`    | Controller type. Allowed: [`Grbl`]                       |
| `socketAddress`  | `String`  | URL for socket connection to cncjs. Usually `localhost`  |
| `socketPort`     | `Integer` | Socket connection port for cncjs. Usually `80` or `8000` |

### `machine`

Machine axes and per-axis speed modifiers

| Key                                | Type                           | Description                                                     |
|------------------------------------|--------------------------------|-----------------------------------------------------------------|
| `axes`                             | `String[]`                     | Array of axes in use. Allowed values: [`a`,`b`,`c`,`x`,`y`,`z`] |
| [`axisSpeeds`](#machineaxisSpeeds) | [`Object`](#machineaxisSpeeds) | Per-axis speed overrides, used for smooth jogging               |

#### `machine/axisSpeeds`

Override smooth jog speeds on a per-axis basis. Allows moving specific axes slower or faster than the current smooth jog travel speed.

| Key   | Type         | Description                                          |
|-------|--------------|------------------------------------------------------|
| `a`   | `Number`     | Travel speed multiplier for the A axis. Default: `1` |
| `b`   | `Number`     | Travel speed multiplier for the B axis. Default: `1` |
| `c`   | `Number`     | Travel speed multiplier for the C axis. Default: `1` |
| `x`   | `Number`     | Travel speed multiplier for the X axis. Default: `1` |
| `y`   | `Number`     | Travel speed multiplier for the Y axis. Default: `1` |
| `z`   | `Number`     | Travel speed multiplier for the Z axis. Default: `1` |

### `ui`

| Key                             | Type                       | Description                                                                                  |
|---------------------------------|----------------------------|----------------------------------------------------------------------------------------------|
| `bgColor`                       | (`Integer`,`String`)       | Default background color for buttons. May be a color string or [palette](#uipalette) index   |
| `brightness`                    | `Integer`                  | Default Stream Deck brightness. [`10` - `100`]                                               |
| `columns`                       | `Integer`                  | Number of columns to display                                                                 |
| `rows`                          |                            | Number of rows to display                                                                    |
| `font`                          | `String`                   | Font to use for text display. Default: `monospace`                                           |
| `fontSize`                      | `String`                   | Font size to use for text display                                                            |
| `lineHeight`                    | `String`                   | Line height for text display. Defaults to (1.1 * `fontSize`)                                 |
| [`gcodeColors`](#uigcodeColors) | [`Object`](#uigcodeColors) | Line and curve colors for gcode rendering.                                                   |
| `palette`                       | `String[]`                 | Array of colors that buttons and other color settings may refer to by index                  |
| `progressColor`                 | (`Integer`,`String`)       | Color to use for button hold indicator. May be a color string or [palette](#uipalette) index |
| `textColor`                     | (`Integer`,`String`)       | Color to use for button text. May be a color string or [palette](#uipalette) index           |
| `timeout`                       | `Integer`                  | Duration, in seconds, before blanking display. _Stream Deck only_.                           |

#### `ui/gcodeColors`

Gcode preview can use different colors for rapid travel, straight and curved cuts. Colors may use `rgb(0, 50, 200)`, hex `#001122` etc.
Palette colors are not supported here.

| Key    | Type     | Description                              |
|--------|----------|------------------------------------------|
| `G0`   | `String` | Color to use for rapid travel moves.     |
| `G1`   | `String` | Color to use for straight line cut moves |
| `G2G3` | `String` | Color to use for curve cut moves         |

The following variables are available to button conditions (like `if` and `disabled`), and templated text.

#### `ui/palette`

Palette colors are an array of color strings (of any length).
You can refer to these colors in most places that expect a color by referencing their array index.

This helps keep your color choices consistent, and allows changing many colors at once if needed.

**example**

```json
{
  "palette": [
    "#ccc",
    "rgb(0, 100, 255)",
    "salmon"
  ]
}
```

### `scenes`

**example**

```json
{
  "scenes": {
    "myScene": {
      "buttons": [
        ["row1_button", null, null, "row1_button"],
        [],
        ["row3_button"]
      ]
    }
  }
}
```

The scenes configuration controls the layout of buttons (from the [`buttons`](#buttons) object), and is used to
create individual pages. A scene represents a single page of visible buttons. It must have a unique name, so that it
can be referred to by button actions for navigation. 

| Key                                             | Type                               | Description    |
|-------------------------------------------------|------------------------------------|----------------|
| [`<unique scene name>`](#scenesuniquescenename) | [`Object`](#scenesuniquescenename) | A named scene  |

#### `scenes/<unique scene name>`

Individual scenes contain a single key: `buttons`.

| Key       | Type                | Description             |
|-----------|---------------------|-------------------------|
| `buttons` | `(String,Null)[][]` | Nested array of buttons |

The `buttons` value is a nested array of button IDs, with each inner array representing a row of buttons.

`null` values represent an empty space, and can be used in place of button IDs to space later buttons in the row.

Scenes should not contain _more_ than the configured row or column count, and this behavior is considered undefined. 
However, scenes can have fewer items than the row or column.

The following would display eight buttons in a 3x3 grid, with the center square empty.

**example**

```json
{ 
  "buttons": [
    ["b1", "b2", "b3"],
    ["b4", null, "b5"],
    ["b6", "b7", "b8"]
  ]
}
```

Instead of a button ID, _another_ nested array (containing button IDs) can be used in a row. In this case, only the 
**last visible button** in the array will be displayed. This is useful for making toggle buttons (technically two 
different buttons), or other conditional buttons that occupy the same space.

**example**

```json
{
  "buttons": [
    [
      "row1_button",
      [
        "conditional_button1",
        "conditional_button2"
      ]
    ],
    ["row2_button"],
    ["row3_button"]
  ]
}
```

Several scenes have special meaning:

* The `home` scene must exist, as it is used when the webpage or process first loads.
* The `numpad` scene must exist _if_ any buttons use the `enterWcs` or `enterPosition` button actions.
* The `gcodeList` scene _should not_ exist in your scenes list, but is always available for navigation events anyway.

### `buttons`


The `buttons` configuration defines buttons, their appearance details, and what (if anything) happens when buttons are
pressed, released or held. [`Scenes`](#scenes) will refer to these buttons by their unique ID to display them their layout.

**example**

```json
{
  "buttons": {
    "my_button": {
      "bgColor": "#ffccaa",
      "icon": "custom/my_icon.png",
      "text": "Oh no!",
      "textAlignment": "top right",
      "actions": [
        {
          "action": "navigate",
          "arguments": ["home"],
          "event": "hold"
        }
      ]
    }
  }
}
```

| Key                                             | Type                                 | Description    |
|-------------------------------------------------|--------------------------------------|----------------|
| [`<unique button id>`](buttonsuniquebuttonname) | [`Object`](#buttonsuniquebuttonname) | A named button |

#### `buttons/<unique button name>`

| Key                          | Type                         | Description                                                                                                                                             |
|------------------------------|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`actions`](#buttonactions)  | [`Object[]`](#buttonactions) | Actions to take when button is pressed, released or held                                                                                                |
| `bgColor`                    | (`Integer`,`String`)         | Background color. May be a color string or [palette](#uipalette) index                                                                                  |
| `columns`                    | `Integer`                    | Number of columns the button will occupy. Default: `1`                                                                                                  |
| `rows`                       | `Integer`                    | Number of rows the button will occupy. Default: `1`                                                                                                     |
| `type`                       | `Enum`                       | Changes the button's behavior and appearance. Allowed: [`gcodePreview`]                                                                                 |
| `icon`                       | `String`                     | Image path to display, relative to `public` directory. Image will be shown over background, and behind text.                                            |
| `if`                         | `String`                     | Condition used for hiding and showing the button. See: [conditions](#conditions)                                                                        |
| `disabled`                   | `String`                     | Condition used for disablind and enabling the button. See: [conditions](#conditions)                                                                    |
| `text`                       | `String`                     | Text or text template that to be displayed on the button. See: [templates](#templates)                                                                  |
| `textAlignment`              | `Enum`                       | Text position within the button. Allowed: [`top left`, `top center`, `top right`, `left`,`center`,`right`,`bottom left`,`bottom center`,`bottom right`] |


#### `button/actions`

A button's `actions` value defines what happens when a button is activated. Buttons can take multiple actions when pressed,
or when released, or when held down for a few moments, or a combination of those.

When a `hold` action is defined, any following `up` action will be skipped. This allows buttons to perform an action when
pressed briefly, and perform a different action if pressed for a longer period, exclusively.

| Key         | Type       | Description                                                                                  |
|-------------|------------|----------------------------------------------------------------------------------------------|
| `action`    | `String`   | The name of an action which will be triggered based on the `event`. See: [actions](#actions) |
| `event`     | `Enum`     | When the action will take place. Allowed: [`up`,`down`,`hold`]. Default: `down`              |
| `arguments` | `String[]` | Options passed to the event. See: [actions](#actions) for specific arguments for each event  |

**example**

```json
{
  "actions": [
    
  ]
}
```

## `actions`

[Buttons](#buttons) can use any of the following actions.

### Navigation actions

There are several different actions used for navigating between scenes. The difference between these is what happens
when navigating back with `backScene`.

#### `actions/navigate`

Change to the selected scene. `backScene` will return to the previous scene where the navigation was triggered.

| Argument | Description             |
|----------|-------------------------|
| scene id | The scene to change to  |

**example**

```json
{
  "actions": [
    {
      "action": "navigate",
      "event": "up",
      "arguments": ["home"]
    }
  ]
}
```

#### `actions/setScene`

Change to the selected scene, clearing all back button history. This can be used to return "home" without allowing a `backScene` action afterward

| Argument | Description             |
|----------|-------------------------|
| scene id | The scene to change to  |

#### `actions/swapScene`

Replace the current scene with the selected scene. `backScene` will return to the scene _before_ the scene where the action was triggered. This can be used to apparently change several button states at once invisibly.

| Argument | Description             |
|----------|-------------------------|
| scene id | The scene to change to  |

#### `actions/backScene`

Returns to the previous scene.

### Jogging actions

#### `actions/jog`

Jog in the given direction, based on `cnc.jogDistance`

| Argument  | Description                                           |
|-----------|-------------------------------------------------------|
| direction | The direction of motion. One of `-` or `+`            |
| axis      | The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c` |

#### `actions/startSmoothJog`

Start smooth jogging in the given direction

Based on `cnc.jogSpeed` and `machine.axisSpeeds`. Multiple jog directions may be active at the same time.

| Argument  | Description                                           |
|-----------|-------------------------------------------------------|
| direction | The direction of motion. One of `-` or `+`            |
| axis      | The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c` |

**example**

```json
{
  "actions": [
    {
      "action": "startSmoothJog",
      "arguments": ["+", "x"]
    },
    {
      "action": "stopSmoothJog",
      "arguments": ["+", "x"],
      "event": "up"
    }
  ]
}
```

#### `actions/stopSmoothJog`

Stop smooth jogging in the given direction.

| Argument  | Description                                           |
|-----------|-------------------------------------------------------|
| direction | The direction of motion. One of `-` or `+`            |
| axis      | The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c` |

#### `actions/jogDistance`

Change the current jog distance, which affects future [`jog`](#actions/jog) distances.

| Argument  | Description                                                                 |
|-----------|-----------------------------------------------------------------------------|
| direction | Whether to increase or decrease the current jog distance. One of `-` or `+` |

#### `actions/jogSpeed`

Change the current smooth jog speed, which affects future [`smoothjog`](#actions/startSmoothJog) speeds.

| Argument  | Description                                                                     |
|-----------|---------------------------------------------------------------------------------|
| direction | Whether to increase or decrease the current smooth jog speed. One of `-` or `+` |

### Interface actions

#### `actions/brightness`

Change the current screen brightness (_Stream Deck only_)

#### `actions/fullscreen`

Toggle fullscreen (_web only_)

### Override actions

#### `actions/feedrate`

Change the feedrate override

| Argument  | Description                                                     |
|-----------|-----------------------------------------------------------------|
| direction | Whether to increase or decrease the feedrate. One of `-` or `+` |

#### `actions/toggleFeedrateInterval`

Toggle how much the feedrate is changed by the [feedrate action](#actionsfeedrate), either 1% or 10%.

#### `actions/resetFeedrate`

Reset the feedrate override to 100%

#### `actions/spindle`

Change the spindle speed override based on the [spindle interval](#actionstoggleSpindleInterval)

| Argument  | Description                                                          |
|-----------|----------------------------------------------------------------------|
| direction | Whether to increase or decrease the spindle speed. One of `-` or `+` |

#### `actions/toggleSpindleInterval`

Toggle how much the spindle speed is changed by the [spindle action](#actionsspindle), either 1% or 10%.

#### `actions/resetSpindle`

Reset the spindle speed override to 100%

#### `actions/setRapids`

Change the rapid speed override

| Argument | Description                                     |
|----------|-------------------------------------------------|
| speed    | The new rapid speed. One of [`25`, `50`, `100`] |


### User flag actions

User flags are arbitrary, temporary variables that can be displayed as [dynamic text](#templates) in buttons, or used as 
[conditions](#conditions) for changing a button's visibility or enabled/disabled status. They can be set, removed, or 
toggled.

These variables are not persisted, and will be reset when the page is reloaded, or when the stream deck process is restarted.

#### `actions/setUserFlag`

Associate an arbitrary name with a string value

| Argument | Description                             |
|----------|-----------------------------------------|
| key      | A name to associate with a string value |
| value    | The value to save in the above key      |

#### `actions/deleteUserFlag`

Remove an existing user flag

| Argument | Description                  |
|----------|------------------------------|
| key      | The user flag name to remove |

#### `actions/deleteUserFlag`

Toggle a user flag.

The user flag does not need to exist before toggling. It will be set to `true` on the first toggle

| Argument | Description                  |
|----------|------------------------------|
| key      | The user flag name to remove |

### Numeric input actions

#### `actions/input`

Adds one or more characters to the end of the current numeric input

| Argument | Description                                     |
|----------|-------------------------------------------------|
| value    | The string to append to the current input value |

#### `actions/inputCommand`

Input commands modify the current input value. 

| Argument | Description                                                                     |
|----------|---------------------------------------------------------------------------------|
| command  | The operation to take on the current value. One of: [`backspace`, `toggleSign`] |

**Commands:**

* `toggleSign`: Flip the current input value from positive to negative, or negative to positive
* `backspace`: Remove the last character from the end of the current input value

#### `actions/completeInput`

Save the current value and return to the previous scene

### Positioning actions

#### `actions/goto`

Move to a specific absolute machine position one one or more axes.

When an argument is given as a percentage (ex: `"25%"`), the position will be calculated based on machine dimensions.

| Argument   | Description                |
|------------|----------------------------|
| X position | X axis position to move to |
| Y position | Y axis position to move to |
| Z position | Z axis position to move to |
| A position | A axis position to move to |
| B position | B axis position to move to |
| C position | C axis position to move to |

**example**

In the below example, the machine will be moved to 10% of the maximum Y range, 30 Z, and 50% of the maximum C axis range.

```json
{
  "actions": [
    {
      "action": "goto",
      "arguments": [null, "10%", 30, null, null, "50%"]
    }
  ]
}
```

#### `actions/homing`

Home all axes

#### `actions/enterPosition`

Opens the special `numpad` scene for the selected axis. When a number has been entered and confirmed with the
[`completeInput`](#actionscompleteInput) action, the machine will be moved to selected position on the axis.

| Argument | Description                                           |
|----------|-------------------------------------------------------|
| axis     | The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c` |

#### `actions/enterWcs`

Opens the special `numpad` scene for the selected axis. When a number has been entered and confirmed with the
[`completeInput`](#actionscompleteInput) action, the selected axis's work coordinate offset will be changed to the
selected value 

| Argument | Description                                           |
|----------|-------------------------------------------------------|
| axis     | The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c` |


### Gcode actions

#### `actions/refreshWatchFolder`

Refresh the cncjs watch folder and open the [file list](#filelist)

#### `actions/clearGcode`

Clears cncjs's loaded gcode, if a gcode file has been loaded

#### `actions/gcode`

Run arbitrary gcode

| Argument | Description  |
|----------|--------------|
| gcode    | Gcode to run |

#### `actions/macro`

Run a cncjs macro. Macros run from this pendant do not currently have access to some cncjs variables, 
like `[ymin]` and `[xmax]`. Macros which require these should not be used.

| Argument   | Description                                                         |
|------------|---------------------------------------------------------------------|
| macro id   | The UUID of the macro to run. Can be found in cncjs's `.cncrc` file |
| macro name | The name of the macro to run.                                       |

**example**

```json
{
  "actions": [
    {
      "action": "macro",
      "arguments": [null, "My Macro"]
    }
  ]
}
```

### CNC state actions

These actions relate to the current feed and run state

#### `actions/connect`

If disconnected, `connect` will attempt to open the serial port using the [cncjs](#cncjs)` serial configuration.

#### `actions/run`

Start running the loaded gcode

#### `actions/stop`

Stop running the current gcode job

#### `actions/pause`

Pause the currently running gcode job

#### `actions/hold`

Feed hold. Decelerate axes and pause the current job

#### `actions/unhold`

Cycle start. Resume cutting after a feed hold

#### `actions/reset`

Soft reset the controller, maintaining machine position.

#### `actions/unlock`

Issue an Alarm Unlock command

#### `actions/stopFeed`

Stop cncjs's feeder queue

#### `actions/startFeed`

Start cncjs's feeder queue if stopped

### variables
### `ui`

* Type: `object`

* `columns` **integer**: Number of columns to display
* `rows` **integer**: Number of rows to display
* `palette` **string[]** Optional array of colors for use with button backgrounds and similar in CSS color format. Palette colors can be
as by their 0-indexed position, so that all button colors can be updated at once.
* `textColor` **(string|integer)**: Default color for button text. Palette color index or CSS color format.
* `textShadow` **boolean**: Whether to add a small shadow to text
* `bgColor` **(string|integer)**: Default color for button background. Palette color index or CSS color format.
* `progressColor`: **(string|integer)**: Default color for push-and-hold indicator. Palette color index or CSS color format.

### `cnc` **object**

 * `connected` **boolean**: Whether CNC connection has been established
 * `runState` **string**: 
 * `workflowState` **string**:
 * `locked` **boolean**: Whether CNC is in a locked state. For example, after restting following an alarm.
 * `alarmReason` **string**: Alarm reason, if known
 * `pauseReason` **string**: Pause reason, if known. Example: `M6`
 * `pauseMessage` **string**: Pause reason text, if known.
 * `pauseText` **string**: Preformatted pause reason and text for button display
 * `jogDistance` **number**: The distance value to use for jog commands. Does not include units
 * `jogSpeed` **number**: The speed to use for smooth jogging. Does not include units
 * `settings` **object<string, string>**: Current grbl settings
 * `wpos` **object**: The current work position. Properties: `x`, `y`, `z`, `a`, `b`, `c`
 * `mpos` **object**: The current machine position. Properties: `x`, `y`, `z`, `a`, `b`, `c`
 * `modal` **object**: Grbl modal state information
   * `distance`: Current motion mode. Either `G90` or `G91`
   * `units`: Current distance units. Either `G20` or `G21`
   * `wcs`: The current work offset: One of `G54`
 * `isRelativeMove` **boolean**: Whether the current modal distance is `G91` (relative)
 * `distanceUnit` **string**: The current distance unit, one of `mm` or `in`
 * `alarm` **boolean**: Whether or not grbl is in an alarm state
 * `alarmText` **string**: Preformatted alarm text/reason/locked status for button display
 * `pauseText` **string**: Preformatted pause text/reason for button display
 * `ready` **boolean**: Whether the machine is connected and either in the idle or jog (meaning smooth jogging) state

### `gcode` **object**
  * `name` **string**: The path to the currently loaded gcode file, if any
  * `gcode` **string**: The raw loaded gcode
  * `displayRange` **object**: Preformatted range information from the loaded gcode
    * `min` **object**: The minimum axis ranges
      * `x` **number**: The minimum X axis value
      * `y` **number**: The minimum Y axis value
      * `z` **number**: The minimum Z axis value
    * `max` **object**: The maximum axis ranges
      * `x` **number**: The maximum X axis value
      * `y` **number**: The maximum Y axis value
      * `z` **number**: The maximum Z axis value
  * `displayDimensions` **object**: Preformatted dimension information from the loaded gcode
    * `x` **number**: Total gcode width along the X axis
    * `y` **number**: Total gcode depth along the Y axis
    * `z` **number**: Total gcode height along the Z axis

### `buttons` **object**

```json
{
  "buttons": {
    "my_button": {
      "bgColor": "#ffccaa",
      "icon": "custom/my_icon.png",
      "text": "Oh no!",
      "textAlignment": "top right",
      "actions": [
        {
          "action": "navigate",
          "arguments": ["home"],
          "event": "hold"
        }
      ]
    }
  }
}
```

* `<any string>` **object**: The key is a unique button ID
  * `bgColor` **(string|integer)**: Button background color. Palette color index or CSS color format.
  * `icon` **string**: The path to an icon, relative to the `public/icons` directory. example: `custom/my-custom-icon.png`
  * `text` **string**: A string which can contain variables. See: [template replacement]
  * `textSize` **number**, *default 1*: Text size modifier. Set to 2 for double sized text, or 0.5 for half-sized
  * `textAlignment` **string** *default "left"*: How text will be aligned. One of: `top left`, `top center`,
  `top right`, `left`, `center` `right`, `bottom left`, `bottom center`, `bottom right`
  * `rows` **integer**, *default 1*: Number of rows for button to occupy.
  * `columns` **integer**, *default 1*: Number of columns for button to occupy.
  * `if` **string**: Condition which can be used to hide the button. See: [conditions]
  * `disabled` **string**: Condition which can be used to disable the button. Disabled buttons do not respond to button presses,
  do not have a background color, and are grayed out. See: [conditions]
  * `type` **string**: Magic value which changes the buttons appearance. The only value available is `gcodePreview`. See: [button types]
  * `animated` **boolean**, *default false*: Only used by `gcodePreview` type. If true, gcode will be rendered over several seconds
  * `actions` **object[]**: Array of actions to take on button press, release, or hold
    * `action` **string**: Action ID. See [#actions](#actions)
    * `arguments` **string[]**: List of arguments to pass to the action. Types and number depend on the action.
    * `event` **string[]** *default "down"*: What kind of button event will trigger the action, one of: `down`, `up`, `hold`.  
    If a `hold` event has been configured and is activated, the `up` actions (if any) will be skipped.

### Interface

* `fullscreen`: Toggle fullscreen (web only)

### Numpad entry

* `input`: Add a character to an input string  
Arguments:
  1. Character to add at the end of the current input. A string like "5", or a decimal point ".".
* `completeInput`: Finish inputs, passing the number back to the previous command  
Arguments: none
* `inputCommand`: Other actions that can be taken for numeric input   
Arguments:
  1. One of: 
     * `backspace`: erase the last character of the input
     * `toggleSign`: change input to/from negative/positive

### File list

The file list scene layout is not configurable, since it is dynamically generated. However, the buttons used in this scene can have their appearance customized.

It is recommended that configuration of these buttons be limited background color and image.

| Key                      | Description                                                           |
|--------------------------|-----------------------------------------------------------------------|
| `fileListFile`           | GCode file button                                                     |
| `fileListFolder`         | Subfolder button                                                      |
| `fileListPreviousFolder` | "Up a directory" button                                               |
| `fileListDownArrow`      | Down arrow for scrolling when the file list overflows the grid layout |
| `fileListUpArrow`        | Up arrow for scrolling when the file list overflows the grid layout   |
| `sortScene`              | Button that links to a scene where file sort options can be selected  |


### Configuration

## Recipes

### Buttons with two different states

### Change several other buttons

### Expand button on press

## Licenses and credits

Several icon sets have been added for convenience

* [carlo -
  streamdeck-iconpack-fluentui-system-icons - MIT](https://github.com/carlo/streamdeck-iconpack-fluentui-system-icons/blob/main/LICENSE.md)
* [carlo - streamdeck-iconpack-system-uicons - MIT](https://github.com/carlo/streamdeck-iconpack-system-uicons/blob/main/LICENSE.md)
* [fontawesome - CC BY 4.0](https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/LICENSE.txt)  
  Alterations: SVG images have been converted to PNG
