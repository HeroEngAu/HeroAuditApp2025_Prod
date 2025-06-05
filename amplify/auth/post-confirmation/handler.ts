import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

// add user to group based on email domain
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email;
  const domain = email.split('@')[1];

  let groupName = 'viewer';
  if (domain === 'heroengineering.com.au') {
    groupName = 'user';
  }

  const command = new AdminAddUserToGroupCommand({
    GroupName: groupName,
    Username: event.userName,
    UserPoolId: event.userPoolId
  });

  const response = await client.send(command);
  console.log(`Added user ${event.userName} to group '${groupName}'`);
  return event;
};
