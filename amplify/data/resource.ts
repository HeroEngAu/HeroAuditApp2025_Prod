import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Form: a
    .model({
      userId: a.string(),
      name: a.string(),
      description: a.string().default(""),
      content: a.string().default("[]"),
      visits: a.integer().default(0),
      submissions: a.integer().default(0),
      published: a.boolean().default(false),
      revision: a.integer().default(0),
      shareURL: a.string(),
      createdAt: a.datetime(),
      firstPublishedAt: a.datetime(),
      equipmentName: a.string(),
      equipmentTAGs: a.hasMany("FormTag", "formID"),
      FormSubmissions: a.hasMany("FormSubmissions", "formId"),

      clientID: a.id(),
      client: a.belongsTo("Client", "clientID"),

      formProjects: a.hasMany("FormProject", "formID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Client: a
    .model({
      id: a.id(),
      ClientName: a.string().required(),
      projects: a.hasMany("Project", "clientID"),
      forms: a.hasMany("Form", "clientID"),
      ClientCode: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Project: a
    .model({
      id: a.id(),
      projectName: a.string().required(),
      projectCode: a.string(),
      clientID: a.id(),
      client: a.belongsTo("Client", "clientID"),
      formProjects: a.hasMany("FormProject", "projectID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  FormProject: a
    .model({
      formID: a.id(),
      projectID: a.id(),
      form: a.belongsTo("Form", "formID"),
      project: a.belongsTo("Project", "projectID"),
      equipmentTags: a.hasMany("EquipmentTag", "formProjectID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  EquipmentTag: a
    .model({
      Tag: a.string().required(),
      forms: a.hasMany("FormTag", "tagID"),
      formProjectID: a.id(),
      formProject: a.belongsTo("FormProject", "formProjectID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  FormTag: a
    .model({
      formID: a.id(),
      tagID: a.id(),
      docNumber: a.string(),
      docNumberRevision: a.integer(),
      contentTest: a.string().default("[]"),
      equipmentTag: a.belongsTo("EquipmentTag", "tagID"),
      form: a.belongsTo("Form", "formID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  FormSubmissions: a
    .model({
      formId: a.id(),
      createdAt: a.datetime(),
      content: a.string(),
      form: a.belongsTo("Form", "formId"),
      userId: a.string(),
      formRevision: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});