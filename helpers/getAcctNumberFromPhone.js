

exports.getAcctNumberFromPhone = function (phoneNumber) {
    let validAcctNumber;
    let phoneString = String(phoneNumber)
    if (phoneString.startsWith('+234')) {
        let mainNumber = phoneString.slice(4)
        if (mainNumber[0] === 0) throw new Error('invalid phone number');
        validAcctNumber = Number(mainNumber);
    } else if (phoneString.startsWith('0')) {
        let mainNumber = phoneString.slice(1)
        if (mainNumber[0] === 0) throw new Error('invalid phone number');
        validAcctNumber = Number(mainNumber);
    } else throw new Error('invalid phone number');

    console.log(validAcctNumber);
    return validAcctNumber;
}