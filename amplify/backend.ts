//amplify/backend.ts

import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from './storage/resource';
import { getProjects } from "../amplify/functions/get-projects/resource";

defineBackend({
  auth,
  data,
  storage,
  getProjects,
});
