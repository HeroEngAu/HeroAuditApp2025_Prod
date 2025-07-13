'use client';

import '../globals.css';
import Logo from '../../components/Logo';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { Authenticator, Avatar, IconsProvider } from '@aws-amplify/ui-react';
import { FiUser } from 'react-icons/fi';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';



Amplify.configure(outputs);

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
type ErrorWithMessage = {
  message: string;
};

function Layout({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // ✅ Load user attributes
  useEffect(() => {
    async function loadAttributes() {
      try {
        const attrs = await fetchUserAttributes();
        if (attrs.name) setUserName(attrs.name);
        if (attrs.email) setEmail(attrs.email);
        if (attrs['custom:Company']) setCompany(attrs['custom:Company']);
      } catch (err) {
        const e = err as Partial<ErrorWithMessage>;
        if (
          typeof err === 'object' &&
          err !== null &&
          'message' in err &&
          typeof e.message === 'string' &&
          e.message.includes('NotAuthorizedException')
        ) {
          console.log('Invalid Token, redirecting to login...');
          // Example: window.location.href = '/login';
        } else {
          console.error('Failed to fetch user attributes:', err);
        }
      }
    }

    loadAttributes();
  }, []);


  // ✅ Handle outside clicks for dropdown
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

  const userInitials = userName ? getInitials(userName) : '';

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
                  {userInitials && (
                    <Avatar
                      alt={user?.username || 'User'}
                      size="large"
                      className="cursor-pointer select-none hover:bg-gray-200 hover:shadow-md transition duration-200 rounded-full"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      {userInitials}
                    </Avatar>
                  )}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-100 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded shadow-lg z-50 text-sm text-gray-800 dark:text-gray-100">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                        <div className="font-medium truncate">{userName}</div>
                        <div className="text-gray-500 dark:text-gray-300 truncate">{email}</div>
                        <div className="text-gray-500 dark:text-gray-300 truncate">{company}</div>
                      </div>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
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



