require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const { contactMarkup, markupWrapper, agreeMarkup } = require('./makups');
const replies = require("./text_replies.json");
const getLocation = require('./services/getLocation');
const commands = require('./commands');

const BOT_STATE = {
    writingData:{
        isActive:false,
        dataType:[]
    },
    communicating:{
        isActive:false,
        theme:[]
    },
}

const removeWritingType = (type) =>{
    BOT_STATE.writingData.dataType = BOT_STATE.writingData.dataType.filter(e=>e !== type);
    if(BOT_STATE.writingData.dataType.length === 0)BOT_STATE.writingData.isActive = false;
}
const addWritingType = (type) => {
    removeWritingType(type);
    BOT_STATE.writingData.isActive = true;
    BOT_STATE.writingData.dataType.push(type);
}


const DB = []


bot.on("message",async (msg,match)=>{
        if(msg.text === "/start"){
            let registrated = false;
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    registrated = true;
                }
            })
            if(!registrated){
                DB.push({id:msg.chat.username});
                bot.sendMessage(msg.chat.id,replies.welcome_text,markupWrapper(contactMarkup));
            }else{
                bot.sendMessage(msg.chat.id,replies.welcome_again,markupWrapper(contactMarkup));
            }
            addWritingType("location");
            addWritingType("contact");
        }
        if (BOT_STATE.writingData.isActive && msg.hasOwnProperty("location") && BOT_STATE.writingData.dataType.includes("location")){
            removeWritingType("location");
            let additional; 
            const location = await getLocation(msg.location);
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.location = location;
                    if(BOT_STATE.writingData.isActive){
                        additional = replies.welcome_text_success_location;
                    }else{
                        additional = replies.welcome_text_success_all;
                    }
                    bot.sendMessage(msg.chat.id,additional+user.location+"\n"+replies.successfully_added);
                }
            })
        }
        
        if(BOT_STATE.writingData.isActive && msg.hasOwnProperty("contact") && BOT_STATE.writingData.dataType.includes("contact")){
            removeWritingType("contact");
            let additional;
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.contact = msg.contact;
                    if(BOT_STATE.writingData.isActive){
                        additional = replies.welcome_text_success_contact;
                    }else{
                        additional = replies.welcome_text_success_all;
                    }
                    bot.sendMessage(msg.chat.id,additional+replies.successfully_added);
                }   
            })
        }
        if(msg.text === replies.reg_end){
            let isUserAddedAll = false;
            DB.forEach(user => {
                if(user.id === msg.chat.username){
                    isUserAddedAll = user.hasOwnProperty("contact") && user.hasOwnProperty("location");
                }
            });
            if(isUserAddedAll){
                bot.sendMessage(msg.chat.id,`Excellent,${msg.chat.last_name?"Mr. "+msg.chat.last_name:msg.chat.first_name} registered in hotel Grand Turismo in room 403,is it right?`,markupWrapper(agreeMarkup));
            }else{
                bot.sendMessage(msg.chat.id,replies.failed_to_locate,markupWrapper(contactMarkup));
            }
        }
        if(msg.text === "/startconv"){
            BOT_STATE.communicating.isActive = true;
            bot.sendMessage(msg.chat.id,`Welcome to Hotel,${msg.chat.last_name?"Mr. "+msg.chat.last_name:msg.chat.first_name}! We're delighted to have you here. For a quicker check-in process, we offer a convenient face recognition option. Would you like to take advantage of this feature?`,markupWrapper(agreeMarkup));
        }  
        if(BOT_STATE.communicating.isActive){
            if(msg.text === "That sounds great! I'd be happy to try it." || msg?.text?.toLowerCase() === "yes"){
                bot.sendMessage(msg.chat.id,"Wonderful! To proceed with the face recognition, could you please look directly into the camera in front of you? We'll match it with the details in your reservation.(send me photo)")
                BOT_STATE.communicating.theme.push("photo")
            }
            if(msg.hasOwnProperty("photo") && BOT_STATE.communicating.theme.includes("photo")){
                bot.sendMessage(msg.chat.id,`Excellent,${msg.chat.last_name?"Mr. "+msg.chat.last_name:msg.chat.first_name}! Your check-in is complete. Is there anything else I can assist you with?На цьому поки все.`)
            }
        }

})
bot.setMyCommands(commands)