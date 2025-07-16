export interface Project {
  projectid: number;
  projectname: string;
  projectcode: string;
  clientid: number;
  clientname: string;
}

export interface ClientContextType {
  projects: Project[];
  loading: boolean;
  error?: string;
  clientMap: Record<number, string>; // clientid → clientname
}

export type ClientData = {
  id: string;
  name: string;
  code: string;
};

export type Client = {
  id: string | null;
  ClientName: string | null;
  ClientCode: string | null;
  createdAt?: string;
  updatedAt?: string;
  __typename?: string;
};

export type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  error?: string;
};