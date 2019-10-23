const chalk = require('chalk');

const COLORS = Object.freeze({
  INFO: 'blue',
  SUCCESS: 'green',
  ERROR: 'red',
  WARNING: 'yellow',
  DEFAULT: 'default',
});

class Logger {
  static add(type = 'default', message) {
    const date = new Date();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const logTime = `${hours}:${minutes}:${seconds}`;
    let color = 'default';

    message = `[${logTime}] ${message}`;

    for (const typeColor in COLORS) {
      if (COLORS.hasOwnProperty(typeColor) && typeColor.toLowerCase() === type.toLowerCase()) {color = COLORS[typeColor];}
    }

    Logger.print(color, message);
  }

  static print(color, message) {
    if (typeof chalk[color] === 'function') {console.log(chalk[color](message));}
  }
}

module.exports = Logger;
