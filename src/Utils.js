
module.exports = class Utils {

    static getSqlDate(jsDate){

        return  jsDate.getFullYear() + '-' +
        ('00' + (jsDate.getMonth()+1)).slice(-2) + '-' +
        ('00' + jsDate.getDate()).slice(-2) + ' ' + 
        ('00' + jsDate.getHours()).slice(-2) + ':' + 
        ('00' + jsDate.getMinutes()).slice(-2) + ':' + 
        ('00' + jsDate.getSeconds()).slice(-2);
    }
}