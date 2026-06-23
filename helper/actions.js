'use server'
 
import { cookies } from 'next/headers'
/*
data={
accessToken:{
value:"txtdj",
expire
}
}
*/
async function saveCookies(data){
    Object.keys(data).forEach(key =>{
        // console.log(key + ":"+ data[key]);
        const expire= Date.now() + data[key].expire;
        cookies().set(key,data[key].value,{ expires: expire });
    })

}

export default saveCookies;