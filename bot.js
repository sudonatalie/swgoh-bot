const Discord = require('discord.js');

const bot = new Discord.Client();

bot.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

bot.login(process.env.DISCORD_TOKEN);
