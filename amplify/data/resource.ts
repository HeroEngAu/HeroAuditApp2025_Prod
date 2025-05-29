import { a, defineData, type ClientSchema } from "@aws-amplify/backend";


const schema = a.schema({
  Form: a
    .model({
      userId: a.string(),
      createdAt: a.datetime(),
      published: a.boolean().default(false),
      name: a.string(),
      description: a.string().default(""),
      content: a.string().default("[]"),
      visits: a.integer().default(0),
      submissions: a.integer().default(0),
      shareURL: a.string(),
      FormSubmissions: a.hasMany('FormSubmissions', 'formId'), // One-to-many relationship
      projID: a.id(),
      projects: a.belongsTo('Projectt', 'projID'),
      equipmentTAGs: a.hasMany('FormTag2', 'formID')
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Client: a
    .model({
      ClientName: a.string().required(),
      //one to many - client has many projects
      projects: a.hasMany("Projectt", "ClientID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Projectt: a
    .model({
      projectID: a.string().required(),
      projectName: a.string().required(),
      //one to many - project belongs to one client
      ClientID: a.id(),
      client: a.belongsTo("Client", "ClientID"),
      //one to many - project has many forms
      forms: a.hasMany("Form", "projID"),
      //one to many - project has many equipmentTAGs
      // equipmentTAGs: a.hasMany('EquipmentTag', 'ProjectID')
    })
    .authorization((allow) => [allow.publicApiKey()]),

  EquipmentTag2: a
    .model({
      Tag: a.string().required(),
      EquipmentName: a.string().required(),
      //many to many - equipmenttag has many forms
      forms: a.hasMany("FormTag2", "tagID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  //many to many - equipmenttag and forms
  FormTag2: a
    .model({
      formID: a.id(),
      tagID: a.id(),
      contentTest: a.string().default("[]"),
      equipmentTag: a.belongsTo("EquipmentTag2", "tagID"),
      form: a.belongsTo("Form", "formID"),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  FormSubmissions: a
    .model({
      formId: a.string(),
      createdAt: a.datetime(),
      content: a.string(),
      form: a.belongsTo("Form", "formId"),
      userId: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

 
});

// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
