import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getProjects } from '../../actions/form';
import { Project } from '../../@types/types';

type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  error?: string;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const cachedProjects = localStorage.getItem('projects');

    if (cachedProjects) {
      setProjects(JSON.parse(cachedProjects));
      setLoading(false);
      return;
    }

    async function loadProjects() {
      try {
        const data = await getProjects();
        if (!Array.isArray(data)) throw new Error('Expected an array of projects');
        setProjects(data);
        localStorage.setItem('projects', JSON.stringify(data));
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
          console.error('Failed to fetch projects:', error);
        } else {
          setError('Unknown error');
          console.error('Failed to fetch projects:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};