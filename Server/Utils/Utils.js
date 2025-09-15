class Utils {

    /**
     * @param {number} int
     * @returns {string}
     */
    static generateString(int){
        let charList = "abcdefghijklmnopqrstuvwxyz1234567890";
        let string = "";
        let i = 0;
        for (; i < int; i++){
            string += charList.charAt(Math.floor(Math.random() * charList.length));
        };
        return string;
    };
};

module.exports = Utils;