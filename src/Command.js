class Command {
  constructor() {
    this.name = 'unnamed';
    this.description = '';
    this.category = 'default';
    this.args = false;
    this.usage = null;
    this.guildOnly = false;
    this.adminOnly = false;
    this.permissions = [];
    this.cooldown = 3;

    this.subCommands = [];
    this.primaryColor = '#c27c0e';
    this.dangerColor = '#FF0000';
  }

  createSubCommand(subArgs = {}) {
    return this.subCommands.push(Object.assign(new Command(), subArgs));
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  setCategory(category) {
    this.category = category;
    return this;
  }

  setArgs(bool) {
    this.args = bool;
    return this;
  }

  setUsage(usage) {
    this.usage = usage;
    return this;
  }

  setGuildOnly(bool) {
    this.guildOnly = bool;
    return this;
  }

  setAdminOnly(bool) {
    this.adminOnly = bool;
    return this;
  }

  setPermissions(array) {
    this.permissions = array;
    return this;
  }

  setCooldown(seconds) {
    this.cooldown = seconds;
    return this;
  }
}

module.exports = Command;
