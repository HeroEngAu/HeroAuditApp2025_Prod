import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource"

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
  groups: ["viewer", "admin", "user"],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup"]),
  ],
});