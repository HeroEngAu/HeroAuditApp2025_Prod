"use server";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth"; // Ensure getCurrentUser is imported correctly
//import { FormDescription } from "../components/ui/form";
///import { vi } from "date-fns/locale";
//import { sub } from "date-fns";
//import { string } from 'zod';
//import { formSchemaType } from "../schemas/form";

Amplify.configure(outputs);

const client = generateClient<Schema>();

// To add a user to a group, call this function where needed (not at the top level)

/*await client.mutations.addUserToGroup({
    groupName: "ADMINS",
    userId: "89bef458-4041-7049-9e16-8fe6335c828e",
});*/

// UserNotFoundErr class for custom error handling
class UserNotFoundErr extends Error { }

export async function GetClients() {
  try {
    const { errors, data } = await client.models.Client.list();

    if (errors) {
      console.error("Error:", errors);
      throw new Error("Failed to fetch clients.");
    }

    // Extract client names and client IDs
    const clientNames = data.map((client) => client.ClientName);
    const clientIDs = data.map((client) => client.id);

    // Return both client names and IDs in an object or an array
    return {
      clientNames,
      clientIDs,
    };

    // Alternatively, if you want to return an array:
    // return [clientNames, clientIDs];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
// Cria um novo Client
export async function CreateClient(clientName: string) {
  try {
    const { errors, data } = await client.models.Client.create({
      ClientName: clientName,
    });

    if (errors) {
      console.error("Error creating client:", errors);
      throw new Error("Failed to create client.");
    }

    return data; // Retorna o client criado (objeto completo)
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

/*CreateClient("Test Client")
  .then((result) => {
    console.log("Client created:", result);
  })
  .catch((error) => {
    console.error("Error creating client:", error);
  });*/

// Cria um novo Projectt vinculado a um Client existente
export async function CreateProject(
  projectID: string,
  projectName: string,
  clientID: string
) {
  try {
    const { errors, data } = await client.models.Projectt.create({
      projectID,
      projectName,
      ClientID: clientID, // chave estrangeira para o Client
    });

    if (errors) {
      console.error("Error creating project:", errors);
      throw new Error("Failed to create project.");
    }

    return data; // Retorna o projeto criado (objeto completo)
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

/*CreateProject("TestProjectID", "Test Project", "6c396914-52b6-43b0-90c8-67cd8d4109ff")
  .then((result) => {
    console.log("Project created:", result);
  })
  .catch((error) => {
    console.error("Error creating project:", error);
  });*/

export async function GetProjects() {
  try {
    const { errors, data } = await client.models.Projectt.list();

    if (errors) {
      console.error("Error:", errors);
      throw new Error("Failed to fetch projects.");
    }

    // Separate projectIDs and projectNames
    const projectIDs = data.map((project) => project.projectID); // List of all projectIDs
    const projectNames = data.map((project) => project.projectName); // List of all projectNames

    // Return both separately
    return { projectIDs, projectNames };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

/*export async function GetFormStats() {
  try {
    // Fetch all forms
    const { data: forms, errors } = await client.models.Form.list();

    if (errors) {
      console.error(errors);
      return { visits: 0, submissions: 0, submissionRate: 0, bounceRate: 0 };
    }

    const visits = forms.reduce((sum, form) => sum + (form.visits || 0), 0);
    const submissions = forms.reduce(
      (sum, form) => sum + (form.submissions || 0),
      0,
    );

    let submissionRate = 0;
    if (visits > 0) {
      submissionRate = (submissions / visits) * 100;
    }

    const bounceRate = 100 - submissionRate;

    return {
      visits,
      submissions,
      submissionRate,
      bounceRate,
    };
  } catch (error) {
    console.error("Error fetching form stats:", error);
    return { visits: 0, submissions: 0, submissionRate: 0, bounceRate: 0 };
  }
}*/

export async function GetForms() {
  try {

    const { data: forms, errors } = await client.models.Form.list();

    if (errors) {
      console.error(errors);
      return [];
    }
    //console.log("Forms:", forms);
    return forms;

  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
}


export async function GetFormById(id: string) {
  try {
    const { data: form, errors } = await client.models.Form.get({ id });

    if (errors) {
      console.error(errors);
      return null;
    }

    if (!form) {
      throw new Error("Form not found.");
    }

    let projectName = null;
    let clientName = null;

    if (form.projID) {
      const { data: projectData, errors: projectErrors } = await client.models.Projectt.list({
        filter: { projectID: { eq: form.projID } },
      });

      if (projectErrors) {
        console.error(projectErrors);
      }

      const project = projectData?.[0];
      if (project) {
        projectName = project.projectName;

        if (project.ClientID) {
          const { data: clientData, errors: clientErrors } = await client.models.Client.get({
            id: project.ClientID,
          });

          if (clientErrors) {
            console.error(clientErrors);
          }

          if (clientData) {
            clientName = clientData.ClientName;
          }
        }
      }
    }
    return {
      form,
      projectName,
      clientName,
      shareURL: form.shareURL,
      visits: form.visits ?? 0,
      submissions: form.submissions ?? 0,
      FormDescription: form.description,
      revision: form.revision ?? 0,
    };
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    return null;
  }
}


export async function UpdateFormContent(id: string, content: any) {
  try {
    const form = {
      id,
      content,
    };

    const { data: updatedForm, errors } = await client.models.Form.update(form);

    if (errors) {
      console.error(errors);
      throw new Error("Failed to update form content.");
    }

    return updatedForm;
  } catch (error) {
    console.error("Error updating form content:", error);
    throw new Error("Failed to update form content.");
  }
}

// Define your server-side action
export async function saveFormAction(formData: FormData) {
  const id = formData.get("id") as string;
  const content = formData.get("content") as string;

  // Call your existing server-side function (UpdateFormContent)
  await UpdateFormContent(id, content);
}


export async function PublishForm(userId: string, id: string, content: string, shareURL: string) {
  try {
    const { data: currentForm, errors: fetchErrors } = await client.models.Form.get({ id });

    if (fetchErrors || !currentForm) {
      console.error(fetchErrors);
      throw new Error("Failed to fetch current form.");
    }

    const isAlreadyPublished = currentForm.published === true;
    const currentRevision = currentForm.revision ?? 0;
    const newRevision = isAlreadyPublished ? currentRevision + 1 : currentRevision;

    const form = {
      id: id,
      content: content,
      shareURL: shareURL,
      userId: userId,
      published: true,
      revision: newRevision,
    };

    const { data: updatedForm, errors } = await client.models.Form.update(form);

    if (errors) {
      console.error(errors);
      throw new Error("Failed to publish the form.");
    }

    return updatedForm;
  } catch (error) {
    console.error("Error publishing form:", error);
    throw new Error("Failed to publish the form.");
  }
}

export async function publishFormAction(formData: FormData) {
  const incomingUserId = formData.get("userId") as string;
  const id = formData.get("id") as string;
  const content = formData.get("content") as string;
  const shareURL = formData.get("shareURL") as string;

  const { data: existingForm, errors } = await client.models.Form.get({ id });

  if (errors || !existingForm) {
    console.error(errors);
    throw new Error("Failed to fetch existing form.");
  }

  const userId = existingForm.userId || incomingUserId;

  await PublishForm(userId, id, content, shareURL);
}

export async function GetFormContentByUrl(formUrl: string) {
  try {
    const formURL = formUrl.startsWith("/submit/") ? formUrl : `/submit/${formUrl}`;

    const { data: forms, errors } = await client.models.Form.list({
      filter: { shareURL: { eq: formURL } },
    });

    if (errors || !forms || forms.length === 0) {
      throw new Error("Form not found.");
    }

    return forms[0];
  } catch (error) {
    console.error("Error fetching form content by URL:", error);
    throw new Error("Error fetching form content by URL.");
  }
}

export async function updateVisitCount(formUrl: string) {
  try {
    const { data: forms } = await client.models.Form.list({
      filter: { shareURL: { eq: `/submit/${formUrl}` } },
    });

    if (forms && forms.length > 0) {
      const form = forms[0];
      const updatedVisits = (form.visits ?? 0) + 1;

      await client.models.Form.update({
        id: form.id,
        visits: updatedVisits,
      });
    }
  } catch (error) {
    console.error("Failed to update visit count:", error);
  }
}

export async function SubmitForm(userId: string, formId: string, tagId: string, content: string) {
  const submission = {
    userId,
    formId,
    content,
    createdAt: new Date().toISOString(),
  };

  const { data: submissionData } = await client.models.FormSubmissions.create(submission);

  if (!submissionData?.id) throw new Error("Error to create the submssion");

  const submissionId = submissionData.id;

  const { data: formList } = await client.models.Form.list({
    filter: { id: { eq: formId } },
  });

  const form = formList[0];
  await client.models.Form.update({
    id: form.id,
    submissions: (form.submissions || 0) + 1,
  });

  const { data: formTags } = await client.models.FormTag2.list({
    filter: {
      tagID: { eq: tagId },
      formID: { eq: formId },
    },
  });

  if (!formTags.length) throw new Error("FormTag2 not found");

  await client.models.FormTag2.update({
    id: formTags[0].id,
    contentTest: submissionId,
  });

  return submissionData;
}


export async function submitFormAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const formId = formData.get("formId") as string;
  const formtagId = formData.get("formtagID") as string;
  const rawResponses = formData.get("responses") as string;
  const rawFormContent = formData.get("formContent") as string;

  let tagId = formData.get("tagId") as string;

  if (!tagId && formId && formtagId) {
    const fetchedTagId = await GetTagIDWithFormIdandFormTagID(formId, formtagId);
    if (fetchedTagId) {
      tagId = fetchedTagId;
    } else {
      throw new Error("Tag ID could not be retrieved.");
    }
  }
  const submission = {
    responses: JSON.parse(rawResponses),
    formContent: JSON.parse(rawFormContent),
    submittedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(submission);
  await SubmitForm(userId, formId, tagId, jsonContent);
}



export async function GetFormWithSubmissions(id: string) {
  try {
    const { data: form, errors } = await client.models.Form.get({ id });

    if (errors) {
      console.error(errors);
      return null;
    }

    if (form) {
      const { data: submissions, errors: submissionErrors } =
        await client.models.FormSubmissions.list({
          filter: { formId: { eq: form.id } },
        });

      if (submissionErrors) {
        console.error(submissionErrors);
      }

      return { form, submissions };
    }

    throw new Error("Form not found.");
  } catch (error) {
    console.error("Error fetching form with submissions:", error);
    throw new Error("Failed to fetch form with submissions.");
  }
}


export async function deleteFormSubmissionCascade(formSubmissionId: string) {
  try {
    //console.log("Deleting form submission with ID:", formSubmissionId);
    const formTag = await findFormTagBySubmissionId(formSubmissionId);

    if (!formTag) {
      throw new Error("No formTag2 found for this submissionId.");
    }

    const formTag2Id = formTag.id;
    const tagID = formTag.tagID;

    await deleteFormTag2(formTag2Id);

    if (tagID) {
      await deleteEquipmentTag2(tagID);
    }

    await deleteFormSubmission(formSubmissionId);

    //console.log("Cascade deletion completed.");
  } catch (error) {
    console.error("Cascade deletion failed:", error);
    throw error;
  }
}

export async function deleteForm(id: string) {
  try {
    const { errors } = await client.models.Form.delete({ id });
    if (errors) {
      console.error(errors);
      throw new Error("Error deleting form.");
    }
  } catch (error) {
    console.error("Error deleting form:", error);
    throw new Error("Failed to delete form.");
  }
}

export async function deleteFormSubmission(id: string) {
  try {
    const { errors } = await client.models.FormSubmissions.delete({ id });
    if (errors) {
      console.error(errors);
      throw new Error("Error deleting form submission.");
    }
  } catch (error) {
    console.error("Error deleting form submission:", error);
    throw new Error("Failed to delete form submission.");
  }
}

export async function deleteFormTag2(id: string) {
  try {
    const { errors } = await client.models.FormTag2.delete({ id });
    if (errors) {
      console.error(errors);
      throw new Error("Error deleting formTag2.");
    }
  } catch (error) {
    console.error("Error deleting formTag2:", error);
    throw new Error("Failed to delete formTag2.");
  }
}

export async function deleteEquipmentTag2(id: string) {
  try {
    const { errors } = await client.models.EquipmentTag2.delete({ id });
    if (errors) {
      console.error(errors);
      throw new Error("Error deleting equipmentTag2.");
    }
  } catch (error) {
    console.error("Error deleting equipmentTag2:", error);
    throw new Error("Failed to delete equipmentTag2.");
  }
}

export async function findFormTagBySubmissionId(submissionId: string) {
  try {
    const { data, errors } = await client.models.FormTag2.list({
      filter: {
        contentTest: { contains: submissionId },
      },
    });
    //console.log("FormTag2 Data:", data); // Debugging
    if (errors) {
      console.error(errors);
      throw new Error("Error fetching FormTag2.");
    }

    return data?.[0];
  } catch (error) {
    console.error("Error finding FormTag2:", error);
    throw new Error("Failed to find FormTag2.");
  }
}

export async function GetSubmissionWithTagInfo(submissionId: string) {

  const submissionResponse = await client.models.FormSubmissions.get({ id: submissionId });


  const submission = submissionResponse.data;
  if (!submission) {
    throw new Error("FormSubmission not found.");
  }

  const formId = submission.formId;
  if (!formId) {
    throw new Error("formId not found in submissions.");
  }

  const formTagsResponse = await client.models.FormTag2.list({
    filter: {
      contentTest: { contains: submissionId },
    }
  });


  if (!formTagsResponse.data.length) {
    throw new Error("FormTag2 not found with the associated contentTest.");
  }

  const formTag = formTagsResponse.data[0];

  const equipmentTagResponse = await client.models.EquipmentTag2.get({
    id: formTag.tagID ?? "",
  });

  if (!equipmentTagResponse.data) {
    throw new Error("EquipmentTag2 not found.");
  }

  return {
    formId: formId,
    submissionId: submission.id,
    submittedAt: submission.createdAt,
    equipmentName: equipmentTagResponse.data.EquipmentName ?? "No name",
    tag: equipmentTagResponse.data.Tag ?? "No tag",
  };
}

export async function GetFormWithSubmissionDetails(id: string) {
  try {
    const { data: form, errors: formErrors } = await client.models.Form.get({ id });
    if (formErrors || !form) {
      console.error(formErrors || "Form not found.");
      return null;
    }

    const { data: formTags, errors: tagErrors } = await client.models.FormTag2.list({
      filter: { formID: { eq: form.id } },
    });
    if (tagErrors) {
      console.error(tagErrors);
      return null;
    }

    const { data: submissions, errors: submissionErrors } = await client.models.FormSubmissions.list({
      filter: { formId: { eq: form.id } },
    });
    if (submissionErrors) {
      console.error(submissionErrors);
      return null;
    }

    const submissionDetails = await Promise.all(
      formTags.map(async (tag) => {
        const contentTestIds = tag.contentTest?.split(",").map((s) => s.trim()) || [];

        // Check if any submission.id is present in contentTest
        const matchedSubmission = submissions.find((submission) =>
          contentTestIds.includes(submission.id)
        );

        const equipmentTagResponse = await client.models.EquipmentTag2.get({
          id: tag.tagID ?? "",
        });

        const equipmentTag = equipmentTagResponse.data;

        const formStatus = matchedSubmission ? "submitted" : "not submitted";
        const buttonText = matchedSubmission ? "View Form" : "Resume Form";

        return {
          formId: form.id,
          submissionId: matchedSubmission?.id ?? null,
          submittedAt: matchedSubmission?.createdAt ?? null,
          equipmentName: equipmentTag?.EquipmentName ?? "No Equipment Name",
          tag: equipmentTag?.Tag ?? "No Equipment Tag",
          contentTest: contentTestIds,
          formtagId: tag.id,
          formStatus,
          buttonText,
        };
      })
    );

    return {
      form,
      submissions: submissionDetails,
    };
  } catch (error) {
    console.error("Error fetching form with submission details:", error);
    throw new Error("Failed to fetch form and submission details.");
  }
}


export async function getMatchingFormSubmissions(submissionId: string) {
  try {
    // Fetch form tags where contentTest contains the submissionId
    const { data: formSubmitted, errors } = await client.models.FormTag2.list({
      filter: { contentTest: { contains: submissionId } },
    });

    if (errors) {
      console.error("Error fetching form submissions:", errors);
      return null;
    }
    //console.log("Form Submitted:", formSubmitted); // Debugging
    // Return the first matching FormTag2 ID or null if no match found
    return formSubmitted.length > 0 ? formSubmitted[0].id : null;
  } catch (error) {
    console.error("Error in getMatchingFormSubmissions:", error);
    return null;
  }
}

export async function ResumeTest(formTagId: string) {
  try {
    const { data: formTag, errors } = await client.models.FormTag2.get({ id: formTagId });

    if (errors || !formTag) {
      console.error("Error fetching formTag2:", errors);
      return null;
    }

    // Assuming formTag.contentTest holds the content in the correct format
    const contentTest = formTag.contentTest;

    if (!contentTest) {
      console.error("No contentTest found in formTag.");
      return null;
    }

    const parsedContent = JSON.parse(contentTest); // Parse the contentTest to get formContent and responses
    const responses = parsedContent.responses;
    const elements = parsedContent.formContent;

    // Extract formId from formTag
    const formId = formTag.formID;

    return {
      formId,  // Include formId in the return
      elements,  // form elements
      responses, // form responses
    };
  } catch (error) {
    console.error("Error in ResumeTest:", error);
    return null;
  }
}


export async function GetFormSubmissionById(submissionId: string) {

  try {
    const { data: content, errors } = await client.models.FormSubmissions.get({ id: submissionId });
    if (errors) {
      console.error("Error fetching form:", errors);
      return null;
    }
    if (!content) {
      throw new Error("Content not found.");
    }
    return content;
  } catch (error) {
    console.error("Error in GetFormSubmissionById:", error);
    return null;
  }

}
export async function GetEquipmentTagsForForm(id: string) {
  try {
    // Fetch the form data
    const { data: form, errors } = await client.models.Form.get({ id });

    if (errors) {
      console.error("Error fetching form:", errors);
      return null;
    }

    if (!form) {
      throw new Error("Form not found.");
    }

    // Fetch equipment tags related to the form
    const { data: equipmentTags, errors: equipmentTagsErrors } =
      await client.models.FormTag2.list({
        filter: { formID: { eq: form.id } },
      });

    if (equipmentTagsErrors) {
      console.error("Error fetching equipment tags:", equipmentTagsErrors);
      return null;
    }

    if (!equipmentTags || equipmentTags.length === 0) {
      //console.log("No equipment tags found.");
      return { form, equipmentTags: [] };
    }

    // Fetch related equipment details for each tag
    const equipmentDetails = await Promise.all(
      equipmentTags.map(async (tag) => {
        // Ensure that tag.tagID is valid before making the API call
        const equipmentTag = tag.tagID ? await client.models.EquipmentTag2.get({ id: tag.tagID }) : null;

        if (equipmentTag) {
          return equipmentTag;
        } else {
          console.error("Invalid tagID:", tag.tagID);
          return null;
        }
      })
    );

    return { form, equipmentTags: equipmentDetails.filter(tag => tag !== null) };

  } catch (error) {
    console.error("Error fetching equipment tags for form:", error);
    return null;
  }
}


export async function GetClientWithProjects(ClientID: string) {
  try {
    const { errors, data } = await client.models.Client.get({ id: ClientID });

    if (errors || !client) {
      console.error("Error fetching client:", errors);
      throw new Error("Client not found.");
    }

    // Fetch all projects related to this client
    const { data: projects, errors: projectErrors } =
      await client.models.Projectt.list({
        filter: { ClientID: { eq: ClientID } },
      });

    if (projectErrors) {
      console.error("Error fetching projects:", projectErrors);
    }

    return { ...data, projects };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function GetFormsWithClient(ClientID: string) {
  const { userId } = await getCurrentUser();
  if (!userId) {
    throw new UserNotFoundErr();
  }

  try {
    // Fetch projects linked to the ClientID
    const { data: projects, errors: projectErrors } =
      await client.models.Projectt.list({
        filter: { ClientID: { eq: ClientID } },
      });
    //console.log("Projects Found:", projects);
    if (projectErrors || !projects || projects.length === 0) {
      console.error(projectErrors || "No projects found for this client.");
      throw new Error("No projects found for this client.");
    }

    // Fetch forms for each project
    const forms = await Promise.all(
      projects.map(async (project) => {
        const { data: projectForms } = await client.models.Form.list({
          filter: { projID: { eq: project.projectID } },
        });
        
        //console.log("Project ID:", project.projectID);
        //console.log(`Forms for Project ${project.projectName}:`, projectForms);

        return projectForms.map((form) => ({
          ...form,
          projectName: project.projectName,
        }));
      }),
    );

    return forms.flat();
  } catch (error) {
    console.error("Error fetching forms with client:", error);
    throw new Error("Failed to fetch forms for the client.");
  }
}

export async function GetFormsInformation(userId: string, group: string, company: string) {
  try {
    const { errors: clientErrors, data: clientsData } = await client.models.Client.list();

    if (clientErrors) {
      console.error("Error:", clientErrors);
      throw new Error("Failed to fetch clients.");
    }

    const results = [];

    for (const clientItem of clientsData) {
      if (group === "viewer" && clientItem.ClientName !== company) continue;

      const { errors: projectErrors, data: projectsData } = await client.models.Projectt.list({
        filter: { ClientID: { eq: clientItem.id } },
      });

      if (projectErrors) {
        console.error("Error:", projectErrors);
        throw new Error("Error fetching projects");
      }

      for (const projectItem of projectsData) {
        let formFilter: any = {
          projID: { eq: projectItem.projectID },
        };

        if (group === "user") {
          formFilter.userId = { eq: userId };
        }

        const { errors: formErrors, data: formsData } = await client.models.Form.list({
          filter: formFilter,
        });

        if (formErrors) {
          console.error("Error:", formErrors);
          throw new Error("Error fetching forms");
        }

        if (formsData.length > 0) {
          results.push({
            clientName: clientItem.ClientName,
            projectName: projectItem.projectName,
            projectID: projectItem.projectID,
            forms: formsData.map((form) => ({
              id: form.id,
              name: form.name,
              description: form.description,
              published: form.published,
              content: form.content,
              createdAt: form.createdAt,
              visits: form.visits,
              submissions: form.submissions,
            })),
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
}

/*const formsInfo = await GetFormsInformation()
console.log('Form Info:', formsInfo);*/

export async function GetProjectsFromClientName(ClientName: string) {
  try {
    const { errors, data: clientData } = await client.models.Client.list({
      filter: { ClientName: { eq: ClientName } },
    });

    if (errors || clientData.length === 0) {
      console.error("Error fetching client or client not found:", errors);
      throw new Error("Client not found.");
    }

    const clientInfo = clientData[0];

    const { data: projects, errors: projectErrors } = await client.models.Projectt.list({
      filter: { ClientID: { eq: clientInfo.id } },
    });

    if (projectErrors) {
      console.error("Error fetching projects:", projectErrors);
    }

    const projectList = projects.map(
      (project) => `${project.projectName} (${project.projectID})`
    );

    return { projectList };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}


export async function CreateForm(
  name: string,
  description: string,
  fullProjectName: string,
  userId: string,
) {

  const projectName = fullProjectName.split(" (")[0];

  const { errors: projectErrors, data: projectsData } =
    await client.models.Projectt.list({
      filter: { projectName: { eq: projectName } },
    });
    
  if (projectErrors) {
    console.error("Error fetching projects:", projectErrors);
    throw new Error("Failed to fetch projects.");
  }

  if (projectsData.length === 0) {
    throw new Error(`Project with name "${projectName}" not found.`);
  }

  const projID = projectsData[0].projectID;

  const { errors: formerrors, data: form } = await client.models.Form.create({
    projID: projID,
    name: name,
    description: description,
    userId: userId,
  });

  if (formerrors) {
    console.error("Error creating form:", formerrors);
    throw new Error("Something went wrong while creating the form");
  }

  return {
    formId: form?.id,
    projID: projID,
  };
}


export const runForm = async (
  formUrl: string,
  EquipName: string,
  EquipTag: string,
): Promise<{
  success: boolean;
  createdTagID?: string;
  tagCreatedAt?: string;
}> => {
  try {
    const formResp = await GetFormContentByUrl(formUrl);

    if (!formResp) {
      console.error("Form not found with the provided TestName and ProjectID");
      return { success: false };
    }

    const form = formResp;

    const existingTagResp = await client.models.EquipmentTag2.list({
      filter: {
        Tag: { eq: EquipTag },
        EquipmentName: { eq: EquipName },
      },
    });

    const existingTag = existingTagResp.data?.[0];

    let tagID: string;
    let tagCreatedAt: string | undefined = undefined;

    if (existingTag) {
      const linkedFormResp = await client.models.FormTag2.list({
        filter: {
          tagID: { eq: existingTag.id },
          formID: { eq: form.id },
        },
      });

      if (linkedFormResp.data?.length > 0) {
        console.error("This equipment and tag are already associated with this form and project.");
        alert("Error: This equipment and tag are already associated with this form and project.");
        return { success: false };
      }

      tagID = existingTag.id;
    } else {
      const createResp = await client.models.EquipmentTag2.create({
        Tag: EquipTag,
        EquipmentName: EquipName,
      });

      if (!createResp.data) {
        console.error("Failed to create EquipmentTag");
        return { success: false };
      }

      tagID = createResp.data.id;
      tagCreatedAt = new Date(createResp.data.createdAt).toISOString().split("T")[0];
    }

    const formTagResp = await client.models.FormTag2.create({
      formID: form.id,
      tagID,
    });

    if (!formTagResp.data) {
      console.error("Failed to create FormTag");
      return { success: false };
    }

    return { success: true, createdTagID: tagID, tagCreatedAt };
  } catch (error) {
    console.error("Error executing runForm:", error);
    return { success: false };
  }
};

export async function GetFormsByClientName(ClientName: string) {
  // 1. Fetch the Client ID
  const clientResult = await client.models.Client.list({
    filter: { ClientName: { eq: ClientName } },
  });

  const clientData = clientResult.data?.[0];
  if (!clientData) return [];

  const clientID = clientData.id;

  // 2. Fetch all Projects with the corresponding ClientID
  const projectsResult = await client.models.Projectt.list({
    filter: { ClientID: { eq: clientID } },
  });

  const projects = projectsResult.data;
  if (!projects.length) return [];

  const projectIDs = projects.map((project) => project.projectID);

  // 3. Fetch all Forms for the found projects
  const allForms = await Promise.all(
    projectIDs.map(async (projectID) => {
      const formsResult = await client.models.Form.list({
        filter: { projID: { eq: projectID } },
      });

      const forms = formsResult.data;
      const formIDs = forms.map((form) => form.id);

      const formDetailsWithEquipment = await Promise.all(
        formIDs.map(async (formId) => {
          const { data: formTags, errors: formTagsErrors } =
            await client.models.FormTag2.list({
              filter: { formID: { eq: formId } },
            });

          if (formTagsErrors) {
            console.error(
              `Error fetching form tags for form ID ${formId}:`,
              formTagsErrors,
            );
            return null;
          }

          const tagIDs = formTags.map((tag) => tag.tagID);

          const equipmentAndTags = await Promise.all(
            tagIDs.map(async (tagID) => {
              const { data: equipmentData, errors: equipmentErrors } =
                await client.models.EquipmentTag2.list({
                  filter: tagID ? { id: { eq: tagID } } : undefined,
                });

              if (equipmentErrors) {
                console.error(
                  `Error fetching equipment for tagID ${tagID}:`,
                  equipmentErrors,
                );
                return null;
              }

              return equipmentData.map((equipment) => ({
                equipmentName: equipment.EquipmentName,
                equipmentTag: equipment.Tag,
                tagCreatedAt: new Date(equipment.createdAt)
                  .toISOString()
                  .split("T")[0],
              }));
            }),
          );

          const formData = forms.find((form) => form.id === formId);
          return {
            clientName: clientData.ClientName,
            projectName: projects.find(
              (project) => project.projectID === projectID,
            )?.projectName,
            projectID,
            formName: formData?.name,
            equipment: equipmentAndTags.flat(),
            submission: formData?.submissions || 0,
            description: formData?.description,
            formId: formId,
          };
        }),
      );

      return formDetailsWithEquipment.filter((detail) => detail !== null);
    }),
  );

  const flattenedForms = allForms.flat();

  return flattenedForms.map((formDetail) => ({
    clientName: formDetail.clientName,
    projectName: formDetail.projectName,
    projectID: formDetail.projectID,
    formID: formDetail.formId,
    formName: formDetail.formName,
    description: formDetail.description,
    equipmentDetails: formDetail.equipment.map((equipment) => ({
      equipmentName: equipment?.equipmentName || "Unknown",
      equipmentTag: equipment?.equipmentTag || "Unknown",
      tagCreatedAt: equipment?.tagCreatedAt || "Unknown",
    })),
    submission: formDetail.submission,
  }));
}

export async function SaveFormAfterTest(
  FormID: string,
  TagID: string,
  content: string,
) {
  try {
    const { data: formTags, errors } = await client.models.FormTag2.list({
      filter: {
        formID: { eq: FormID },
        tagID: { eq: TagID },
      },
    });

    if (errors) {
      console.error("Error:", errors);
      return;
    }

    const formTagToUpdate = formTags[0];

    if (!formTagToUpdate) {
      console.error("Nothing found for this formID and tagID");
      return;
    }

    const updated = await client.models.FormTag2.update({
      id: formTagToUpdate.id,
      contentTest: content,
    });

    //console.log("Updated:", updated);
    return updated;
  } catch (err) {
    console.error("Error SaveFormAfterTest:", err);
  }
}

export async function SaveFormAfterTestAction(formData: FormData) {
  const formId = formData.get("formId") as string;
  const formtagId = formData.get("formtagID") as string;
  const rawResponses = formData.get("responses") as string;
  const rawFormContent = formData.get("formContent") as string;


  let tagId = formData.get("tagId") as string;

  if (!tagId && formId && formtagId) {
    const fetchedTagId = await GetTagIDWithFormIdandFormTagID(formId, formtagId);
    if (fetchedTagId) {
      tagId = fetchedTagId;
    } else {
      throw new Error("Tag ID could not be retrieved.");
    }
  }

  const submission = {
    responses: JSON.parse(rawResponses),
    formContent: JSON.parse(rawFormContent),
  };

  const jsonContent = JSON.stringify(submission);
  await SaveFormAfterTest(formId, tagId, jsonContent);
}


export async function GetTagIDWithFormIdandFormTagID(formId: string, formtagID: string): Promise<string | null> {
  try {
    const { data, errors } = await client.models.FormTag2.list({
      filter: {
        formID: { eq: formId },
        id: { eq: formtagID },
      },
    });

    if (errors) {
      console.error("Error:", errors);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn("No matching FormTag2 found");
      return null;
    }

    return data[0].tagID || null;
  } catch (err) {
    console.error("Error GetTagIDWithFormIdandFormTagID:", err);
    return null;
  }
}

export async function getContentByFormIDandTagID(
  FormID: string,
  TagID: string,
) {
  try {
    const { data: formTags, errors } = await client.models.FormTag2.list({
      filter: {
        formID: { eq: FormID },
        tagID: { eq: TagID },
      },
    });

    if (errors) {
      console.error("Error:", errors);
      return;
    }

    const formTag = formTags[0];

    if (!formTag) {
      console.error("Nothing found for this formID and tagID");
      return;
    }

    const content = formTag.contentTest;

    //console.log("Fetched content:", content);
    return content;
  } catch (err) {
    console.error("Error getContentByFormIDandTagID:", err);
  }
}

export async function getEquipmentTagID(
  equipmentName: string,
  equipmentTag: string,
) {
  try {
    // Query to fetch equipment by its name and tag
    const { data, errors } = await client.models.EquipmentTag2.list({
      filter: {
        EquipmentName: { eq: equipmentName },
        Tag: { eq: equipmentTag },
      },
    });

    // Check for errors
    if (errors) {
      console.error("Error fetching equipment tag:", errors);
      return;
    }

    // Check if data exists
    const equipmentTagData = data[0]; // Assuming the first entry matches the search
    if (!equipmentTagData) {
      console.error("No matching equipment found for given name and tag.");
      return;
    }

    // Return the equipmentTagID
    return equipmentTagData.id; // Assuming `id` is the equipmentTagID
  } catch (err) {
    console.error("Error in getEquipmentTagID:", err);
  }
}

export async function GetFormNameFromSubmissionId(FormSubmissionsId: string) {
  try {
    // Fetch the FormSubmission using the FormSubmissions ID
    const { errors, data: formSubmissionData } = await client.models.FormSubmissions.list({
      filter: { id: { eq: FormSubmissionsId } },
    });

    if (errors || formSubmissionData.length === 0) {
      console.error("Error fetching form submission or submission not found:", errors);
      throw new Error("Form submission not found.");
    }

    const formSubmission = formSubmissionData[0];
    const formId = formSubmission.formId;

    if (!formId) {
      throw new Error("Form ID not found in submission.");
    }

    // Fetch the Form using the formId
    const { data: formData, errors: formErrors } = await client.models.Form.list({
      filter: { id: { eq: formId } },
    });

    if (formErrors) {
      console.error("Error fetching form:", formErrors);
      throw new Error("Form not found.");
    }

    if (formData.length === 0) {
      throw new Error("Form not found.");
    }

    const form = formData[0];
    const formName = form.name ?? null;
    const revision = form.revision ?? 0;

    return { formName, revision };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}


export async function GetFormsContent(FormSubmissionsId: string) {

  if (!FormSubmissionsId || FormSubmissionsId.trim() === "") {
    console.error("FormSubmissionsId is missing or empty.");
    throw new Error("Invalid FormSubmissionsId.");
  }

  const { data, errors } = await client.models.FormSubmissions.get({ id: FormSubmissionsId });

  if (errors || !data) {
    console.error("Error fetching form submission or submission not found:", errors);
    throw new Error("Form submission not found.");
  }

  return data.content;
}

/*import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromEnv } from "@aws-sdk/credential-providers";

const clients = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION!,
  credentials: fromEnv(),
});

export async function listUsers() {
  const command = new ListUsersCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    Limit: 50,
  });

  try {
    const { Users } = await clients.send(command);
    return Users?.map(user => {
      const email = user.Attributes?.find(attr => attr.Name === "email")?.Value || "";
      const name = user.Attributes?.find(attr => attr.Name === "name")?.Value || "";
      return { email, name };
    }).filter(user => user.email);
  } catch (err) {
    console.error("Error listing users:", err);
    return [];
  }
}*/
