// const MusicQueue = require("C:/vs code/Discord music/Node Music/New Music Bot/structures/MusicQueue");

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
//     track.thumbnail = track.info.thumbnail || null; 
    
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

const MusicQueue = require("C:/vs code/Discord music/Node Music/New Music Bot/structures/MusicQueue");

module.exports = {
  name: "play",
  description: "Play a song from SoundCloud or link",
  execute: async (client, message, args) => {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Provide a song name or link.");

    const voice = message.member.voice.channel;
    if (!voice) return message.reply("❌ Join a voice channel first.");

    const node = client.shoukaku.getIdealNode();
    if (!node) return message.reply("❌ Lavalink not ready yet.");

    const search = query.startsWith("http") ? query : `scsearch:${query}`;
    const res = await node.rest.resolve(search);

    let track;
    switch (res.loadType) {
      case "track":
        track = res.data;
        break;
      case "search":
        track = res.data[0];
        break;
      case "playlist":
        track = res.data.tracks[0];
        break;
      default:
        return message.reply("❌ No results found.");
    }

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

      queue = new MusicQueue(player, message.guild.id, client);
      client.queues.set(message.guild.id, queue);

      
      // ✅ PLAYER EVENTS — SINGLE SOURCE
      player.on("end", (data) => {
        console.log("TRACK END REASON:", data.reason);
        queue.handleTrackEnd(data.reason);
      });

      player.on("exception", () => {
        queue.playing = false;
        queue.play();
      });

      player.on("stuck", () => {
        queue.playing = false;
        queue.play();
      });
    }

    
    queue.add(track);

    if (!queue.playing) {
      await queue.play();
      return message.reply(`🎵 Now playing: **${track.info.title}**`);
    } else {
      return message.reply(`➕ Added to queue: **${track.info.title}**`);
    }
  }
};