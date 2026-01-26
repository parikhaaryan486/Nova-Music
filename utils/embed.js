const { EmbedBuilder } = require("discord.js");

module.exports = {
  create(client, options = {}) {
    return new EmbedBuilder()
      .setColor(client.config.embedColor || "#2f3136")
      .setDescription(options.description || null)
      .setTitle(options.title || null)
      .setFooter(
        options.footer
          ? { text: options.footer }
          : null
      )
      .setTimestamp();
  }
};
