// amplify/storage/resource.ts

import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'HeroAuditAppDrive',
  access: (allow) => ({
    'uploads/*': [
      allow.groups(['admin', 'user']).to(['read', 'write']),
      allow.groups(['viewer']).to(['read']),
    ],
  }),
});
