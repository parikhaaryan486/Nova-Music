const embed = require("../utils/embed");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  description: "Set or show current music volume",

  async execute(client, message, args) {
    const queue = client.queues.get(message.guild.id);

    if (!queue || !queue.player) {
      return message.reply({
        embeds: [embed.create(client, { description: "❌ Nothing is playing." })]
      });
    }

    // 1️⃣ Show current volume if no argument
    if (!args[0]) {
      return message.reply({
        embeds: [embed.create(client, {
          description: `🔊 Current volume is **${queue.volume}%**`
        })]
      });
    }

    // 2️⃣ Parse and validate input
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 200) {
      return message.reply({
        embeds: [embed.create(client, {
          description: "❌ Volume must be between 0 and 200."
        })]
      });
    }

    // 3️⃣ Set volume safely
    const success = await queue.setVolume(Math.min(vol, 100)); // Lavalink max 100
    if (success) {
      return message.reply({
        embeds: [embed.create(client, {
          description: `🔊 Volume set to **${vol}%** (Lavalink max 100%)`
        })]
      });
    } else {
      return message.reply({
        embeds: [embed.create(client, {
          description: "❌ Failed to set volume."
        })]
      });
    }
  }
};
