const embed = require("../utils/embed");

module.exports = {
  name: "resume",
  description: "Resume paused music",

  async execute(client, message) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || !queue.player) {
      return message.reply({
        embeds: [
          embed.create(client, {
            description: "❌ Nothing is playing."
          })
        ]
      });
    }

    if (!queue.player.paused) {
      return message.reply({
        embeds: [
          embed.create(client, {
            description: "▶️ Music is already playing."
          })
        ]
      });
    }

    await queue.player.setPaused(false);

    return message.reply({
      embeds: [
        embed.create(client, {
          description: "▶️ Music resumed."
        })
      ]
    });
  }
};
