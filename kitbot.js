const config = require("./config.json")
const mineflayer = require("mineflayer")
const { listenerCount } = require("process");
var prefix = config.prefix
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const mcData = require('minecraft-data')("1.12.2")
const colors = require("colors")
const Discord = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
var tpsPlugin = require('mineflayer-tps')(mineflayer)
const fetch = require('node-fetch')
const roundToHundredth = (value) => {
      return Number(value.toFixed(2));
};
const fs = require("fs");

let options = {
    host: `80.241.218.27`,//TODO replace with 0b0t ip address
    port: 25565,
    username: `${config.email}`,
    password: `${config.password}`,
    version: `1.12.2`
  }
  const bot = mineflayer.createBot(options);
  bindEvents(bot)
  function bindEvents(bot) {

    const client = new Discord.Client({
        disableEveryone: true
    });
    client.commands = new Discord.Collection();
    client.on("ready", () => {
        console.log('Bridge online!'.blue);
        client.user.setActivity(`0b0t.org `,{ type: 'PLAYING'})
    });
//=======================
// Bridge Discord to MC
//=======================
    client.on('message', msg => {
        if (msg.channel.id != config.bridgeID) return;
        if (msg.author.bot) return;
        if (msg.content.startsWith('/')) {
          bot.chat(`${msg}`)
          let embed = new Discord.MessageEmbed().setAuthor('Run Command').setTimestamp().setDescription(`Sent Command: _${msg}_`);
          msg.channel.send(embed)
          return}
        let content = msg.content.toString();
        bot.chat(": [" + msg.author.tag+ "] " + content)
      });
//======================
// Bridge Mc to Discord
//======================
    bot.on("chat", (username,message) => {
        if (!message) return
        if (message.includes('@everyone')) return;
        if (message.includes('@here')) return;
        if (!bot.players[username]) {
          let embed = new Discord.MessageEmbed()
          .setDescription(`${message}`)
          .setColor('0x30f2cb')
          .setTimestamp()
          .setAuthor(`SERVER`)
          client.channels.cache.get(config.bridgeID).send(embed)
          return
        }
      if (username==bot.username) {
        let embed = new Discord.MessageEmbed()
        .setDescription(`${message}`)
        .setColor('0x30f2cb')
        .setTimestamp()
        .setAuthor(username, `https://mc-heads.net/avatar/${bot.player.uuid}/512`)
        client.channels.cache.get(config.bridgeID).send(embed)
        return
      }
      if (!bot.players[username]) return
      originalString = bot.players[username].uuid; 
      newString = originalString.replace('-', '');
      let embed = new Discord.MessageEmbed()
      .setDescription(`${message}`)
      .setColor('0xa69f9f')
      .setTimestamp()
      .setAuthor(username, `https://mc-heads.net/avatar/${newString}/512`)
      client.channels.cache.get(config.bridgeID).send(embed)
    })
//==================
// Whisper Function
//==================
    bot.on('whisper', (username, message) =>{
      if (!bot.players[username]) return
      originalString = bot.players[username].uuid; 
      newString = originalString.replace('-', '');
      let embed = new Discord.MessageEmbed()
      .setDescription(`${message}`)
      .setColor('0xa61987')
      .setAuthor(username+"whispered:", `https://mc-heads.net/avatar/${newString}/512`)
      client.channels.cache.get(config.bridgeID).send(embed)
    })
    client.login(config.token)
//=================
// Console Login
//=================
bot.once("login", () => {
    setTimeout(() => {
        console.log(`──────────────────────────────────────────`.blue);
    }, 0);
    setTimeout(() => {
        console.log((`Logged in as: `.green + `${bot.username}`.yellow));
    }, 1);
    setTimeout(() => {
        console.log((`Server: `.green + `${options.host}`.yellow));
    }, 2);
    setTimeout(() => {
        console.log((`Port: `.green + `${options.port}`.yellow));
    }, 3);
    setTimeout(() => {
        console.log(`──────────────────────────────────────────`.blue);
    }, 4);
});

//=================
// Auto Relog
//=================
bot.on('error', function (err) {
  console.log('Error attempting to reconnect: ' + err.errno + '.');
  if (err.code == undefined) {
      console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
      console.log('Will retry to connect in 30 seconds. ');
      setTimeout(relog, 30000);
  }
})
bot.on('kicked', function (reason) {
    console.log(`Bot kicked for ${reason}`.red)
    setTimeout(relog, 30000);
});
bot.on('error', (err) => {
  console.error(err);
}) 
function relog() {
    client.destroy();
    console.log("Attempting to reconnect...");
    bot = mineflayer.createBot(options);
    bindEvents(bot);
    client.login(config.token)
}
//================
// Chat Patterns
//================

bot.chatAddPattern(/^Teleported to ([a-zA-Z0-9_]{3,16})!$/, "tpaccepted", "tpa accepted");
bot.chatAddPattern(/^([a-zA-Z0-9_]{3,16}) wants to teleport to you\.$/, "tpRequest", "tpa request");
//=======================
// Tpa to bot
//=======================

bot.on('tpRequest', function (username) {
  if (array2.includes(username)) {
    return (
    bot.chat(`/msg ${username} Auto Accepting..`),
    bot.chat(`/tpy ${username}`)
    )
  } else return (bot.chat(`/msg ${username} You are not on the whitelist!`))
});
//=======================
// UUID Function
//=======================
function uuid(username, callback) {
  const dash = require("add-dashes-to-uuid")
  var MojangAPI = require('mojang-api');
  var date = new Date();
  MojangAPI.uuidAt(username, date, function(err, res) {
      if (err)
          console.log(err);
      else
          var dashuuid = dash(res.id)
          callback(dashuuid)
  })
}

//=====================
// Log function
//=====================
function log(msg, color, user) {
  if (bot.players[user].uuid != undefined) {
  originalString = bot.players[user].uuid; 
  newString = originalString.replace('-', '');
  let embed = new Discord.MessageEmbed()
  .setDescription(msg)
  .setColor(color)
  .setTimestamp()
  .setAuthor(user, `https://mc-heads.net/avatar/${newString}/512`)
  client.channels.cache.get(config.logsID).send(embed)
  }
}

//==========================
// Chat Commands
//==========================
bot.on('chat', (username, message) => {
  const args = message.split(' ')
  const cmd = message.split(' ')[0]
//=================
// Help Command
//=================
if (cmd === `${prefix}help`) {
      bot.chat(`: ${username}, https://mrfast-js.github.io/`)
      log(`${prefix}help was used.`, 0xFFA500, username)
  }
//=================
// Kits Command
//=================
if (cmd === `${prefix}kits`) {
  bot.chat(`: ${username}, Current kits are: wtf, redstone, arik, teeleel, gspot, fix, gnome.`)
  log(`${prefix}kits was used.`, 0xFFA500, username)
}
//=================
// Kill Command
//=================
if (cmd === `${prefix}kill`) {
  if (array.includes(username)) {
      bot.chat(`/kill`)
      log(`${prefix}kill was used.`, 0xFF4500, username)
  }}
//=================
// tps Command
//=================
if (cmd === `${prefix}tps`) {
  bot.chat(`: Current tps: ${bot.getTps()}.`)
}
//=================
// tps Command
//=================
if (cmd === `${prefix}sex`) {
  if (!args[1]) return bot.chat(': You didnt specify a player')
  bot.chat(`: ${username} just sexxed ${args[1]}!`)
}
//=================
// 2bqueue Command
//=================
if (cmd ===`${prefix}2bqueue`) {
  let queuefetch = fetch('https://2b2t.io/api/queue?last=true')
  .then(res => res.json()).then(res => bot.chat(`: 2b2t queue: ${res[0][1]}.`))
  let prioqueuefetch = fetch('https://2b2t.io/api/prioqueue?last=true')
  .then(res => res.json()).then(res => bot.chat(`: 2b2t prioq: ${res[0][1]}.`))
}
//=================
// Ping Command
//=================s
if (cmd === `${prefix}ping`) {
  if (!args[1]) {
    if (!bot.players[username]) return;
  if (bot.players[username].ping == '0') return bot.chat(': '+username +`'s ping hasnt been calculated by the server yet.`)
  bot.chat(`: ${username}'s ping is ${bot.players[username].ping}ms`)
  log(`${prefix}ping was used.`, 0xFFA500, username)
  } else {
    if (!bot.players[args[1]]) return bot.chat(': Player not found!')
    if (bot.players[args[1]].ping == '0') return bot.chat(': '+args[1] +`'s ping hasnt been calculated by the server yet.`)
    bot.chat(`: ${args[1]}'s ping is ${bot.players[args[1]].ping}ms`)
    log(`${prefix}ping was used on ${args[1]}.`, 0xFFA500, username)
  }
}
//=================
// KDR Command
//=================
if (message.startsWith(`${prefix}kd`)) {
      if (args[1]) {
        uuid(args[1], function(uuid) {
        if (!bot.players[args[1]]) return bot.chat(': Player not found!')
        let serverinfo = fetch(`https://api.moobot.dev/data/0b0t/kd/${uuid}`)
        .then(res => res.json()).then(res => bot.chat(`: ${args[1]}: Kills ${res['kills']} , Deaths ${res['deaths']}, KDR: ${roundToHundredth(res['kills']/res['deaths'])}`))
        log(`${prefix}kd was used on ${args[1]}.`, 0xFFA500, username)
        })
      } else {
        if (!bot.players[username]) return bot.chat(': Player not found!')
      let serverinfo = fetch(`https://api.moobot.dev/data/0b0t/kd/${bot.players[username].uuid}`)
      .then(res => res.json()).then(res => bot.chat(`: ${username}: Kills ${res['kills']} , Deaths ${res['deaths']}, KDR: ${roundToHundredth(res['kills']/res['deaths'])}`))
      log(`${prefix}kd was used.`, 0xFFA500, username)
      }
    }
})
//============================
// Kit Grabber
//============================
bot.loadPlugin(pathfinder)
let array = ["Cody4687", "MrFast_", "Amrit1", "dirt10", "0bOp"] // Kit Access
let array2 = ["Cody4687", "MrFast_", "Amrit1", "dirt10"]// TP Access
const defaultMove = new Movements(bot, mcData)
bot.on('chat', function(username, message) {
    const cmd = message.split(' ')[0]
    const args = message.split(' ')
if (cmd === `${prefix}end`) {
    if (array.includes(username)) {
        return bot.end()
    } else return;
}
//=================
// Kit WTF
//=================
if (message.startsWith(`${prefix}kit wtf`)){
  console.log("recognized kit wtf cmd")
 if (array.includes(username)) {
   bot.chat(': Grabbing wtf kit...')
     console.log("array included username")
     const x = parseFloat(`420`, 10)
     const z = parseFloat(`69`, 10)
     p = username
     bot.pathfinder.setMovements(defaultMove)
     bot.pathfinder.setGoal(new GoalXZ(x, z))
     console.log("Navigating")
}
}
//=================
// Kit Redstone
//=================
if (message.startsWith(`${prefix}kit redstone`)){
  console.log("recognized kit redstone cmd")
 if (array.includes(username)) {
  bot.chat(': Grabbing redstone kit...')
     console.log("array included username")
     const x = parseFloat(`420`, 10)
     const z = parseFloat(`69`, 10)
     p = username
     bot.pathfinder.setMovements(defaultMove)
     bot.pathfinder.setGoal(new GoalXZ(x, z))
     console.log("Navigating")
}
}
//=================
// Kit Arik
//=================
 if (message.startsWith(`${prefix}kit arik`)){
     console.log("recognized kit arik cmd")
    if (array.includes(username)) {
      bot.chat(': Grabbing arik kit...')
        console.log("array included username")
        const x = parseFloat(`420`, 10)
        const z = parseFloat(`69`, 10)
        p = username
        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalXZ(x, z))
        console.log("Navigating")
}
}
//=================
// Kit teelee1
//=================
if (message.startsWith(`${prefix}kit teeleel`)){
    console.log("recognized kit teeleel cmd")
   if (array.includes(username)) {
    bot.chat(': Grabbing teelee1 kit...')
       console.log("array included username")
       const x = parseFloat(`420`, 10)
       const z = parseFloat(`69`, 10)
       p = username
       bot.pathfinder.setMovements(defaultMove)
       bot.pathfinder.setGoal(new GoalXZ(x, z))
       console.log("Navigating")
}
}
//=================
// Kit gspot
//=================
if (message.startsWith(`${prefix}kit gspot`)){
    console.log("recognized kit gspot cmd")
   if (array.includes(username)) {
    bot.chat(': Grabbing gspot kit...')
       console.log("array included username")
       const x = parseFloat(`420`, 10)
       const z = parseFloat(`69`, 10)
       p = username
       bot.pathfinder.setMovements(defaultMove)
       bot.pathfinder.setGoal(new GoalXZ(x, z))
       console.log("Navigating")
}
}
//=================
// Kit fix
//=================
if (message.startsWith(`${prefix}kit fix`)){
    console.log("recognized kit fix cmd")
   if (array.includes(username)) {
    bot.chat(': Grabbing fix kit...')
       console.log("array included username")
       const x = parseFloat(`420`, 10)
       const z = parseFloat(`69`, 10)
       p = username
       bot.pathfinder.setMovements(defaultMove)
       bot.pathfinder.setGoal(new GoalXZ(x, z))
       console.log("Navigating")
}
}
//=================
// Kit gnome
//=================
if (message.startsWith(`${prefix}kit gnome`)){
    console.log("recognized kit gnome cmd")
   if (array.includes(username)) {
    bot.chat(': Grabbing gnome kit...')
       console.log("array included username")
       const x = parseFloat(`420`, 10)
       const z = parseFloat(`69`, 10)
       p = username
       bot.pathfinder.setMovements(defaultMove)
       bot.pathfinder.setGoal(new GoalXZ(x, z))
       console.log("Navigating")
      }
    }
})
//=================
// Tpa Event
//=================
let p = ""
bot.on('goal_reached', () => {
    bot.chat(`/tpa ${p}`)
    bot.pathfinder.setGoal(null)
})

