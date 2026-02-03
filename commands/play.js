// // const MusicQueue = require("C:/vs code/Discord music/Node Music/New Music Bot/structures/MusicQueue");

// // module.exports = {
// //   name: "play",
// //   description: "Play a song from SoundCloud or link",
// //   execute: async (client, message, args) => {
// //     const query = args.join(" ");
// //     if (!query) return message.reply("❌ Provide a song name or link.");

// //     const voice = message.member.voice.channel;
// //     if (!voice) return message.reply("❌ Join a voice channel first.");

// //     const node = client.shoukaku.getIdealNode();
// //     if (!node) return message.reply("❌ Lavalink not ready yet.");

// //     const search = query.startsWith("http") ? query : `scsearch:${query}`;
// //     const res = await node.rest.resolve(search);

// //     let track;
// //     switch (res.loadType) {
// //       case "track":
// //         track = res.data;
// //         break;
// //       case "search":
// //         track = res.data[0];
// //         break;
// //       case "playlist":
// //         track = res.data.tracks[0];
// //         break;
// //       default:
// //         return message.reply("❌ No results found.");
// //     }

// //     track.requester = {
// //       id: message.author.id,
// //       tag: message.author.tag,
// //       avatar: message.author.displayAvatarURL()
// //     };
// //     track.thumbnail = track.info.thumbnail || null; 
    
// //     let queue = client.queues.get(message.guild.id);

// //     if (!queue) {
// //       const player = await client.shoukaku.joinVoiceChannel({
// //         guildId: message.guild.id,
// //         channelId: voice.id,
// //         shardId: message.guild.shardId
// //       });

// //       queue = new MusicQueue(player, message.guild.id, client);
// //       client.queues.set(message.guild.id, queue);

// //       // ✅ PLAYER EVENTS — SINGLE SOURCE
// //       player.on("end", (data) => {
// //         console.log("TRACK END REASON:", data.reason);
// //         queue.handleTrackEnd(data.reason);
// //       });

// //       player.on("exception", () => {
// //         queue.playing = false;
// //         queue.play();
// //       });

// //       player.on("stuck", () => {
// //         queue.playing = false;
// //         queue.play();
// //       });
// //     }

// //     queue.add(track);

// //     if (!queue.playing) {
// //       await queue.play();
// //       return message.reply(`🎵 Now playing: **${track.info.title}**`);
// //     } else {
// //       return message.reply(`➕ Added to queue: **${track.info.title}**`);
// //     }
// //   }
// // };




const { aliases } = require("./disconnect");
const MusicQueue = require("C:/vs code/Discord music/Node Music/New Music Bot/structures/MusicQueue");

// module.exports = {
//   name: "play",
//   description: "Play a song from SoundCloud or link",
//   execute: async (client, message, args) => {
//     const query = args.join(" ");
//     if (!query) return message.reply("❌ Provide a song name or link.");

//     const voice = message.member.voice.channel;
//     if (!voice) return message.reply("❌ Join a voice channel first.");

//     const node = client.shoukaku.getIdealNode();
//     if (!node) return message.reply("❌ Lavalink not ready yet.");

//     const search = query.startsWith("http") ? query : `scsearch:${query}`;
//     const res = await node.rest.resolve(search);

//     let track;
//     switch (res.loadType) {
//       case "track":
//         track = res.data;
//         break;
//       case "search":
//         track = res.data[0];
//         break;
//       case "playlist":
//         track = res.data.tracks[0];
//         break;
//       default:
//         return message.reply("❌ No results found.");
//     }

//     track.requester = {
//       id: message.author.id,
//       tag: message.author.tag,
//       avatar: message.author.displayAvatarURL()
//     };

//     let queue = client.queues.get(message.guild.id);

//     if (!queue) {
//       const player = await client.shoukaku.joinVoiceChannel({
//         guildId: message.guild.id,
//         channelId: voice.id,
//         shardId: message.guild.shardId
//       });

//       queue = new MusicQueue(player, message.guild.id, client);
//       client.queues.set(message.guild.id, queue);

      
//       // ✅ PLAYER EVENTS — SINGLE SOURCE
//       player.on("end", (data) => {
//         console.log("TRACK END REASON:", data.reason);
//         queue.handleTrackEnd(data.reason);
//       });

//       player.on("exception", () => {
//         queue.playing = false;
//         queue.play();
//       });

//       player.on("stuck", () => {
//         queue.playing = false;
//         queue.play();
//       });
//     }

    
//     queue.add(track);

