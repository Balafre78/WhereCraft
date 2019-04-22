const { Client, RichEmbed } = require('discord.js');
const bot = new Client({ disableEveryone: true })

bot.login(process.env.TOKEN);


// Configuration & Settings
const yourID = "413334310561513472"; //Instructions on how to get this: https://redd.it/40zgse
const setupCMD = "!createrolemessage"
const initialMessage = `**React to the messages below to receive the associated role. If you would like to remove the role, simply remove your reaction!**`;
const embedMessage = " Si vous etes en accord sur le reglement veuillez ajouter la réaction 🍏 " ;
const embedFooter = "Role Reactions"; // Must set this if "embed" is set to true


const roles = ["J'accepte les règles", "Confirmation"];
const reactions = [ "🍏", "✅"];
const embed = true; // Set to "true" if you want all roles to be in a single embed
const embedColor = "#dd2423"; // Set the embed color if the "embed" variable is set to true


// If there isn't a reaction for every role, scold the user!
if (roles.length !== reactions.length) throw "Roles list and reactions list are not the same length!";

// Function to generate the role messages, based on your settings
function generateMessages() {
    let messages = [];
    for (let role of roles) messages.push(`React below to get the **"${role}"** role!`); //DONT CHANGE THIS
    return messages;
}

// Function to generate the embed fields, based on your settings and if you set "const embed = true;"
function generateEmbedFields() {
    return roles.map((r, e) => {
        return {
            emoji: reactions[e],
            role: r
        };
    });
}

// Client events to let you know if the bot is online and to handle any Discord.js errors
bot.on("ready", () => console.log("Bot is online!"));
bot.on('error', console.error);

// Handles the creation of the role reactions. Will either send the role messages separately or in an embed
bot.on("message", message => {
    if (message.author.id == yourID && message.content.toLowerCase() == setupCMD) {

        if (!embed) {
            message.channel.send(initialMessage);

            const toSend = generateMessages();
            toSend.forEach((role, react) => {
                message.channel.send(role).then(m => {
                    m.react(reactions[react]);
                });
            });
        } else {
            const roleEmbed = new RichEmbed()
                .setDescription(embedMessage)
                .setFooter(embedFooter);

            if (embedColor) roleEmbed.setColor(embedColor);

            const fields = generateEmbedFields();
            for (const f of fields) roleEmbed.addField(f.emoji, f.role, true);

            message.channel.send(roleEmbed).then(async m => {
                for (let r of reactions) await m.react(r);
            });
        }
    }
});

// This makes the events used a bit more readable
const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

// This event handles adding/removing users from the role(s) they chose
bot.on('raw', async event => {

    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = bot.users.get(data.user_id);
    const channel = bot.channels.get(data.channel_id);

    const message = await channel.fetchMessage(data.message_id);
    const member = message.guild.members.get(user.id);

    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);

    let embedFooterText;
    if (message.embeds[0]) embedFooterText = message.embeds[0].footer.text;

    if (message.author.id === bot.user.id && (message.content !== initialMessage || (message.embeds[0] && (embedFooterText !== embedFooter)))) {

        if (!embed) {
            const re = `\\*\\*"(.+)?(?="\\*\\*)`;
            const role = message.content.match(re)[1];

            if (member.id !== bot.user.id) {
                const roleObj = message.guild.roles.find(r => r.name === role);

                if (event.t === "MESSAGE_REACTION_ADD") {
                    member.addRole(roleObj.id);
                } else {
                    member.removeRole(roleObj.id);
                }
            }
        } else {
            const fields = message.embeds[0].fields;

            for (let i = 0; i < fields.length; i++) {
                if (member.id !== bot.user.id) {
                    const role = message.guild.roles.find(r => r.name === fields[i].value);

                    if (fields[i].name === reaction.emoji.name) {
                        if (event.t === "MESSAGE_REACTION_ADD") {
                            member.removeRole(role.id);
                            break;
                        } else {
                            member.addRole(role.id);
                            break;
                        }
                    }
                }
            }
        }
    }
});

bot.on('message', function (message) {
    if (message.content === '!help') {
        message.channel.send(' Les Commandes sont disponibles avec le préfix **!** : ')
        message.channel.send(' **site**, **shop**, **regle**, **cgv** ')
            
    }
 })

bot.on('message', function (message) {
    if (message.content === '!cgv') {
        message.channel.send('https://wherecraft.eu/p/cgu-cgv')
    }
 })


bot.on('message', function (message) {
    if (message.content === '!numberplayer') {
        message.channel.send( 'Il y a ' + message.guild.memberCount + ' joueurs sur le serveur Discord ;)')
    }
 })

 bot.on('ready', function () {
    bot.user.setActivity('Commande : !help').catch(console.error)
 })

 bot.on('guildMemberAdd', function (member) {
    member.createDM().then(function (channel) {
        return channel.send('Bienvenue dans la secte de **WhereCraft** ! Bienvenue parmis nous ' + member.displayName )
 
    }).catch(console.error)
 })

bot.on('guildMemberRemove', member => {
   member.guild.channels.get('146281705949364224').send(' En Revoir ' + member.user + ' en dehors de la Secte.' );
})

bot.on('message', function (message) {
    if (message.content === '!site') {
        message.channel.send('https://www.wherecraft.eu')
    }
 })

bot.on('message', function (message) {
    if (message.content === '!shop') {
        message.channel.send('https://www.wherecraft.eu/shop')
    }
 })

bot.on('message', function (message) {
    if (message.content === '!regle') {
        message.channel.send('https://www.wherecraft.eu/p/regles')
    }
 })

 bot.on('guildMemberAdd', member => {
    member.guild.channels.get('540621591479058445').send(' Bienvenue ' + member.user + ' dans la Secte. ')
    member.guild.channels.get('540621591479058445').send('Nous sommes désormais ' + member.guild.memberCount );
    member.addRole('540179472872374272')
 })
