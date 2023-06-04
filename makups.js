const {share_contact,share_location} = require("./text_replies.json")

const markupDefultSettings = {
    one_time_keyboard:true,
    resize_keyboard:true,
}

const markupWrapper = (markup) =>{
    return {
        reply_markup:{...markup}
    }
}

const contactMarkup = {
    resize_keyboard:true,
    keyboard: [[{
                text: share_location,
                request_location:true,
    }],[{
        text: share_contact,
        request_contact: true
    }], [{text:"if you already added info about you,click here",hide_keyboard:true}]]
};

const agreeMarkup = {
    ...markupDefultSettings,
    keyboard: [["No"], ["Yes"]]
}


module.exports = {contactMarkup,markupWrapper,agreeMarkup};