const getLocation = async (location) => {
    const {latitude,longitude} = location;
    const resp = await (await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)).json();
    const place = resp.localityInfo.administrative[0].name+","+resp.city+","+resp.locality;
    return place;
}


module.exports =  getLocation;