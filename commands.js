const fs = require('fs');

module.exports = [
    {
        command: 'load <file>',
        action: function(args, callback) {
            try {
                const name = args.file;
                const gcode = fs.readFileSync(name, 'utf8');
                const context = {};

                callback(null, 'command', 'gcode:load', name, gcode, context, function(err, state) {
                    if (err) {
                        return;
                    }

                    // console.log(state);
                });
            } catch (err) {
                callback(err);
            }
        }
    },
    {
        command: 'unload',
        action: function(args, callback) {
            callback(null, 'command', 'gcode:unload');
        }
    },
    {
        command: 'start',
        action: function(args, callback) {
            callback(null, 'command', 'gcode:start');
        }
    },
    {
        command: 'stop',
        action: function(args, callback) {
            callback(null, 'command', 'gcode:stop');
        }
    },
    {
        command: 'pause',
        action: function(args, callback) {
            callback(null, 'command', 'gcode:pause');
        }
    },
    {
        command: 'resume',
        action: function(args, callback) {
            callback(null, 'command', 'gcode:resume');
        }
    }
];
