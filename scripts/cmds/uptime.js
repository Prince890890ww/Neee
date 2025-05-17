module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.0",
    author: "VEX_ADNAN",
    role: 0,
    shortDescription: {
      en: "Displays the uptime of the bot."
    },
    longDescription: {
      en: "Displays the amount of time that the bot has been running for."
    },
    category: "System",
    guide: {
      en: "Use {p}uptime to display the uptime of the bot."
    }
  },
  onStart: async function ({ api, event, args }) {
    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));
    const uptimeString = `\n\nl ꙰ → ${hours} ʜᴏᴜʀs\n\nl ꙰ → ${minutes} ᴍɪɴᴜᴛᴇs\n\nl ꙰ → ${seconds} sᴇᴄᴏɴᴅ\n\n✧─────────────────✧`;
    api.sendMessage(`✧─────────────────✧\n\n💥 ʜᴇʟʟᴏ ᴍᴇɪsᴛᴇʀ, ᴛʜᴇ ʙᴏᴛ ʜᴀs ʙᴇᴇɴ ʀᴜɴɴɪɴɢ ғᴏʀ ↓\n↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ ${uptimeString}`, event.threadID);
  }
};
