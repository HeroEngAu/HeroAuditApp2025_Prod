'use client';

import '../globals.css';
import Logo from '../../components/Logo';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { Authenticator, Avatar, IconsProvider } from '@aws-amplify/ui-react';
import { FiUser } from 'react-icons/fi';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { fetchAuthSession, fetchUserAttributes, signOut } from 'aws-amplify/auth';

Amplify.configure(outputs);

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

function Layout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('User');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  type ErrorWithMessage = {
  message: string;
};

useEffect(() => {
  async function loadAttributes() {
    try {
      const attrs = await fetchUserAttributes();

      if (attrs.name) setUserName(attrs.name);
    } catch (err) {
      const e = err as Partial<ErrorWithMessage>;
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof e.message === "string" &&
        e.message.includes("NotAuthorizedException")
      ) {
        console.log("Token inválido, redirecionando para login...");
        // Exemplo: window.location.href = '/login';
      } else {
        console.error("Failed to fetch user attributes:", err);
      }
    }
  }
  loadAttributes();
}, []);



  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const userInitials = getInitials(userName);

  return (
    <div className="flex flex-col min-h-screen min-w-full bg-background max-h-screen">
      <nav className="flex justify-between items-center border-b border-border h-[60px] px-4 py-2">
        <Logo />
        <div className="flex gap-4 items-center relative">
          <ThemeSwitcher />

          <Authenticator>
            {({ user }) => (
              <IconsProvider
                icons={{
                  avatar: {
                    user: <FiUser />,
                  },
                }}
              >
                <div ref={dropdownRef} className="relative">
                  <Avatar
                    alt={user?.username || 'User'}
                    size="small"
                    className="cursor-pointer select-none hover:bg-gray-200 hover:shadow-md transition duration-200 rounded-full"

                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {userInitials}
                  </Avatar>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-50">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </IconsProvider>
            )}
          </Authenticator>
        </div>
      </nav>

      <main className="flex w-full flex-grow">{children}</main>
    </div>
  );
}

export default Layout;
