// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LayoutWrapper from "./components/layouts/LayoutWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IIID - International Institute of Interior Designers",
  description: "Professional Interior Design Certification Programs",
};

export default async function RootLayout({ children }) {
  let session = null;
  let sessionError = null;
  
  try {
    // Try to get session
    session = await getServerSession(authOptions);
  } catch (error) {
    // Log the error but don't throw it
    console.error("Session error in RootLayout:", {
      message: error.message,
      stack: error.stack,
    });
    sessionError = error.message;
    session = null;
  }

  // If there's a session error, we still render the app without session
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          <LayoutWrapper>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}