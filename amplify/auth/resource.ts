import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
  
    // Maps to Cognito standard attribute 'email'
    email: {
      mutable: true,
      required: true,
    },

    // Maps to Cognito standard attribute 'given_name'
    givenName: {
      mutable: true,
      required: true,
    },

    // Maps to Cognito standard attribute 'locale'
    locale: {
      mutable: true,
      required: false,
    },
 
    // Maps to Cognito standard attribute 'name'
    fullname: {
      mutable: true,
      required: true,
    },

    // Maps to Cognito standard attribute 'phone_number'
    phoneNumber: {
      mutable: true,
      required: true,
    },
    
    // Maps to Cognito standard attribute 'preferred_username'
    preferredUsername: {
      mutable: true,
      required: true,
    },

    "custom:Company": {
      dataType: "String",
      mutable: true,
      maxLen: 50,
      minLen: 1,
    },
  
  },
  groups: ["viewer", "admin", "user"]
});