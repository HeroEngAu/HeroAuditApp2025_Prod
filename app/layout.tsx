'use client';

import "./globals.css";
import { ReactNode } from "react";
import {
  ThemeProvider as AmplifyThemeProvider,
  Theme,
  ColorMode,
  Authenticator,
  SelectField,
} from "@aws-amplify/ui-react";
import DesignerContextProvider from "../components/context/DesignerContextProvider";
import { ThemeProvider as NextThemeProvider } from "../components/providers/ThemeProvider";
import { Toaster } from "../components/ui/toaster";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);
const inter = Inter({ subsets: ["latin"] });

const colorMode: ColorMode = "dark";

const theme: Theme = {
  name: "custom-auth-theme",
  overrides: [
    {
      colorMode: "dark",
      tokens: {
        colors: {
          background: {
            primary: { value: "#ffffff" },
            secondary: { value: "#1e293b" },
          },
          font: {
            primary: { value: "#030303" },
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
      <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '5em' }}>hero</span>
      <span className="text-gray-500 font-semibold" style={{ position: 'relative', fontSize: '5em' }}>
        <span>au</span>
        <sub style={{ position: 'absolute', left: 110, bottom: '0.4em', fontSize: '0.6em', color: '#6b7280' }}>
          app
        </sub>
        <span>dit</span>
      </span>
    </div>
  );
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
                <Authenticator
                  components={{
                    Header: CustomHeader,
                    SignUp: {
                      FormFields() {
                        return (
                          <>
                            <Authenticator.SignUp.FormFields />
                            <SelectField
                              label="Company"
                              name="custom:Company"
                              placeholder="Select a company"
                              isRequired={true}
                            >
                              <option value="29M (Golden Grove)">29M (Golden Grove)</option>
                              <option value="ABB">ABB</option>
                              <option value="AddEnergy">AddEnergy</option>
                              <option value="Aerison">Aerison</option>
                              <option value="Aibel">Aibel</option>
                              <option value="Alliance Engineering Consultants">Alliance Engineering Consultants</option>
                              <option value="AME Pty Ltd">AME Pty Ltd</option>
                              <option value="AnaeCo">AnaeCo</option>
                              <option value="Apache Energy">Apache Energy</option>
                              <option value="APA Group">APA Group</option>
                              <option value="Armstrong Engineering">Armstrong Engineering</option>
                              <option value="Austar Gold">Austar Gold</option>
                              <option value="Ballarat Goldfields">Ballarat Goldfields</option>
                              <option value="Bateman Engineering">Bateman Engineering</option>
                              <option value="BHP Billiton Olympic Dam">BHP Billiton Olympic Dam</option>
                              <option value="BHP Billiton Worsley Alumina">BHP Billiton Worsley Alumina</option>
                              <option value="BHP Nickel West">BHP Nickel West</option>
                              <option value="BHP Petroleum and Potash">BHP Petroleum and Potash</option>
                              <option value="BIEP">BIEP</option>
                              <option value="Brikmakers">Brikmakers</option>
                              <option value="Byrnecut">Byrnecut</option>
                              <option value="Calibre Global">Calibre Global</option>
                              <option value="Carnac Project Delivery Services">Carnac Project Delivery Services</option>
                              <option value="Chevron">Chevron</option>
                              <option value="Clough">Clough</option>
                              <option value="Coogee Chemicals">Coogee Chemicals</option>
                              <option value="DynoNobel">DynoNobel</option>
                              <option value="EDG">EDG</option>
                              <option value="Empire Oil">Empire Oil</option>
                              <option value="FMG">FMG</option>
                              <option value="Fortescue Future Industries">Fortescue Future Industries</option>
                              <option value="Gilchrist Connell">Gilchrist Connell</option>
                              <option value="Great Southern Electrical Services">Great Southern Electrical Services</option>
                              <option value="Haztech Solutions">Haztech Solutions</option>
                              <option value="Hazer Group">Hazer Group</option>
                              <option value="Hitachi Zosen Inova">Hitachi Zosen Inova</option>
                              <option value="Hima">Hima</option>
                              <option value="Horizon Power">Horizon Power</option>
                              <option value="Honeywell">Honeywell</option>
                              <option value="ICONIC Water">Iconic Water</option>
                              <option value="IGO (Odysseus)">IGO (Odysseus)</option>
                              <option value="INPEX">INPEX</option>
                              <option value="IncitecPivot">IncitecPivot</option>
                              <option value="Jacobs Group">Jacobs Group</option>
                              <option value="JT Mining Electrical">JT Mining Electrical</option>
                              <option value="Kuenz">Kuenz</option>
                              <option value="Leighton Offshore">Leighton Offshore</option>
                              <option value="Lowrie Constructions">Lowrie Constructions</option>
                              <option value="Lynas">Lynas</option>
                              <option value="Maersk FPSO">Maersk FPSO</option>
                              <option value="Mineral Resources (Energy Resources)">Mineral Resources (Energy Resources)</option>
                              <option value="Modec">MODEC</option>
                              <option value="MODEC Ghana">MODEC Ghana</option>
                              <option value="Mobile Dewatering">Mobile Dewatering</option>
                              <option value="Mitsui E&P">Mitsui E&P</option>
                              <option value="Murray Engineering">Murray Engineering</option>
                              <option value="Newcrest">Newcrest</option>
                              <option value="Newmont Mining">Newmont Mining</option>
                              <option value="Northern Minerals">Northern Minerals</option>
                              <option value="Primero Group">Primero Group</option>
                              <option value="PTTEP-AA">PTTEP-AA</option>
                              <option value="PTTEP-I">PTTEP-I</option>
                              <option value="Queensland Nitrates">Queensland Nitrates</option>
                              <option value="Quattro Project Engineering">Quattro Project Engineering</option>
                              <option value="RCR Oil and Gas">RCR Oil and Gas</option>
                              <option value="RCR Positron">RCR Positron</option>
                              <option value="RioTinto Group">RioTinto Group</option>
                              <option value="Rigging Rentals (WA)">Rigging Rentals (WA)</option>
                              <option value="Sandfire Resources">Sandfire Resources</option>
                              <option value="Shaw Contracting">Shaw Contracting</option>
                              <option value="Siemens">Siemens</option>
                              <option value="Siemag-Tecberg">Siemag-Tecberg</option>
                              <option value="Simulus">Simulus</option>
                              <option value="Santos WA Energy Ltd">Santos WA Energy Ltd</option>
                              <option value="Soltec Australia">Soltec Australia</option>
                              <option value="South32">South32</option>
                              <option value="St Barbara Limited">St Barbara Limited</option>
                              <option value="ThermoFisher">ThermoFisher</option>
                              <option value="Tiwest">Tiwest</option>
                              <option value="Tianqi Lithium">Tianqi Lithium</option>
                              <option value="Triangle Energy">Triangle Energy</option>
                              <option value="TWP">TWP</option>
                              <option value="Upstream Production Solutions">Upstream Production Solutions</option>
                              <option value="Van Wyk">Van Wyk</option>
                              <option value="Wave International">Wave International</option>
                              <option value="Wesfarmers Kleenheat Gas">Wesfarmers Kleenheat Gas</option>
                              <option value="Wesfarmers LNG">Wesfarmers LNG</option>
                              <option value="Wesfarmers LPG">Wesfarmers LPG</option>
                              <option value="Woodside Energy">Woodside Energy</option>
                              <option value="Wonderware Australia">Wonderware Australia</option>
                              <option value="WorleyParsons">WorleyParsons</option>
                              <option value="Yokogawa">Yokogawa</option>
                            </SelectField>
                          </>
                        );
                      }
                    }
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
