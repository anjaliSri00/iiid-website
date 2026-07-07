import { signOut } from "next-auth/react";
import { toast } from "react-toastify";

async function fetchApiResponse(url, options, showLoginModal) {
  // Validate URL before making the request
  if (!url || url.includes('null') || url.includes('undefined')) {
    console.error('Invalid URL detected:', url);
    throw new Error('Invalid API URL');
  }

  try {
    const res = await fetch(url, options);


    const data = await res.json();
    if (!url.includes('/login') && data.meta.status === 401) {
      signOut({ redirect: false });
      showLoginModal?.();
    } else if (!url.includes('/login') && (data.meta.status === 400 || data.meta.status === 409)) {
      if (data.meta.message === "Tokens are not valid for this user") {
        signOut({ redirect: false });
        showLoginModal?.();
      } else if (!url.includes('/signup')) {
        toast.error(data.meta.message);
      }
    }

    return data;
  } catch (error) {
    throw error; // Re-throw the error to be caught in calling function
  }
}

export default fetchApiResponse;


// helper/api_data_store.js
// import { signOut } from "next-auth/react";
// import { toast } from "react-toastify";

// // Check if we're on the server side
// const isServer = typeof window === 'undefined';

// async function fetchApiResponse(url, options, showLoginModal) {
//   // Validate URL before making the request
//   if (!url || url.includes('null') || url.includes('undefined')) {
//     console.error('Invalid URL detected:', url);
//     throw new Error('Invalid API URL');
//   }

//   try {
//     // Check if body is FormData
//     const isFormData = options?.body instanceof FormData;
    
//     // Prepare fetch options
//     const fetchOptions = {
//       ...options,
//       headers: {
//         ...options?.headers,
//       },
//     };

//     // If it's FormData, remove Content-Type header to let browser set it
//     if (isFormData) {
//       delete fetchOptions.headers['Content-Type'];
//     }

//     const res = await fetch(url, fetchOptions);
//     const data = await res.json();

//     // Only handle UI interactions on client side
//     if (!isServer) {
//       if (!url.includes('/login') && data.meta?.status === 401) {
//         signOut({ redirect: false });
//         showLoginModal?.();
//       } else if (!url.includes('/login') && (data.meta?.status === 400 || data.meta?.status === 409)) {
//         if (data.meta?.message === "Tokens are not valid for this user") {
//           signOut({ redirect: false });
//           showLoginModal?.();
//         } else if (!url.includes('/signup') && !url.includes('/onboard')) {
//           // Don't show toast for signup and onboard endpoints, let component handle it
//           toast.error(data.meta.message);
//         }
//       }
//     }

//     return data;
//   } catch (error) {
//     console.error("Error in fetchApiResponse:", error);
//     throw error;
//   }
// }

// export default fetchApiResponse;