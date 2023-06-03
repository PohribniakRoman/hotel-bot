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
    ...markupDefultSettings,
    keyboard: [[{
                text: "Share my location info",
                request_location:true,
    }],[{
        text: "Share my contact info",
        request_contact: true
    }], ["if you already added info about you,click here"]]
};

const agreeMarkup = {
    ...markupDefultSettings,
    keyboard: [["No"], ["Yes"]]
}


module.exports = {contactMarkup,markupWrapper,agreeMarkup};