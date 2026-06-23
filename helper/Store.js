'use client'

async function saveLocalStorage(data){
        Object.keys(data).forEach(key => {
            // console.log(key + ":"+ data[key].value);
            const expire = Date.now() + data[key].expire;
            const item = {
                value: data[key].value,
                expire: expire,
                timeStamp:Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(item));
        });

}



// const handleLogin = ()=>{
//     let accessToken = localStorage.getItem('accessToken');
//       let refreshToken = localStorage.getItem('refreshToken');
  
//       if (!accessToken || !refreshToken || isTokenExpired(accessToken) || isTokenExpired(refreshToken)) {
//         accessToken = JSON.parse(accessToken).value;
//     console.log("accessToken", accessToken);
//     refreshToken = JSON.parse(refreshToken).value;
//     console.log("refreshToken", refreshToken);
//         setShowLoginModal(true);
//       } else {
//         setShowLoginModal(false);
//         if (router.pathname === '/login') {
//           router.push('/addressForm');
//         }
//       }   
//     }

export default saveLocalStorage;