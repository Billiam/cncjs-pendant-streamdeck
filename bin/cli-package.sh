#!/usr/bin/env bash
IFS=
CLI_PATH="$(dirname "$0")/../dist/cli/cli.js"
echo "$(echo "#!/usr/bin/env node" | cat - $CLI_PATH)" > $CLI_PATH
chmod u+x "$CLI_PATH"
