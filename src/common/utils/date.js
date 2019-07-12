/**
 * 日期时间格式化
 */
class TDate {
    constructor(){

    }
    static formatTime(value,type='yy-mm-dd hh:mm:ss'){
        let tDate = value ? new Date(value) : new Date();
        const year = tDate.getFullYear();
        const month = this.formatNum(tDate.getMonth() + 1);
        const day = this.formatNum(tDate.getDate());
        const hour = this.formatNum(tDate.getHours());
        const minutes = this.formatNum(tDate.getMinutes());
        const seconds = this.formatNum(tDate.getSeconds());
        const millisecond = this.formatNum(tDate.getMilliseconds());
        if(type == 'yy-mm-dd'){
            return year + '-' + month + '-' + day;
        }else if(type == 'yy-mm-dd hh:mm:ss:ms'){
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds + '.' + millisecond;
        }else {
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
        }
    }
    static formatNum(value){
        return value < 10 ? '0' + value : value;
    }
    static dateToMs (date) {//日期转时间戳
        let result = new Date(date).getTime();
        return result;
    }
    static dateTimeFormatter (t) {
        if (!t) return ''
        t = new Date(t).getTime()
        t = new Date(t)
        var year = t.getFullYear()
        var month = (t.getMonth() + 1)
        month = formatNum(month)
       
        var date = t.getDate()
        date = formatNum(date)
       
        var hour = t.getHours()
        hour = formatNum(hour)
       
        var min = t.getMinutes()
        min = formatNum(min)
       
        var se = t.getSeconds()
        se = formatNum(se)
       
        return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + se
    }
    static formatTimeReal(time){
        var t = time.toString();
        var y = t.substring(0,4);
        var m = t.substring(4,6);
        var d = t.substring(6,8);
        var h = t.substring(8,10);
        var min = t.substring(10,12);
        var ss = t.substring(12);
        return y+ '-' + m + '-' + d + ' ' + h + ':' + min + ':' + ss;
    }
    static timeConversion(t){//国际标准时间转yyyyMMddHHmmss时间格式
        var d = new Date(t);  
        var m = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
        var day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        var h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        var ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
        return d.getFullYear() + m + day + h + min + ss;
    }
    static timeToConversion(t){//国际标准时间转yyyy-MM-dd HH:mm:ss时间格式
        var d = new Date(t);  
        var m = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
        var day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        var h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        var ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
        return d.getFullYear() + '-' + m + '-' + day + ' ' + h + ":" + ":" + min + ":" + ss;
    }
    // static formatTime(value){
    //     if(value == ''){
    //         return;
    //     }
    //     let tDate = value ? new Date(value) : new Date();
    //     const year = tDate.getFullYear();
    //     const month = this.formatNum(tDate.getMonth() + 1);
    //     const day = this.formatNum(tDate.getDate());
    //     const hour = this.formatNum(tDate.getHours());
    //     const minutes = this.formatNum(tDate.getMinutes());
    //     const seconds = this.formatNum(tDate.getSeconds());
    //     return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
    // }
}
export default TDate;
