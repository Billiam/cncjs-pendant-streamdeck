# cncjs-pendant-streamdeck

A _highly_ configurable mobile web and Elgato Stream Deck pendant for CNCjs and Grbl

The web version acts as a prototype for the stream deck, with the side effect of being a powerful and useful
pendant in its own right.

All configuration takes place in `public/config.json`. An example, mostly matching my own interface, is included to get started.

You can use your own images, or those included with the pendant.

### To-do

* Configurator
* Web validation
* Docs site
* Screenshots

## Features

* Unlimited pages
* Mobile web support
* Arbitrary grid dimensions for web version
* Excessively customizable
* Execute one or more actions on press, release, and/or button hold
* Support up to 6 axes
* Lots of included icons, or add your own
* Display and animate gcode
* Manage alarms, hold, and pause events (like macro-triggered tool changes)

## Installation

### Web

1. Download the latest release and extract it, to ex: `/home/my-name/cncjs-pendant-streamdeck`
2. Rename `config.example.json` to `config.json`
3. Update the `config.json` file with your connection information in the [`"cncjs"`](#cncjs) section.
4. Edit your `~/.cncrc` file, adding a mount point for this pendant
    ```
    "mountPoints": [
      {
        "route": "grid",
        "target": "/home/pi/cncjs-pendant-streamdeck"
      }
    ]
    ```
5. Restart CNCjs

### Streamdeck

Follow [Web](#web) steps above to generate create a configuration directory, `config.json` file, and button images.
You can skip the `cncrc` step if you do not need the web interface.

#### Linux

_Instructions borrowed from https://github.com/julusian/node-elgato-stream-deck_

On linux, the udev subsystem blocks access to the StreamDeck without some special configuration.
Save the following to `/etc/udev/rules.d/50-elgato.rules` and reload the rules with 
`sudo udevadm control --reload-rules`

```
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0060", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0063", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006c", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006d", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0080", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0086", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0060", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0063", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006c", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006d", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0080", MODE:="666", GROUP="plugdev"
KERNEL=="hidraw*", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0086", MODE:="666", GROUP="plugdev"
```

Install Stream Deck and canvas dependencies:

```
apt-get install libusb-1.0-0-dev libudev-dev libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

Install optional node dependencies:

```
npm install -g canvas @julusian/jpeg-turbo
```

Install the application:

```
npm install -g cncjs-pendant-streamdeck
```

Run the pendant

```
cncjs-pendant-streamdeck --directory /home/my-name/cncjs-pendant-streamdeck
```

## Configuration

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

| Key                     | Type                 | Description                                                                                        |
|-------------------------|----------------------|----------------------------------------------------------------------------------------------------|
| `accessTokenExpiration` | (`String`,`Integer`) | Expiration time web token, in seconds or as a duration string (_Stream Deck only_). Default: `30d` |
| `baudRate`              | `Integer`            | Serial connection baud rate                                                                        |
| `port`                  | `String`             | Serial connection port                                                                             |
| `controllerType`        | `Enum`               | Controller type. Allowed: [`Grbl`]                                                                 |
| `socketAddress`         | `String`             | URL for socket connection to cncjs. Usually `localhost`                                            |
| `socketPort`            | `Integer`            | Socket connection port for cncjs. Usually `80` or `8000`                                           |

### `machine`

Machine axes and per-axis speed modifiers

| Key                                | Type                           | Description                                                     |
|------------------------------------|--------------------------------|-----------------------------------------------------------------|
| `axes`                             | `String[]`                     | Array of axes in use. Allowed values: [`a`,`b`,`c`,`x`,`y`,`z`] |
| [`axisSpeeds`](#machineaxisSpeeds) | [`Object`](#machineaxisSpeeds) | Per-axis speed overrides, used for smooth jogging               |

#### `machine/axisSpeeds`

Override smooth jog speeds on a per-axis basis. Allows moving specific axes slower or faster than the current smooth jog travel speed.

| Key | Type     | Description                                          |
|-----|----------|------------------------------------------------------|
| `a` | `Number` | Travel speed multiplier for the A axis. Default: `1` |
| `b` | `Number` | Travel speed multiplier for the B axis. Default: `1` |
| `c` | `Number` | Travel speed multiplier for the C axis. Default: `1` |
| `x` | `Number` | Travel speed multiplier for the X axis. Default: `1` |
| `y` | `Number` | Travel speed multiplier for the Y axis. Default: `1` |
| `z` | `Number` | Travel speed multiplier for the Z axis. Default: `1` |

### `ui`

| Key                             | Type                       | Description                                                                                  |
|---------------------------------|----------------------------|----------------------------------------------------------------------------------------------|
| `bgColor`                       | (`Integer`,`String`)       | Default background color for buttons. May be a color string or [palette](#uipalette) index   |
| `brightness`                    | `Integer`                  | Default Stream Deck brightness. [`10` - `100`]                                               |
| `columns`                       | `Integer`                  | Number of columns to display                                                                 |
| `rows`                          |                            | Number of rows to display                                                                    |
| `font`                          | `String`                   | Font to use for text display. Default: `monospace`                                           |
| `fontSize`                      | `String`                   | Font size to use for text display                                                            |
| `lineHeight`                    | `String`                   | Line height for text display as a percentage of font size. Default: `1.1`                    |
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


### Conditions

You may want to conditionally hide buttons, or visibly disable them, based on the current application state: Whether a job
is currently running, whether the pendant is running in a web browser or a Stream Deck, whether gcode has been loaded,
and so on.

The `enabled` and `if` properties of a [button's](#buttonsuniquebuttonname) configuration are strings which are 
evaluated and can execute a limited set of javascript. 

Math, ternary, numeric comparison and logical operators are allowed, but methods may not be executed.

Most of the application state is available for these conditions, see [variables](#variables)

Conditions which are evaluated to a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value will be
shown for `if` properties, or disabled for `disabled` properties.
Conditions which evaluate to a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value will be
hidden for `if` properties, or enabled for `disabled` properties.

**example**

```json
{
  "buttons": {
    "web_only_alarm_button": {
      "if": "ui.web",
      "disabled": "!cnc.alarm"
    },
    "increase_feed_rate": {
      "disabled": "cnc.overrides.feed === 200"
    }
  }
}
```

### Templates

A [button's](#buttonsuniquebuttonname) `text` configuration value can be used to display a plain text string, but it can also act as a simple text 
_template_, containing and displaying application state information, which will be updated and re-rendered whenever any 
of the referenced state changes.

A text template is a string containing `{{ code }}`. Code within these braces will be evaluated with the same rules as
[conditions](#conditions).

**example**

```json
{
  "buttons": {
    "hello_world": {
      "text": "hello world!"
    },
    "Current X Position": {
      "text": "X Position: {{cnc.mpos.x}}"
    }
  }
}
```

### Variables

Variables represent pieces of application state that can be used for [conditions](#conditions) and
[text templates](#templates). Some of these values are internal only, and unlikely to be useful for button
display. These have not been documented below.

These variables are available under 3 different objects: [`ui`](#ui-1), [`cnc`](#cnc-1) and [`gcode`](#gcode).

#### `ui`

State related to the current pendant user interface

| Value                 | Type      | Description                                                                      |
|-----------------------|-----------|----------------------------------------------------------------------------------|
| `ui.brightness`       | `Integer` | The current brightness value. _Stream Deck only_ [`10` - `100`]                  |
| `ui.feedrateInterval` | `Integer` | The amount that feedrate will be increased or decreased by when modified         |
| `ui.spindleInterval`  | `Integer` | The amount that spindle speed will be increased or decreased by when modified    |
| `ui.userFlags`        | `Object`  | Object containing [user flag data](#userflagactions). Ex: `ui.userFlags.MyValue` |
| `ui.input.value`      | `String`  | Numeric string representing the current value for the numpad input scene         |
| `ui.input.previous`   | `String`  | The previous value of the input being set by the numpad input scene              |
| `ui.input.type`       | `String`  | A label for the type of input being set by the numpad input scene                |
| `ui.web`              | `Boolean` | Whether the pendant is being used in a web browser or on a Stream Deck device    |
| `ui.sceneName`        | `String`  | The name of the currently active scene                                           |

#### cnc

State related to the machine or cncjs's 

| Value                   | Type      | Description                                                                                                                 |
|-------------------------|-----------|-----------------------------------------------------------------------------------------------------------------------------|
| `cnc.connected`         | `Boolean` | Whether cncjs is connected to the machine by serial port                                                                    |
| `cnc.connecting`        | `Boolean` | Whether cncjs is currently in the process of connecting                                                                     |
| `cnc.runState`          | `String`  | The current controller state. One of [`Idle`, `Alarm`, `Hold`, `Jog`, `Run`]                                                |
| `cnc.workflowState`     | `String`  | The cncjs workflow state. One of [`idle`, `paused`, `running`]                                                              |
| `cnc.feederState`       | `String`  | The cncjs feeder state. One of [`idle`, `paused`]                                                                           |
| `cnc.locked`            | `Boolean` | Whether the controller is in an Alarm Lock state                                                                            |
| `cnc.elapsedTime`       | `Integer` | The elapsed job time, in seconds                                                                                            |
| `cnc.elapsedTimeText`   | `String`  | The elapsed job time, in `hh:mm:ss` format, or empty string if not available                                                |
| `cnc.remainingTime`     | `Integer` | The remaining job time, in seconds                                                                                          |
| `cnc.remainingTimeText` | `String`  | The remaining job time, in `hh:mm:ss` format, or empty string if not available                                              |
| `cnc.alarm`             | `Boolean` | Whether or not Grbl is in an alarm state                                                                                    |
| `cnc.alarmText`         | `String`  | Preformatted alarm text/reason/locked status for button display                                                             |
| `cnc.alarmReason`       | `String`  | The reason for an alarm, if known                                                                                           |
| `cnc.pauseReason`       | `String`  | Pause reason, if known. Example: `M6`                                                                                       |
| `cnc.pauseMessage`      | `String`  | Pause reason text, if known                                                                                                 |
| `cnc.pauseText`         | `String`  | Preformatted pause reason and text for button display                                                                       |
| `cnc.errorMessage`      | `String`  | The error reason, if the pause state is associated with an error                                                            |
| `cnc.feedPauseReason`   | `String`  | The cncjs feed pause reason, if known                                                                                       |
| `cnc.feedPauseMessage`  | `String`  | The cncjs feed pause text, if known                                                                                         |
| `cnc.jogDistance`       | `Number`  | The distance value to use for jog commands. Does not include units                                                          |
| `cnc.jogSpeed`          | `Number`  | The speed to use for smooth jogging. Does not include units                                                                 |
| `cnc.settings`          | `Object`  | The current raw Grbl setting values                                                                                         |
| `cnc.wpos`              | `Object`  | The current work position                                                                                                   |
| `cnc.wpos.x`            | `String`  | The current X work position                                                                                                 |
| `cnc.wpos.y`            | `String`  | The current Y work position                                                                                                 |
| `cnc.wpos.z`            | `String`  | The current Z work position                                                                                                 |
| `cnc.wpos.a`            | `String`  | The current A work position                                                                                                 |
| `cnc.wpos.b`            | `String`  | The current B work position                                                                                                 |
| `cnc.wpos.c`            | `String`  | The current C work position                                                                                                 |
| `cnc.displayWpos`       | `String`  | Preformatted multiline string of all [enabled axes](#machine) and their work positions with string padding for alignment    |
| `cnc.mpos`              | `Object`  | The current machine position                                                                                                |
| `cnc.mpos.x`            | `String`  | The current X machine position                                                                                              |
| `cnc.mpos.y`            | `String`  | The current Y machine position                                                                                              |
| `cnc.mpos.z`            | `String`  | The current Z machine position                                                                                              |
| `cnc.mpos.a`            | `String`  | The current A machine position                                                                                              |
| `cnc.mpos.b`            | `String`  | The current B machine position                                                                                              |
| `cnc.mpos.c`            | `String`  | The current C machine position                                                                                              |
| `cnc.displayMpos`       | `String`  | Preformatted multiline string of all [enabled axes](#machine) and their machine positions with string padding for alignment |
| `cnc.modal`             | `Object`  | Grbl modal state information                                                                                                |
| `cnc.modal.distance`    | `String`  | Current motion mode. Either `G90` or `G91`                                                                                  |
| `cnc.modal.units`       | `String`  | Current distance units. Either `G20` or `G21`                                                                               |
| `cnc.modal.wcs`         | `String`  | The current work offset: One of [`G54`, `G55`, `G56`, `G57`, `G58`, `G59`]                                                  |
| `cnc.isRelativeMove`    | `Boolean` | Whether the current modal distance is `G91` (relative)                                                                      |
| `cnc.distanceUnit`      | `String`  | The current distance unit, one of `mm` or `in`                                                                              |
| `cnc.ready`             | `Boolean` | Whether the machine is connected and either in the `idle` or `jog` (meaning smooth jogging) states                          |
| `cnc.overrides`         | `Object`  | Current Grbl speed overrides                                                                                                |
| `cnc.overrides.feed`    | `Integer` | The current feed rate override [`10` - `200`]                                                                               |
| `cnc.overrides.spindle` | `Integer` | The current spindle speed override [`10` - `200`]                                                                           |
| `cnc.overrides.rapid`   | `Integer` | The current rapid speed override. One of: [`25`, `50`, `100`]                                                               |
| `cnc.hold`              | `Boolean` | Whether the controller state is currently `Hold`                                                                            |
| `cnc.paused`            | `Boolean` | Whether both the cncjs workflow and feed state are both in a paused state                                                   |
| `cnc.feedPaused`        | `Boolean` | Whether the cncjs feed state is `paused`                                                                                    |
| `cnc.idle`              | `Boolean` | Whether the cncjs workflow and feed state are both in a idle state                                                          |
| `cnc.running`           | `Boolean` | Whether the cncjs workflow state is `Running` and the feed state is `idle`                                                  |
| `cnc.axisLimits`        | `Object`  | The current Grbl axis limits. Keys depend on [machine axes configuration](#machine)                                         |

#### `gcode`

State related to the currently loaded gcode.

| Value                      | Type     | Description                                              |
|----------------------------|----------|----------------------------------------------------------|
| `gcode.name`               | `String` | The path to the currently loaded gcode file, if any      |
| `gcode.gcode`              | `String` | The raw gcode content, if loaded                         |
| `gcode.displayRange`       | `Object` | Preformatted range information from the loaded gcode     |
| `gcode.displayRange.min`   | `Object` | The minimum axis range for the loaded gcode              |
| `gcode.displayRange.min.x` | `String` | The minimum X axis value for the loaded gcode            |
| `gcode.displayRange.min.y` | `String` | The minimum Y axis value for the loaded gcode            |
| `gcode.displayRange.min.z` | `String` | The minimum Z axis value for the loaded gcode            |
| `gcode.displayRange.max`   | `Object` | The maximum axis range for the loaded gcode              |
| `gcode.displayRange.max.x` | `String` | The maximum X axis value for the loaded gcode            |
| `gcode.displayRange.max.y` | `String` | The maximum Y axis value for the loaded gcode            |
| `gcode.displayRange.max.z` | `String` | The maximum Z axis value for the loaded gcode            |
| `gcode.displayRange`       | `Object` | Preformatted dimension information from the loaded gcode |
| `gcode.displayRange.x`     | `String` | Total gcode width along the X axis                       |
| `gcode.displayRange.y`     | `String` | Total gcode depth along the Y axis                       |
| `gcode.displyaRange.z`     | `String` | Total gcode height along the Z axis                      |

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

## Licenses and credits

Several icon sets have been added for convenience

* [carlo -
  streamdeck-iconpack-fluentui-system-icons - MIT](https://github.com/carlo/streamdeck-iconpack-fluentui-system-icons/blob/main/LICENSE.md)
* [carlo - streamdeck-iconpack-system-uicons - MIT](https://github.com/carlo/streamdeck-iconpack-system-uicons/blob/main/LICENSE.md)
* [fontawesome - CC BY 4.0](https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/LICENSE.txt)  
  Alterations: SVG images have been converted to PNG
