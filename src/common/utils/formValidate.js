/**
 * 表单校验方法工具类
 */
class TFormValidate{
    constructor(){
        
    }
    
   /**
     * 空值
     * @param {*} value 
     */
    static isNull(value){
        let bool = false;
        if(value == null || value == '' || value== ' '){
            bool = true;
        }
        return bool;
    }

    /**
     * 非空
     * @param {*} value 
     */
    static isNonNull(value){
        let bool = true;
        if(value == null || value == '' || value== ' '){
            bool = false;
        }
        return bool;
    }

    /**
     * 邮箱
     * @param {*} value 
     */
    static isEmail(value){
        let rege = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return rege.test(value);
    }

    /**
     * 手机号
     * @param {*} value 
     */
    static isMobile(value){
        // let rege = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
        let rege = /^1(3|4|5|6|7|8)\d{9}$/;
        return rege.test(value);
    }
    
    /**
     * 电话
     * @param {*} value 
     */
    static isTelephone(value){
        let rege = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
        return rege.test(value);
    }

    /**
     * ip地址
     * @param {*} value 
     */
    static isIP(value){
        let rege = /\d+\.\d+\.\d+\.\d+/;
        return rege.test(value);
    }

    /**
     * 车牌号
     * @param {*} value 
     */
    static plateNumber(value){
        let rege = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        return rege.test(value);
    }

    /**
     * 身份证
     * @param {*} value 1 第一代
     * @param {*} value 2 第二代
     */
    static idCard(value,type=2){
        let rege = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        if(type == 1){
            rege = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
        }
        return rege.test(value);
    }

    /**
     * 密码
     * type=1 格式： 字母、数字、下划线
     * type=2 格式：强密码正则，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
     * @param {*} value 
     */
    static password(value,type=1){
        let rege = /^[a-zA-Z]\w{5,17}$/;
        if(type == 2){
            rege =  /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/;
        }
        return rege.test(value);
    }

    /**
     * qq号码
     * @param {} value 
     */
    static qq(value){
        let rege = /^[1-9][0-9]{4,10}$/;
        return rege.test(value);
    }

    /**
     * 经纬度
     * @param {经度} longitude 
     * @param {纬度} latitude 
     */
    static lonAndLat(longitude,latitude){
        let lon = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
        let lat = /^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
        return lon.test(longitude) && lat.test(latitude);
    }

    /**
     * 特殊字符
     * @param {*} value 
     */
    specialCharacter(value){
        let rege = /["'<>%;)(&+]+-!！@#$~/;
        return rege.test(value);
    }

    /**
     * 车辆vin、车架号
     * @param {} value 
     */
    vin(value){
        if(value.length>0 && value.length!=17){
            return false;
        }else{
            var vinVal = value.toUpperCase();
            //document.getElementById("vin_"+k).value = vinVal;
            var charToNum = {'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7,'H':8,'J':1,'K':2,'L':3,'M':4,'N':5,'P':7,'R':9,'S':2,'T':3,'U':4,'V':5,'W':6,'X':7,'Y':8,'Z':9};
            var obj = 0;
            var arr = new Array();
            for (var i = 0 ; i < vinVal.length; i++) {
                var temp = vinVal.charAt(i);

                if(charToNum[temp]){
                    arr[i] = charToNum[temp];
                }else{
                    arr[i] = Number(temp);
                }
                if(i==8){
                    arr[i] = vinVal.charAt(i);
                }

            };	
            var a1 = 8;
            for (var i = 0; i < 7; i++) {
                obj += Number(arr[i]) * a1 ;
                a1--;
            };

            obj += Number(arr[7])*10;

            var a2 = 9;
            for (var i = 9; i < 17; i++) {
                obj += Number(arr[i]) * a2;
                a2--;
            };

            var result = Number(obj)%11; 
            if(parseInt(result) === 10){
                result = 'X';
            }
            if(result == arr[8]){
                    //成功
                return true;
            }else{
                                    //失败
                return false;
            }
        }
    }

    /**
     * vin 车辆vin、车架号
     * @param {*} value 
     */
    vin2(value){
        var Arr = new Array(); 
        var Brr = new Array(); 
        Arr['A'] = 1; 
        Arr['B'] = 2; 
        Arr['C'] = 3; 
        Arr['D'] = 4; 
        Arr['E'] = 5; 
        Arr['F'] = 6; 
        Arr['G'] = 7; 
        Arr['H'] = 8; 
        Arr['J'] = 1; 
        Arr['K'] = 2; 
        Arr['L'] = 3; 
        Arr['M'] = 4; 
        Arr['N'] = 5; 
        Arr['P'] = 7; 
        Arr['R'] = 9; 
        Arr['S'] = 2; 
        Arr['T'] = 3; 
        Arr['U'] = 4; 
        Arr['V'] = 5; 
        Arr['W'] = 6; 
        Arr['X'] = 7; 
        Arr['Y'] = 8; 
        Arr['Z'] = 9; 
        Arr['1'] = 1; 
        Arr['2'] = 2; 
        Arr['3'] = 3; 
        Arr['4'] = 4; 
        Arr['5'] = 5; 
        Arr['6'] = 6; 
        Arr['7'] = 7; 
        Arr['8'] = 8; 
        Arr['9'] = 9; 
        Arr['0'] = 0; 
        Brr[1]=8; 
        Brr[2]=7; 
        Brr[3]=6; 
        Brr[4]=5; 
        Brr[5]=4; 
        Brr[6]=3; 
        Brr[7]=2; 
        Brr[8]=10; 
        Brr[9]=0; 
        Brr[10]=9; 
        Brr[11]=8; 
        Brr[12]=7; 
        Brr[13]=6; 
        Brr[14]=5; 
        Brr[15]=4; 
        Brr[16]=3; 
        Brr[17]=2; 

        var sKYZF="ABCDEFGHJKLMNPRSTUVWXYZ1234567890"; 
        var sJYW =''; 
        var bool = false; 
        var blKYZF = false; 
        if (sVIN.length == 17) 
        { 
            var iJQS=0,intTemp=0; 
            ht = Arr; 
            htZM = Brr; 
            try 
            { 
                for (var i = 0; i <sVIN.length; i++) 
                { 
                    if (sKYZF.indexOf(sVIN.substr(i, 1)) != -1) 
                    { 
                        blKYZF = true; 
                        iJQS = iJQS + parseInt(ht[sVIN.substr(i, 1)]) * parseInt(htZM[(i + 1)]); 
                    } 
                    else 
                    { 
                        blKYZF = false; 
                        break; 
                    } 
                } 
                if (blKYZF) 
                { 
                    intTemp = iJQS%11; 
                    if (intTemp == 10) 
                    { 
                        sJYW = "X"; 
                    } 
                    else 
                    { 
                        sJYW = intTemp.toString(); 
                    } 
                    if (sJYW == sVIN.substr(8, 1)) bool = true; 
                }else 
                { 
                    bool = false; 
                } 
            }catch(err) 
            { 
                bool = false; 
            } 
        } 
        return bool; 
    }

    /**
     * 设备id
     * @param {*} value 
     */
    deviceID(value){
        let rege = /^\d-[a-zA-Z]{2}-\d{4}/;
        return rege.test(value);
    }
    /**
    * 车辆编号
    * @param {*} value 
    */
    static vehicleId(value){
        let rege = /[A-Z][\d]{2}[A-Z| \d]-[\d]{2}-[\d]{3}/;
        return rege.test(value);
    }
}
export default TFormValidate;