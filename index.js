const Command = require('./src/Command');
const CommandHandler = require('./src/CommandHandler');
const Logger = require('./src/Logger');

module.exports = {
  CommandHandler: new CommandHandler(),
  Logger,
  Command,
};
