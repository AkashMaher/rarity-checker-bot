const { Client,Collection,Events , ButtonBuilder, ModalBuilder, TextInputBuilder, ButtonStyle, ActionRowBuilder, TextInputStyle, GatewayIntentBits,WebhookClient,PermissionsBitField,InteractionType , CommandInteraction, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('dotenv').config({ path: '.env' })
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const token = process.env['token']
const keepAlive = require("./server.js");
const {clientId,guildId,OwnerId} = require('./config.json');

const {setConfig, getConfig} = require("./src/db.js")
const {rarityEmbed} = require("./src/rarity.js")
const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient; 
const mongourl = process.env['mongodb']
const RarityModel = require('./models/rarity')
mongoose.connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then( (db) => {
        db.model('rarity')
        
        console.log(`connected to mongodb`) 
    });
mongoose.set('strictQuery', true);
const mongodb = mongoose.connection;

mongodb.on('error', console.error.bind(console, 'Connection error:'));

const mongoClient = new MongoClient(mongourl);
const databaseName = "rarity";


client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
    commands.push(command.data.toJSON());
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		// const data = await rest.put(
		// 	Routes.applicationGuildCommands(clientId, guildId),
		// 	{ body: commands },
		// );

        const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();


client.on(Events.ClientReady, () => {
  const Guilds = client.guilds.cache.size;
  const totalMembers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  console.log(Guilds, totalMembers)
  console.log(`Logged in as ${client.user.tag}!`);
});




async function checkIfAdmin(userId, guildId){
	let guild = client.guilds.cache.get(guildId)
	let user = guild.members.cache.get(userId)
	if(!user){
		return false
	}
	let checkIfuserHasRole = user.permissions.has(PermissionsBitField.Flags.Administrator);
	// return {
	// 	message:checkIfuserHasRole?true:false,
	// 	user:user,
	// }
	return checkIfuserHasRole?true:false
}



client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if(command.data.name == 'rarity') {
	await interaction.deferReply({content:'Fetching details', ephemeral:false})
	const guildId = interaction?.guildId
	let data = await getConfig(guildId)
	console.log(data)
	if(!data?.success) return await interaction.editReply({embeds:[data?.data]})
	data = data?.data
	if(data?.channelId && data?.channelId !== interaction?.channel?.id) return await interaction?.editReply({content:`The command only able to execute in <#${data?.channelId}>`, ephemeral:true})
      const token_id = interaction?.options?._hoistedOptions?.[0]?.value;
      let res = await rarityEmbed(data?.contractAddress, token_id);
	  console.log("response", res?.success)
	//   if(!res?.success) return await interaction?.editReply({content:})
      await interaction.editReply({embeds:[res?.data], ephemeral:false})
    } 
	
	else if(command.data.name == 'config') {
	const checkPerms = await checkIfAdmin(interaction?.user?.id, interaction?.guildId)
	if(!checkPerms) return await interaction.reply({content:"No Permission to execute the command", ephemeral:true})
	const contractAddress = interaction?.options?._hoistedOptions?.[0]?.value;
	const guildId = interaction?.guildId
	const channelId = interaction?.options?._hoistedOptions?.[1]?.value;
	const data = channelId?{contractAddress, guildId, channelId}:{contractAddress, guildId}
//   console.log(interaction?.options?._hoistedOptions)
	await interaction.deferReply({content:'Fetching details', ephemeral:false})
	let res = await setConfig(data);
	
	await interaction.editReply({embeds:[res], ephemeral:false})
    }

});

keepAlive()
client.login(token);