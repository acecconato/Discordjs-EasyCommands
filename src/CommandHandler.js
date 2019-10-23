const fsPromises = require('fs').promises;
const Path = require('path');

const Discord = require('discord.js');
const Parser = require('discord-command-parser');
const Logger = require('./Logger');

class CommandHandler {
  constructor() {
    this.commands = new Discord.Collection();
    this.cooldowns = new Discord.Collection();
  }

  getCommands() {
    return this.commands;
  }

  getCommandByName(commandName) {
    return this.commands[commandName];
  }

  async init(commandsPath, client) {
    Logger.add('info', 'Loading commands');
    await this.loadCommandsFromPath(commandsPath);
    this.client = client;
    return Promise.resolve();
  }

  async loadCommandsFromPath(path) {
    const finalPath = Path.resolve(path);
    const commandFiles = await fsPromises.readdir(finalPath);

    await Promise.all(commandFiles.map(async (file) => {
      const stats = await fsPromises.stat(`${finalPath}/${file}`);

      if (stats.isDirectory()) {
        await this.loadCommandsFromPath(`${finalPath}/${file}`);
        return;
      }

      if (!file.match(/^[\w]+Command.(js|mjs)$/)) { return; }

      const command = require(`${finalPath}/${file}`);
      this.commands.set(command.name, command);

      if (command.subCommands && command.subCommands.length > 0) {
        command.subCommands.forEach((subCommand) => {
          subCommand.isSubCommand = true;
          this.commands.set(`${command.name} ${subCommand.name}`, subCommand);
        });
      }

      Logger.add('info', `${file.replace('Command.js', '')} command loaded`);
    }));

    global.COMMANDS = this.commands;
    return Promise.resolve();
  }


  preExecute(message, prefix, callback) {
    const parsed = Parser.parse(message, prefix);
    const args = parsed.arguments;
    const commandName = parsed.command;
    let command = null; let subCommand = null;

    if (!parsed.success) {
      return;
    }

    // Prevents a command from executing instead of a subcommand.
    if (args && args.length > 0) {
      subCommand = `${commandName} ${args[0]}`;
    }

    if (subCommand && this.commands.has(subCommand)) {
      command = this.commands.get(subCommand);
      args.shift();
    } else if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else {
      return;
    }


    // Check the command is guild only or can be sent in DMs
    if (command.guildOnly && message.channel.type !== 'text') {
      message.reply('I can\'t execute that command inside DMs!');
      return;
    }

    // Check if the user has sufficient permissions to use the command
    if (command.permissions && command.permissions.length > 0) {
      command.permissions.forEach((permission) => {
        if (!message.member.hasPermission(permission)) {
          message.reply('you don\'t have permission to do this.');
        }
      });
    }

    // Cooldowns check (antispam protection)
    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        message.reply(`you need to wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        return;
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    callback(command, args);
  }
}

module.exports = CommandHandler;
