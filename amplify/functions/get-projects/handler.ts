import { env } from '$amplify/env/get-projects';
import type { Handler } from 'aws-lambda';

export const handler: Handler = async () => {
  const controller = new AbortController();
  const timeout = 8000;
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    if (!env.API_KEY || !env.API_ENDPOINT) {
      throw new Error('Missing required environment variables');
    }

    const query = `
      query {
        getProjects {
          projectid
          projectname
          projectcode
          clientid
          clientname
        }
      }
    `;

    const response = await fetch(env.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.API_KEY,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error('GraphQL query failed.');
    }

    // Return serialized result
    return JSON.stringify(result.data.getProjects);
  } catch (error) {
    clearTimeout(id);
    console.error(error);
    return JSON.stringify([]); // fallback empty list
  }
};
