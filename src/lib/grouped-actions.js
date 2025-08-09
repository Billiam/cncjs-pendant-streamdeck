export const groupedActions = {
  Navigation: ['navigate', 'setScene', 'swapScene', 'backScene'],
  Jogging: [
    'jog',
    'startSmoothJog',
    'stopSmoothJog',
    'jogDistance',
    'jogSpeed',
  ],
  Interface: ['brightness', 'fullscreen'],
  Overrides: [
    'increaseFeedrate',
    'decreaseFeedrate',
    'toggleFeedrateInterval',
    'resetFeedrate',
    'increaseSpindle',
    'decreaseSpindle',
    'toggleSpindleInterval',
    'resetSpindle',
    'enterSpindleSpeed',
    'setRapids',
  ],
  'User flags': ['setUserFlag', 'clearUserFlag', 'toggleUserFlag'],
  'Numeric input': ['input', 'inputCommand', 'completeInput'],
  Positioning: [
    'absoluteMachinePosition',
    'absoluteWorkPosition',
    'goto',
    'homing',
    'enterPosition',
    'enterWcs',
  ],
  Gcode: [
    'refreshWatchFolder',
    'clearGcode',
    'gcode',
    'macro',
    'outline',
    'loadDetailFile',
    'sortDetails',
  ],
  Utility: ['command'],
  'CNC state': [
    'connect',
    'run',
    'stop',
    'pause',
    'hold',
    'unhold',
    'reset',
    'unlock',
    'stopFeed',
    'startFeed',
  ],
}

export const groupedActionObjects = Object.entries(groupedActions).map(
  ([group, children]) => {
    return { label: group, children }
  },
)
