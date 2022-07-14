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
* Execute actions on press, release, or button hold
* Up to 6 axes
* Lots of included icons, or add your own
* Display and animate gcode
* Manage alarms, hold, and pause events (like gcode or macro-triggered toolchanges)

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

## Configuration

Buttons, layout, and other behavior are configured with the `config.json` file.

The top level configuration has the following keys:

| Key                   | Type     | Description                               |
|-----------------------|----------|-------------------------------------------|
| [`cncjs`](#cncjs)     | `Object` | Connection information                    |
| [`ui`](#ui)           | `Object` | Global grid size and default colors       |
| [`buttons`](#buttons) | `Object` | Button display and actions                |
| [`scenes`](#scenes)   | `Object` | Button layout on individual pages         |
| [`machine`](#machine) | `Object` | Machine axis and per-axis speed modifiers |

### `cncjs`

| Key              | Type      | Description                                              |
|------------------|-----------|----------------------------------------------------------|
| `baudRate`       | `Integer` | Serial connection baud rate                              |
| `controllerType` | `Enum`    | CNC controller type. Allowed: [`Grbl`]                   |
| `port`           | `String`  | Serial connection port                                   |
| `socketAddress`  | `String`  | URL for socket connection to cncjs. Usually `localhost`  |
| `socketPort`     | `Integer` | Socket connection port for cncjs. Usually `80` or `8000` |

### `machine`

| Key                                | Type                           | Description                                                     |
|------------------------------------|--------------------------------|-----------------------------------------------------------------|
| `axes`                             | `String[]`                     | Array of axes in use. Allowed values: [`a`,`b`,`c`,`x`,`y`,`z`] |
| [`axisSpeeds`](#machineaxisSpeeds) | [`Object`](#machineaxisSpeeds) | Per-axis speed overrides, used for smooth jogging               |

#### `machine/axisSpeeds`

Override smooth jog speeds on a per-axis basis. Allows moving specific axes slower or faster than the current smooth jog travel speed.

| Key   | Type         | Description                                         |
|-------|--------------|-----------------------------------------------------|
| `a`   | `Number`     | Travel speed multiplier for the A axis. Default `1` |
| `b`   | `Number`     | Travel speed multiplier for the B axis. Default `1` |
| `c`   | `Number`     | Travel speed multiplier for the C axis. Default `1` |
| `x`   | `Number`     | Travel speed multiplier for the X axis. Default `1` |
| `y`   | `Number`     | Travel speed multiplier for the Y axis. Default `1` |
| `z`   | `Number`     | Travel speed multiplier for the Z axis. Default `1` |

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


### `scenes` **object**

```json
{
  "scenes": {
    "my_scene": {
      "buttons": [
        ["row_1_button", null, null, "back"],
        ["row_2_button", "another button"],
        [["mutually_exclusive_1", "mutually_exclusive_2"]]
      ]
    }
  }
}
```

* `<any string>` **object**: The key is a unique scene ID
  * buttons* **(string|null)[][]**:  Nested array of buttons. Each nested array represents a row of buttons, listed by their ID  
  `null` button values will be empty when displayed.  
  Instead of a button id, a (further) nested array containing button IDs can be used, only one of which will be displayed,
  with the last button having priority. Useful toggle or other conditional buttons which should take up the same space.

## Actions

    "enterPosition",
    "enterWcs",

    "gcode",
    "hold",
    "homing",

    "macro",

    "reset",

    "toggleShowAbsolutePosition",
    "unhold",
    "unlock"

### Navigation

There are several different actions used for navigating between scenes. These affect what happens
when navigating "back".

* `navigate`: Change to the configured scene. Back will return to the previous scene where the 
navigation was triggered.  
Arguments:
  1. `scene id` The scene ID to navigate to.

* `setScene`: Changes to the configured scene, removing the back button **history**. This can be 
used to return "home" without allowing a back button action.  
  Arguments:
    1. `scene id` The scene ID to change to.
* `swapScene`: Replaces the current scene with the configured scene, and in the history. Back will return to the
scene _before_ the scene where the action was triggered. This can be used to change several
button states at once invisibly.  
  Arguments:
    1. `scene id` The scene ID to swap to.
* `backScene`: Returns to the previous scene.  
Arguments: none

#### Example

```json
{
  "actions": [
    {
      "action": "navigate",
      "arguments": ["home"]
    }
  ]
}
```

### Jogging

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

#### `jog`: Jog in the given direction, based on `cnc.jogDistance` 

* Arguments:
  1. The direction of motion, one of `-` or `+`
  2. The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c`
  
#### `startSmoothJog`: Start smooth jogging in the given direction

Based on `cnc.jogSpeed` and `machine.axisSpeeds`. Multiple jog directions may be active at the same time  

* Arguments:
  1. The direction to smooth jog, one of `-` or `+`
  2. The axis, one of `x`, `y`, `z`, `a`, `b`, `c`

#### `stopSmoothJog`: Stop smooth jogging in the given direction.  

* Arguments:
  1. The direction to _stop_ smooth jogging, one of `-` or `+`
  2. The axis, one of `x`, `y`, `z`, `a`, `b`, `c`


* `jogDistance`: Increase or decrease jog distance
* `jogSpeed`: Increase or decrease smooth jog speed

#### `arguments`

 1. Whether to increase or decrease jog speed/distance. One of `+` or `-`

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
