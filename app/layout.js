// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LayoutWrapper from "./components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IIID - International Institute of Interior Designers",
  description: "Professional Interior Design Certification Programs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
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