/**
 * 日期时间格式化
 */
class TDate {
    constructor(){

    }
    // 时间戳转格式化日期
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
    //日期转时间戳
    static dateToMs (date) {
        let result = new Date(date).getTime();
        return result;
    }
    // 20190718105020 => 2019-07-18 10:50:20
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

    static getNowFormatDate() {//获取当前时间
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
        var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
        var currentdate = date.getFullYear() + seperator1  + month  + seperator1  + strDate
                + " "  + date.getHours()  + seperator2  + date.getMinutes()
                + seperator2 + date.getSeconds();
        return currentdate;
    }
    static GetDateStr(AddDayCount) { //获取当前时间之前的天数作为开始时间
        var dd = new Date();
        dd.setDate(dd.getDate()-AddDayCount);//获取AddDayCount天前的日期
        var y = dd.getFullYear(); 
        var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1);//获取当前月份的日期，不足10补0
        var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate();//获取当前几号，不足10补0
        return y+"-"+m+"-"+d + " " + dd.getHours() + ":" + dd.getMinutes() + ":" + dd.getSeconds(); 
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
