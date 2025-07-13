'use client';

import './globals.css';
import { ReactNode } from 'react';
import {
  ThemeProvider as AmplifyThemeProvider,
  Theme,
  ColorMode,
  SelectField,
} from '@aws-amplify/ui-react';
import { Authenticator } from '@aws-amplify/ui-react';
import DesignerContextProvider from '../components/context/DesignerContextProvider';
import { ThemeProvider as NextThemeProvider } from '../components/providers/ThemeProvider';
import { Toaster } from '../components/ui/toaster';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import RouteLoader from '../components/RouteLoader';

// ✅ Import the ClientProvider and hook
import { ClientProvider, useClientContext } from '../components/context/clientContext';

Amplify.configure(outputs);

const inter = Inter({ subsets: ['latin'] });

const colorMode: ColorMode = 'dark';

const theme: Theme = {
  name: 'custom-auth-theme',
  overrides: [
    {
      colorMode: 'dark',
      tokens: {
        colors: {
          background: {
            primary: { value: '#ffffff' },
            secondary: { value: '#1e293b' },
          },
          font: {
            primary: { value: '#030303' },
          },
        },
        components: {
          button: {
            primary: {
              backgroundColor: { value: '#facc15' },
              color: { value: '#000000' },
            },
          },
          field: {
            label: {
              color: { value: '#030303' },
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
      <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '5em' }}>hero</span>
      <span
        className="text-gray-500 font-semibold mr-1"
        style={{ position: 'relative', display: 'inline-block', fontSize: '5em' }}
      >
        <span>au</span>
        <sub
          style={{
            position: 'absolute',
            left: 110,
            bottom: '0.4em',
            fontSize: '0.6em',
            color: '#6b7280',
          }}
        >
          app
        </sub>
        <span>dit</span>
      </span>
    </div>
  );
}

// ✅ This safely uses the context AFTER provider is mounted
function CustomFormFields() {
  const { clientNames } = useClientContext();

  return (
    <>
      <Authenticator.SignUp.FormFields />
      <SelectField
        label="Company"
        name="custom:Company"
        placeholder="Select a company"
        isRequired={true}
      >
        {clientNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </SelectField>
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>HeroAuditApp</title>
        <meta name="theme-color" content="#facc15" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {/* ✅ Wrap your whole app in the ClientProvider */}
        <ClientProvider>
          <NextTopLoader />
          <RouteLoader />
          <AmplifyThemeProvider theme={theme} colorMode={colorMode}>
            <DesignerContextProvider>
              <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="h-screen flex items-center justify-center">
                  <Authenticator
                    components={{
                      Header: CustomHeader,
                      SignUp: {
                        FormFields: CustomFormFields,
                      },
                    }}
                  >
                    {children}
                    <Toaster />
                  </Authenticator>
                </div>
              </NextThemeProvider>
            </DesignerContextProvider>
          </AmplifyThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
