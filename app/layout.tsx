// app/layout.tsx
'use client';

import "./globals.css"; // Tailwind globals or your own styles
import { ReactNode } from "react";
import { ThemeProvider as AmplifyThemeProvider, Theme, ColorMode } from "@aws-amplify/ui-react";
import { Authenticator } from "@aws-amplify/ui-react";
import DesignerContextProvider from "../components/context/DesignerContextProvider";
import { ThemeProvider as NextThemeProvider } from "../components/providers/ThemeProvider";
import { Toaster } from "../components/ui/toaster";
//import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css"; // Optional, if you're using Amplify tokens

Amplify.configure(outputs);

//import "../src/pages/Styles/styles.css"; // Your custom styles
const inter = Inter({ subsets: ["latin"] });



// Optional: use dark mode by default
const colorMode: ColorMode = "dark";

// Optional Amplify UI Theme
const theme: Theme = {
  name: "custom-auth-theme",
  overrides: [
    {
      colorMode: "dark", // or "light"
      tokens: {
        colors: {
          background: {
            primary: { value: "#ffffff" }, // main background
            secondary: { value: "#1e293b" }, // card background
          },
          font: {
            primary: { value: "#030303" }, // text color
          },
        },
        components: {
          button: {
            primary: {
              backgroundColor: { value: "#facc15" },
              color: { value: "#000000" },
            },
          },
          field: {
            label: {
              color: { value: "#030303" },
            },
          },
        },

      },
    },
  ],
};

function CustomHeader() {
  return (
    <div className="flex justify-center mb-4">
      <span style={{ color: '#facc15', fontWeight: 'bold', marginRight: '0rem', fontSize: '5em', }}>hero</span>
      <span className="text-gray-500 font-semibold mr-1" style={{ position: 'relative', display: 'inline-block', fontSize: '5em' }}>
        <span>au</span>
        <sub style={{
          position: 'absolute',
          left: 110,
          bottom: '0.4em',
          fontSize: '0.6em',
          color: '#6b7280'
        }}>
          app
        </sub>
        <span>dit</span>
      </span>
    </div>
  );
}

/*export const metadata: Metadata = {
  title: "Fox Form Creator",
  description:
    "Another Next.js project also using Typescript, Dnd-Kit, PostgreSQL, Prisma, Tailwind",
};*/
const formFields = {
  signUp: {
    "custom:Company": {
      label: 'Company:',
      placeholder: 'Select the company',
      isRequired: true,
      
    },
  },
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader />
        <AmplifyThemeProvider theme={theme} colorMode={colorMode}>
          <DesignerContextProvider>
            <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="h-screen flex items-center justify-center">
                <Authenticator formFields={formFields}
                  components={{
                    Header: CustomHeader,
                  }}
                >
                  {children}
                  <Toaster />
                </Authenticator>
              </div>
            </NextThemeProvider>
          </DesignerContextProvider>
        </AmplifyThemeProvider>
      </body>
    </html>
  );
}
