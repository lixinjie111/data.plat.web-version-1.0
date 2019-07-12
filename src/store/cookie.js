import store from './index'
import router from '@/router/index'

class CookieUtil {
    constructor(){

    }
    static setItem(key,value){
                
        this.cacheData(key,value);

        value = JSON.stringify(value);
        localStorage.setItem(key,value);
    }
    static getItem(key){
        return localStorage.getItem(key);
    }
    static deleteItem(key){
        localStorage.removeItem(key);
    }
    static clearItems(){
        localStorage.clear();
    }
    static cacheData(type,value){
       
        switch(type){
            case 'login':                 
                store.dispatch('login', value)
                break
            case 'logout':
                store.dispatch('logout')
                break
            case 'initMenus':
                store.dispatch('initMenus', value)
                break            
            default:
                break
        }
    }
    static flushData(){

        let loginStatus = this.getItem('login')
        if(!loginStatus) {
            router.push('/login')
        };
        this.cacheData('login',JSON.parse(loginStatus))        
    }
}

export default CookieUtil