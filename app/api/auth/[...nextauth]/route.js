import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import md5 from "blueimp-md5";

// Direct fetch function for server-side (without client-side dependencies)
const serverFetch = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server fetch error:", error);
    throw error;
  }
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        action: { label: "Action", type: "text" },
        session_id: { label: "Session ID", type: "text" },
        directToken: { type: "boolean" },
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
        userData: { type: "string" },
      },
      async authorize(credentials) {
        try {
          let response;
          const baseUrl = process.env.NEXT_PUBLIC_API_URL;

          if (!baseUrl) {
            console.error("NEXT_PUBLIC_API_URL is not defined");
            throw new Error("API URL is not configured");
          }

          console.log("Authorize called with credentials:", {
            hasEmail: !!credentials?.email,
            hasMobile: !!credentials?.mobile,
            hasOtp: !!credentials?.otp,
            action: credentials?.action,
            directToken: credentials?.directToken,
          });

          if (credentials.directToken === "true" && credentials.userData) {
            // Direct token login
            if (!credentials.userData) {
              throw new Error("Missing userData");
            }

            let userData;
            try {
              userData = JSON.parse(credentials.userData);
            } catch (error) {
              console.error("Invalid userData:", credentials.userData);
              throw new Error("Invalid user data format");
            }

            return {
              id: userData.id,
              email: userData.email,
              mobile: userData.mobile,
              accessToken: credentials.accessToken,
              refreshToken: credentials.refreshToken,
              role: userData.role,
            };
          } else if (
            credentials.action === "verify" &&
            credentials.mobile &&
            credentials.otp &&
            credentials.session_id
          ) {
            // Mobile OTP Verification Login
            console.log("Attempting mobile OTP login for:", credentials.mobile);

            response = await serverFetch(`${baseUrl}/api/v1/users/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mobile: parseInt(credentials.mobile, 10),
                otp: credentials.otp,
                action: "verify",
                session_id: credentials.session_id,
              }),
            });

            console.log("Mobile OTP login response:", response);

            if (response.meta?.status === 200) {
              return {
                id: response.data.user.id,
                mobile: response.data.user.mobile,
                email: response.data.user.email || "",
                full_name: response.data.user.full_name || "",
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                role: response.data.role || "student",
              };
            } else {
              const errorMsg = response?.meta?.message || "Incorrect OTP. Please try again.";
              throw new Error(errorMsg);
            }
          } else if (credentials.email && credentials.password) {
            // Email/password login
            console.log("Attempting email/password login for:", credentials.email);

            response = await serverFetch(`${baseUrl}/api/v1/users/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            console.log("Email login response status:", response.data);

            if (response.meta?.status === 200) {
              return {
                id: response.data.user.id,
                email: response.data.user.email,
                mobile: response.data.user.mobile || "",
                full_name: response.data.user.full_name || "",
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                role: response.data.user.role_type?.[0] || "student",
              };
            } else if (response.meta?.status === 401) {
              throw new Error("Incorrect password");
            } else if (response.meta?.status === 404) {
              throw new Error("User not found. Please check your email and try again.");
            } else if (response.meta?.status === 400) {
              throw new Error("Bad request - clear tokens");
            } else {
              throw new Error(response?.meta?.message || "Something went wrong.");
            }
          } else {
            console.warn("Missing credentials or invalid action.");
            return null;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          const cleanMessage = error?.message || error.toString();
          const displayMessage = cleanMessage.replace("Error: ", "");
          throw new Error(displayMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - new user:", user.id);
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          refreshToken: user.refreshToken,
          refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          userId: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          full_name:user.full_name
        };
      }

      // Return previous token if access token is still valid
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired - try to refresh
      try {
        console.log("Token expired, attempting refresh...");
        // You can implement refresh token logic here if needed
        // For now, just return the token (will force re-login)
        return token;
      } catch (error) {
        console.error("Token refresh error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      console.log("Session callback - userId:", token.userId);
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        id: token.userId,
        email: token.email,
        mobile: token.mobile,
        role: token.role,
        full_name:token.full_name
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect back to login on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };