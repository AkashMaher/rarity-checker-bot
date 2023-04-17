const MongoClient = require("mongodb").MongoClient;
const mongourl = process.env['mongodb']
const mongoClient = new MongoClient(mongourl);

async function setConfig(Data){
    const {contractAddress, guildId, channelId} = Data
    console.log(Data)
    let result = await mongoClient.connect();
    let db = result.db("rarity");
    let collection = db.collection('rarity');
    
    let data = await collection.findOne({ guildId });
    if(!data){
        await collection.insertOne({...Data})
        data = await collection.findOne({ guildId });
    } else {
      await collection.findOneAndUpdate({ guildId },{$set:{...Data}})
    }
    
    data = await collection.findOne({ guildId });
    // return data;


    const dataEmbed = {
	color: 0x00ffef,
	title: 'Config Saved',
	description: ``,
	thumbnail: {
		url: 'https://www.movinfrens.com/images/team/ak.gif',
	},
	fields: [
    
		{
			name: 'Contract Address',
			value: `${data.contractAddress}`,
			inline: false,
		},
        {
			name: 'ChannelId',
			value: `${data?.channelId?`<#${data?.channelId}>`:"Not set"}`,
			inline: false,
		},
        
	],
	timestamp: new Date().toISOString(),
	footer: {
		text: "Ak",
		icon_url: 'https://www.movinfrens.com/images/team/ak.gif',
	},
};
return dataEmbed;

}


async function getConfig(guildId) {

    let result = await mongoClient.connect();
    let db = result.db("rarity");
    let collection = db.collection('rarity');
    
    let data = await collection.findOne({ guildId });
    if(!data) {
        let eMessage = {
	color: 0x4df85f,
	title: "Config Required",
	description: `collection not config yet in the server, Use \`/config\`  command to config, any help contact us [__Support Server__](https://discord.gg/DVd7fKwA4k)`,
}
        return {
            success:false,
            data:eMessage
        }
    }
    return {success:true,data}
}

module.exports = {setConfig, getConfig}
