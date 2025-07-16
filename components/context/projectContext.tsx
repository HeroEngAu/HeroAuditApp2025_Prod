import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getProjects } from '../../actions/form';
import { Project } from '../../@types/types';
import {ProjectContextType} from '../../@types/types';


export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const cachedProjects = localStorage.getItem('projects');
    if (cachedProjects) {
      setProjects(JSON.parse(cachedProjects));
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        const data = await getProjects();
        if (!Array.isArray(data)) throw new Error('Expected an array of projects');
        setProjects(data);
        localStorage.setItem('projects', JSON.stringify(data));
      } catch (err: unknown) {
        console.error('Failed to fetch projects:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
};
