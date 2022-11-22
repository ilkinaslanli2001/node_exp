const CryptoJS = require("crypto-js");

function encryptCookie(cookie) {
    const key = process.env.COOKIE_SECRET_KEY
    return CryptoJS.AES.encrypt(cookie, key).toString();
}

function decryptCookie(encryptedCookie) {
    const key = process.env.COOKIE_SECRET_KEY
    const bytes = CryptoJS.AES.decrypt(encryptedCookie, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

const condition = {
    sameSite: 'strict',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === "PRODUCTION",

}
module.exports = {
    encryptCookie, decryptCookie, condition
}
