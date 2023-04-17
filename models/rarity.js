const mongoose = require('mongoose')
const { Schema, model } = mongoose;
const rarityModel = new Schema({
    contract_address: {type:String, required:true},
    guild_id: {type:String, required:true},
  channel_id:{type:String, required:false}
},{ timestamps: true })

module.exports = model('rarity', rarityModel); 