//     if (!queue.playing) {
//       await queue.play();
//       return message.reply(`🎵 Now playing: **${track.info.title}**`);
//     } else {
//       return message.reply(`➕ Added to queue: **${track.info.title}**`);
//     }
//   }
// };









const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Search and select a song to play",
  execute: async (client, message, args) => {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Provide a song name or link.");

    const voice = message.member.voice.channel;
    if (!voice) return message.reply("❌ Join a voice channel first.");

    const node = client.shoukaku.getIdealNode();
    if (!node) return message.reply("❌ Lavalink not ready yet.");

    const isLink = query.startsWith("http");
    const search = isLink ? query : `ytsearch:${query}`;
    const res = await node.rest.resolve(search);

    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
      return message.reply("❌ No results found.");
    }

    let track;

    // --- SELECTION LOGIC ---
    if (!isLink && res.loadType === "search") {
      const results = res.data.slice(0, 5); // Get top 5 results
      
      const description = results.map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri}) - \`${formatDuration(t.info.length)}\``).join('\n');

      const selectionEmbed = new EmbedBuilder()
        .setTitle("🔎 Select a track")
        .setDescription(description)
        .setColor("#5865F2")
        .setFooter({ text: "Selection expires in 30 seconds" });

      const row = new ActionRowBuilder().addComponents(
        results.map((_, i) => 
          new ButtonBuilder()
            .setCustomId(`select_${i}`)
            .setLabel(`${i + 1}`)
            .setStyle(ButtonStyle.Primary)
        )
      );

      const filterMsg = await message.channel.send({ embeds: [selectionEmbed], components: [row] });

      try {
        const collector = await filterMsg.awaitMessageComponent({
          filter: (i) => i.user.id === message.author.id,
          componentType: ComponentType.Button,
          time: 30000
        });

        const index = parseInt(collector.customId.split('_')[1]);
        track = results[index];
        await collector.update({ content: `✅ Selected: **${track.info.title}**`, embeds: [], components: [] });
      } catch (e) {
        return filterMsg.edit({ content: "❌ Selection timed out.", embeds: [], components: [] });
      }
    } else {
      // If it's a direct link or a playlist, just grab the first/only track
      track = res.loadType === "playlist" ? res.data.tracks[0] : res.data;
    }

    // --- ADDING TO QUEUE (Your existing logic) ---
    track.requester = {
      id: message.author.id,
      tag: message.author.tag,
      avatar: message.author.displayAvatarURL()
    };

    let queue = client.queues.get(message.guild.id);
    if (!queue) {
      const player = await client.shoukaku.joinVoiceChannel({
        guildId: message.guild.id,
        channelId: voice.id,
        shardId: message.guild.shardId
      });
      queue = new MusicQueue(player, message.guild.id, client, message.channel.id);
      client.queues.set(message.guild.id, queue);

      player.on("end", (data) => queue.handleTrackEnd(data.reason));
      player.on("exception", () => { queue.playing = false; queue.play(); });
      player.on("stuck", () => { queue.playing = false; queue.play(); });
    }

    queue.add(track);

    const playEmbed = new EmbedBuilder()
      .setAuthor({ name: queue.playing ? '| Added to Queue' : '| Now Playing', iconURL: track.requester.avatar })
      .setThumbnail(track.info.artworkUrl || track.info.thumbnail || null)
      .setColor('#1DB954')
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
        { name: 'Author', value: track.info.author, inline: true },
        { name: 'Duration', value: `\`${formatDuration(track.info.length)}\``, inline: true }
      );

      if (queue.playing) {
        // Only send this if something is already playing
        const addEmbed = new EmbedBuilder()
            .setAuthor({ name: '➕ Added to Queue', iconURL: track.requester.avatar })
            .setDescription(`[${track.info.title}](${track.info.uri})`)
            .setThumbnail(track.info.artworkUrl || track.info.thumbnail || null)
            .setColor('#FEE75C')
            .setFooter({ text: `Position in queue: ${queue.tracks.length - 1}` });
            
            return message.channel.send({ embeds: [addEmbed] });
          } else {
        // If nothing is playing, just start the queue. 
        // The "Now Playing" embed will come from the MusicQueue.js play() method.
        await queue.play();
      }
      if (!queue.playing) {
        await queue.play();
      }
      
    return message.channel.send({ embeds: [playEmbed] });
  }
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}