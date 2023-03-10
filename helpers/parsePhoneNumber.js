
const COUNTRY_CODES = {
    'NG': '234'
}


/**
 * 
 * @param {String} number 
 * @param {String} country 
 * @param {Number} LENGTH 
 */
exports.parsePhoneNumber = function (number, country = "NG", LENGTH = 10) {
    // sanitize number
    let cleaned = number.replace(/\D/g, '');

    // validate number
    if (cleaned.startsWith('234') && cleaned.substring(3).length === LENGTH) return cleaned;
    else if (cleaned.startsWith('0') && cleaned.substring(1).length === LENGTH) return COUNTRY_CODES[country] + cleaned.substring(1);
    else if (!cleaned.startsWith('0') && cleaned.length === LENGTH) return COUNTRY_CODES[country] + cleaned;
    else return false;
}