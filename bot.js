const Discord = require('discord.js');
const ApiSwgohHelp = require('api-swgoh-help');

const bot = new Discord.Client();
const swapi = new ApiSwgohHelp({
    "username":"test",
    "password":"test",
    "client_id":"test",
    "client_secret":"secret"
});

let subscriber = null;
let allyCode = null;
let maxRank = null;

let intervalId = null;

bot.on('message', message => {
  // Only respond to DMs
  if (message.channel.type != 'dm') return;

  // Parse commands and arguments
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  // !subscribe
  if (command === 'subscribe') {
    if (args.length !== 2) {
      message.author.send('Try: !subscribe allyCode maximumRank');
      return;
    }

    subscriber = message.author;
    allyCode = args[0];
    maxRank = args[1];

    (async () => {
      let { result, error, warning} = await swapi.fetchPlayer({ "allyCode": allyCode });
      let name = result[0].name;

      subscriber.send(`I'll let you know when ${name} drops below rank ${maxRank}.`);

      let interval = 5 * 60 * 1000; // 5 minutes
      intervalId = setInterval(async () => {
        let { result, error, warning} = await swapi.fetchPlayer({ "allyCode": allyCode });
        let name = result[0].name;
        let rank = result[0].arena.char.rank;

        if (rank > maxRank) {
          subscriber.send(`ALERT: ${name} is rank ${rank}!`);
        }
      }, interval);
    })();
  }

  // !unsubscribe
  else if (command === 'unsubscribe') {
    if (subscriber === null) {
      message.author.send('You must subscribe first.');
      return;
    }

    let unsubscriber = subscriber;
    subscriber = null;

    clearInterval(intervalId);

    message.author.send(`${unsubscriber} has been unsubscribed.`);
  }

  // !status
  else if (command === 'status') {
    if (subscriber === null) {
      message.author.send('You must subscribe first.');
      return;
    }

    (async () => {
      let { result, error, warning} = await swapi.fetchPlayer({ "allyCode": allyCode });
      let name = result[0].name;
      let rank = result[0].arena.char.rank;

      subscriber.send(`${name}'s current rank is ${rank}. I'll let you know when it drops below ${maxRank}.`);
    })();
  }

  // !help
  else if (command === 'help') {
    message.author.send('Try: !subscribe or !status');
  }

  else {
    message.author.send(`${command} is not a valid command.\nTry: !subscribe or !status`);
  }

});

bot.login(process.env.DISCORD_TOKEN);
