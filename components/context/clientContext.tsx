// context/ClientProvider.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getProjects } from '../../actions/form';
import { ClientContextType, Project } from '../../types/types';

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const cachedClientNames = localStorage.getItem('clientNames');
    const cachedProjects = localStorage.getItem('projects');

    if (cachedClientNames && cachedProjects) {
      setClientNames(JSON.parse(cachedClientNames));
      setProjects(JSON.parse(cachedProjects));
      setLoading(false);
      return;
    }

    async function loadProjects() {
      try {
        const data = await getProjects();

        if (!Array.isArray(data)) {
          throw new Error('Expected an array of projects');
        }

        setProjects(data);
        localStorage.setItem('projects', JSON.stringify(data));

        const uniqueClients = Array.from(
          new Set(data.map((p) => p.clientname))
        ).filter(Boolean);

        const sortedClients = uniqueClients.sort((a, b) =>
          a.localeCompare(b)
        );

        setClientNames(sortedClients);
        localStorage.setItem('clientNames', JSON.stringify(sortedClients));
      } catch (err: any) {
        console.error('Failed to fetch projects:', err);
        setError(err.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <ClientContext.Provider
      value={{
        clientNames,
        projects,
        loading,
        error,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within ClientProvider');
  }
  return context;
};
