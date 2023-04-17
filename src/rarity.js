const axios = require('axios')

const shortenString = (
  value,
  leftDigits,
  rightDigits,
) => {
  let shortenedString = ''
  if (value) {
    shortenedString =
      value?.substring(0, leftDigits) +
      '...' +
      value?.substring(value?.length - rightDigits)
  }
  return shortenedString
}
async function rarityEmbed(contract_address,token_id) {

try {
const options = {
  method: 'GET',
  url: `https://api.opensea.io/api/v1/asset/${contract_address}/${token_id}`,
  headers: {'X-API-KEY': ''}
};

const response = await axios.request(options)
// console.log(response?.data)
const nftInfo = response?.data
// console.log(nftInfo)
let totalSupply = nftInfo?.collection?.stats?.total_supply
// console.log(totalSupply)
let d = new Date();

let traits = []
let tt = nftInfo?.traits
for(let i = 0;i<tt?.length;i++){
    let trait = {
        name:`${tt[i]?.trait_type}`,
        value:`${tt[i]?.value}`
    }
    await traits?.push(trait)
}

const ownerUsername = nftInfo?.top_ownerships[0]?.owner?.user?.username

// console.log(d)


  const dataEmbed = {
	color: 0x4df85f,
	title: nftInfo?.name,
	description: `${nftInfo?.rarity_data?.rank?`**Rarity Rank #${nftInfo?.rarity_data?.rank}**`:" "}\n**Owner :** [**__${ownerUsername? ownerUsername:shortenString(nftInfo?.top_ownerships[0]?.owner?.address,4,4)}__**](https://opensea.io/${nftInfo?.top_ownerships[0]?.owner?.address})`,
	thumbnail: {
		url: `${nftInfo?.image_url}`,
	},
	fields: [
        // {
		// 	name: `\u200b`,
		// 	value: `Owner : [**__${ownerUsername? ownerUsername:shortenString(nftInfo?.top_ownerships[0]?.owner?.address,4,4)}__**](https://opensea.io/${nftInfo?.top_ownerships[0]?.owner?.address})`,
		// 	inline: false
		// },
        {
			name: `\u200b`,
			value: `**Traits**`,
			inline: false
		}, ...traits,
        {
			name: `\u200b`,
			value: `[**__View On Opensea__**](https://opensea.io/assets/${nftInfo?.asset_contract?.chain_identifier}/${contract_address}/${token_id})`,
			inline: false
		}

	],
	timestamp: d.toISOString(),
    image:{
    url:`${nftInfo?.image_url}`,
    }
	// footer: {
	// 	text: timePlaced,
	// 	icon_url: 'https://www.movinfrens.com/images/team/ak.gif',
	// },
};
return {success:true, data:dataEmbed}
} 
catch (error) {
  let eMessage = {
	color: 0x4df85f,
	title: "Error",
	description: `something wents wrong please check token id or contact us in [__Support Server__](https://discord.gg/DVd7fKwA4k)`,
}
  return {
    success:false,
    data:eMessage,
    error
  }
}
}

module.exports = {rarityEmbed}