require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const { contactMarkup, markupWrapper, agreeMarkup } = require('./makups');
const {welcome_text,successfully_added,reg_end,failed_to_locate,welcome_again} = require("./text_replies.json");
const getLocation = require('./services/getLocation');
const commands = require('./commands');

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
                bot.sendMessage(msg.chat.id,welcome_text,markupWrapper(contactMarkup));
            }else{
                bot.sendMessage(msg.chat.id,welcome_again,markupWrapper(contactMarkup));
            }
            PREV_MESSAGE = "SCALI";
        }
        
        if (PREV_MESSAGE === "SCALI" && msg.hasOwnProperty("location")){
            bot.sendMessage(msg.chat.id,getLocation(msg.location));
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.location = location;
                }
            })
        }

        if(PREV_MESSAGE === "SCALI" && msg.hasOwnProperty("contact")){
            bot.sendMessage(msg.chat.id,successfully_added)
            DB.forEach(user=>{
                if(user.id === msg.chat.username){
                    user.contact = msg.contact;
                }
            })
        }
        if(msg.text === reg_end && PREV_MESSAGE === "SCALI"){
            let isUserAddedAll = false;
            DB.forEach(user => {
                if(user.id === msg.chat.username){
                    isUserAddedAll = user.hasOwnProperty("contact") && user.hasOwnProperty("location");
                }
            });
            if(isUserAddedAll){
                bot.sendMessage(msg.chat.id,"You are registered in hotel Grand Turismo in room 403,is it right?",markupWrapper(agreeMarkup))
            }else{
                bot.sendMessage(msg.chat.id,failed_to_locate,markupWrapper(contactMarkup))
            }
        }
})

bot.setMyCommands(commands)