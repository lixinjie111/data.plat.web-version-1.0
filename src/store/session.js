import store from './index'
import router from '@/router/index'

class SessionUtil {
    constructor(){

    }
    static setItem(key,value){
                
        this.cacheData(key,value);

        value = JSON.stringify(value);
        sessionStorage.setItem(key,value);
    }
    static getItem(key){
        return sessionStorage.getItem(key);
    }
    static deleteItem(key){
        sessionStorage.removeItem(key);
    }
    static clearItems(){
        sessionStorage.clear();
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

export default SessionUtil