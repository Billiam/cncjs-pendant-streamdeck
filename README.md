# cncjs-pendant-streamdeck

A _highly_ configurable mobile web and (eventually) HID elgato stream deck pendant for CNCjs

The web version acts as a prototype for the stream deck, with the side effect of being a powerful and useful
pendant in its own right.

All configuration takes place in `public/config.json`. An example, mostly matching my own interface, is included to get started.

You can use your own images, or those included with the pendant.


## TODO

### Features

* File listing
* File loading
* Absolute position navigation
* Navigation presets
* Jog presets


### Wishlist

* Configurator

## Configuration

* Probe layout + icons
* 

## Features

* Unlimited pages
* Any grid dimensions you like
* Execute actions on press, release, or button hold
* Up to 6 axes
* Lots of included icons, or add your own
* Display loaded gcode
* Manage alarms, hold, and pause events (like gcode or macro-triggered toolchanges)

## Display customization

* Unlimited pages
* Any grid size
* Button images
* Templated button text
* Global text color
* Vertical and horizontal text alignment
* Background color
* Conditionally show/hide buttons
* Conditionally disable buttons
* Buttons may occupy odd grid dimensions (2x1, 4x3 etc)

## Supported actions

* Jog
* Smooth jogging (with multiple axes)
* Arbitrary gcode
* Run cncjs commands
* Run cncjs macros
* Zero work coordinates or set arbitrary offsets
* Move to specific coordinates
* Fullscreen
* Scene changing actions (navigation, swap, reset)

## Configuration

The top level configuration has several keys: 
* `cncjs` for connection information
* `ui` for the global grid size and default colors
* `buttons` to configure buttons and their actions
* `scenes` for the way that buttons are laid out on individual pages

The following variables are available to button conditions (like `if` and `disabled`), and templated text.

### `ui` **object**

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
  * `type` **string**: Magic value which changes the buttons appearance. The only value available is `gcodePreview`. See: [button types]
  * `animated` **boolean**, *default false*: Only used by `gcodePreview` type. If true, gcode will be rendered over several seconds
  * `disabled` **string**: Condition which can be used to disable the button. Disabled buttons do not
  display a background color, are partially transparent, and do not respond to button pushes. See: [conditions]
  * `actions` **object[]**: Array of actions to take on button press, release, or hold
    * `action` **string**: Action ID. See [#actions](#actions)
    * `arguments` **string[]**: List of arguments to pass to the action. Types and number depend on the action.
    * `event` **string[]** *default "down"*: What kind of button event will trigger the action, one of: `down`, `up`, `hold`.  
    If a `hold` event is set and fires, configured `up` events will be skipped.

#### Example:

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

### `scenes` **object**

* `<any string>` **object**: The key is a unique scene ID
  * buttons* **(string|null)[][]**:  Nested array of buttons. Each nested array represents a row of buttons, listed by their ID  
  `null` button values will be empty when displayed

#### Example

```json
{
  "scenes": {
    "my_scene": {
      "buttons": [
        ["row_1_button", null, null, "back"],
        ["row_2_button", "another button"]
        []
      ]
    }
  }
}
```

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

  * `jog`: Jog in the given direction, based on `cnc.jogDistance`  
  Arguments:
    1. The direction of motion, one of `-` or `+`
    2. The axis to move, one of `x`, `y`, `z`, `a`, `b`, `c`
  * `startSmoothJog`: Start smooth jogging in the given direction, based on `cnc.jogSpeed`. Multiple jog directions may 
    be active at the same time  
    Arguments:
      1. The direction to smooth jog, one of `-` or `+`
      2. The axis, one of `x`, `y`, `z`, `a`, `b`, `c`
  * `stopSmoothJog`: Stop smooth jogging in the given direction.  
    Arguments:
      1. The direction to _stop_ smooth jogging, one of `-` or `+`
      2. The axis, one of `x`, `y`, `z`, `a`, `b`, `c`

#### `arguments`:



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
