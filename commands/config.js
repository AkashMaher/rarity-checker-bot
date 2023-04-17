const { SlashCommandBuilder } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Config your collection')
		.addStringOption(option =>
            option.setName('contract_address')
                .setDescription('Enter contract address of your collection!')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('select_channel')
                .setDescription('Select channel for rarity checker, the bot will work in the channel only!')
                .setRequired(false)
        ),
        
	async execute(interaction) {
		await interaction.reply({content:'NFT Rarity', ephemeral:true});
	},
};