//=================
// Kill on tp
//=================
let kitstaken = 0;
bot.on('tpaccepted', function (username) {
    setTimeout(() => {
    bot.chat(`/kill`)
    console.log("bot /killed")
    originalString = bot.players[username].uuid; 
    newString = originalString.replace('-', '');
    kitstaken = kitstaken+1
    let embed = new Discord.MessageEmbed()
    .setDescription(`Gave a kit to ${username}.`)
    .setColor('0xEFFF00')
    .setTimestamp()
    .setAuthor(username, `https://mc-heads.net/avatar/${newString}/512`)
    client.channels.cache.get(config.logsID).send(embed)
  }, 500)
})
//==============================
// Discord Commands
//==============================
bot.loadPlugin(tpsPlugin) 
client.on("message", msg => {
 if (msg.content.startsWith('!info')) { /*Info Command*/
      let embed = new Discord.MessageEmbed()
      .addField(`Bot Info`,`Username: ${bot.username}\nUptime: ${prettyMilliseconds(client.uptime)}\nKits Taken: ${kitstaken}`, true)
      .setTimestamp()
      .addField('Server Info',`IP: ${options.host}\nPort: ${options.port}\nPing: ${bot.players[bot.username].ping}\nTPS: ${bot.getTps()}`, true)
      msg.channel.send(embed)
    }
})

}
