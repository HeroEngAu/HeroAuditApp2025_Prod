// types/index.ts

export interface Project {
  projectid: number;
  projectname: string;
  projectcode: string;
  clientid: number;
  clientname: string;
}

export interface ClientContextType {
  clientNames: string[];
  projects: Project[];
  loading: boolean;
  error?: string;
}

// You can continue adding more interfaces here
// export interface Form { ... }
// export interface Submission { ... }
