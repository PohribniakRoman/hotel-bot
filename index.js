require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { contactMarkup, markupWrapper, agreeMarkup } = require('./makups');

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

let PREV_MESSAGE = "";

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
                DB.push({id:msg.chat.username})
                bot.sendMessage(msg.chat.id,`Hi there👋\nWelcome to hotel manager bot,now send me information about your location and your contact!`,markupWrapper(contactMarkup));
            }else{
                bot.sendMessage(msg.chat.id,`Nice to see you again👋\nYou know what to do!`,markupWrapper(contactMarkup));
            }
            PREV_MESSAGE = "SCALI";
        }
        
        if (PREV_MESSAGE === "SCALI" && msg.hasOwnProperty("location")){
            const resp = await (await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${msg.location.latitude}&longitude=${msg.location.longitude}&localityLanguage=en`)).json();
            const location = resp.localityInfo.administrative[0].name+","+resp.city+","+resp.locality;
            bot.sendMessage(msg.chat.id,location);
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.location = location;
                }
            })
        }
        if(PREV_MESSAGE === "SCALI" && msg.hasOwnProperty("contact")){
            bot.sendMessage(msg.chat.id,"Your contact info has been added!")
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.contact = msg.contact;
                }
            })
        }
        if(msg.text === "if you already added info about you,click here"){
            let isUserAddedAll = false;
            DB.forEach(user => {
                if(user.id === msg.chat.username){
                    isUserAddedAll = user.hasOwnProperty("contact") && user.hasOwnProperty("location");
                }
            });
            if(isUserAddedAll){
                bot.sendMessage(msg.chat.id,"You are registered in hotel Grand Turismo in room 403,is it right?",markupWrapper(agreeMarkup))
            }else{
                bot.sendMessage(msg.chat.id,"It is not enough info about you(",markupWrapper(contactMarkup))
            }
        }
})