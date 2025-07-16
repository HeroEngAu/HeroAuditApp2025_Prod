import { defineFunction, secret } from '@aws-amplify/backend';

export const getProjects = defineFunction({
  name: 'get-projects',
  entry: './handler.ts',
  environment: {
    API_ENDPOINT: 'https://xcnsqvquonfnta6nm6eqrcgske.appsync-api.ap-southeast-2.amazonaws.com/graphql',  
    API_KEY: secret('x-api-key'),

  },
});
