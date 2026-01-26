const embed = require("../utils/embed");

module.exports = {
  name: "pause",
  description: "Pause the currently playing song",

  async execute(client, message) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || !queue.player) {
      return message.reply({
        embeds: [
          embed.create(client, {
            description: "❌ Nothing is playing right now."
          })
        ]
      });
    }

    if (queue.player.paused) {
      return message.reply({
        embeds: [
          embed.create(client, {
            description: "⏸ Music is already paused."
          })
        ]
      });
    }

    await queue.player.setPaused(true);

    return message.reply({
      embeds: [
        embed.create(client, {
          description: "⏸ Music paused."
        })
      ]
    });
  }
};
