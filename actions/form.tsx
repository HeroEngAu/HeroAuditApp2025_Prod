"use server";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
//import { getCurrentUser } from "aws-amplify/auth"; // Ensure getCurrentUser is imported correctly
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
//class UserNotFoundErr extends Error { }

export async function GetClients() {
  try {
    const { errors, data: clients } = await client.models.Client.list();

    if (errors || !clients) {
      console.error("Error:", errors);
      throw new Error("Failed to fetch clients.");
    }

    return clients.map((c) => ({
      id: c.id ?? "",
      name: c.ClientName ?? "",
      code: c.ClientCode ?? "",
    }));

  } catch (error) {
    console.error("Error:", error);
    throw error;
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

    // Get client name using clientID
    let clientName = null;
    if (form.clientID) {
      const { data: clientData, errors: clientErrors } = await client.models.Client.get({
        id: form.clientID,
      });

      if (clientErrors) {
        console.error(clientErrors);
      }

      if (clientData) {
        clientName = clientData.ClientName;
      }
    }


    if (form.formProjects) {
      const formProjectsResult = await form.formProjects();
      const formProject = formProjectsResult.data?.[0];

      if (formProject?.projectID) {
        const { errors: projectErrors } = await client.models.Project.get({
          id: formProject.projectID,
        });

        if (projectErrors) {
          console.error(projectErrors);
        }

      }
    }

    return {
      form,
      equipmentName: form.equipmentName ?? null,
      clientName,
      shareURL: form.shareURL,
      visits: form.visits ?? 0,
      submissions: form.submissions ?? 0,
      FormDescription: form.description,
      revision: form.revision ?? 0,
      content: form.content,
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
    const isFirstPublish = !currentForm.firstPublishedAt;
    const newRevision = isFirstPublish ? 0 : (currentForm.revision ?? 0) + 1;

    const form = {
      id: id,
      content: content,
      shareURL: shareURL,
      userId: userId,
      published: true,
      revision: newRevision,
      firstPublishedAt: currentForm.firstPublishedAt, // Preserve the firstPublishedAt if it exists
    };

    if (isFirstPublish) {
      form.firstPublishedAt = new Date().toISOString();
    }

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

export async function SubmitForm(userId: string, formId: string, formtagId: string, content: string) {
  try {
    // Primeiro buscar o form para obter a revisão atual
    const { data: formList, errors: formFetchErrors } = await client.models.Form.list({
      filter: { id: { eq: formId } },
    });

    if (formFetchErrors || !formList?.length) {
      console.error("Error fetching form:", formFetchErrors);
      throw new Error("Form not found");
    }

    const form = formList[0];

    // Criar submissão com a revisão salva
    const submission = {
      userId,
      formId,
      content,
      createdAt: new Date().toISOString(),
      formRevision: form.revision, // <- aqui salva a revisão atual do form
    };

    const { data: submissionData, errors: submissionErrors } = await client.models.FormSubmissions.create(submission);

    if (submissionErrors || !submissionData?.id) {
      console.error("Error creating submission:", submissionErrors);
      throw new Error("Failed to create submission");
    }

    const submissionId = submissionData.id;

    const { errors: updateFormErrors } = await client.models.Form.update({
      id: form.id,
      submissions: (form.submissions || 0) + 1,
    });

    if (updateFormErrors) {
      console.error("Error updating form submissions:", updateFormErrors);
      throw new Error("Failed to update form submission count");
    }

    const { data: formTag, errors: formTagErrors } = await client.models.FormTag.get({ id: formtagId });

    if (formTagErrors || !formTag) {
      console.error("Error fetching FormTag by ID:", formTagErrors);
      throw new Error("FormTag not found");
    }

    const { errors: updateFormTagErrors } = await client.models.FormTag.update({
      id: formtagId,
      contentTest: submissionId,
    });

    if (updateFormTagErrors) {
      console.error("Error updating FormTag with submission ID:", updateFormTagErrors);
      throw new Error("Failed to update FormTag with submission ID");
    }

    return submissionData;
  } catch (error) {
    throw error;
  }
}


export async function submitFormAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const formId = formData.get("formId") as string;
  const formtagId = formData.get("formTagId") as string;
  const rawResponses = formData.get("responses") as string;
  const rawFormContent = formData.get("formContent") as string;
  //console.log("formTagId on submit form action", formtagId)
  const submission = {
    responses: JSON.parse(rawResponses),
    formContent: JSON.parse(rawFormContent),
    submittedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(submission);
  await SubmitForm(userId, formId, formtagId, jsonContent);
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
    const formTag = await findFormTagBySubmissionId(formSubmissionId);

    if (!formTag) {
      throw new Error("No formTag found for this submissionId.");
    }

    const formTag2Id = formTag.id;
    const tagID = formTag.tagID;

    await deleteFormTag(formTag2Id);

    if (tagID) {
      // Verifica se existem outras FormTags usando esse tagID
      const { data: otherTags, errors } = await client.models.FormTag.list({
        filter: {
          tagID: { eq: tagID },
          id: { ne: formTag2Id }, // Ignora o que será deletado agora
        },
      });

      if (errors) {
        console.error(errors);
        throw new Error("Error checking other formTags for tagID.");
      }

      const stillUsed = otherTags && otherTags.length > 0;

      // Só deleta o tag se ele não for mais usado
      if (!stillUsed) {
        await deleteEquipmentTag(tagID);
      }
    }

    await deleteFormSubmission(formSubmissionId);
  } catch (error) {
    console.error("Cascade deletion failed:", error);
    throw error;
  }
}

export async function deleteFormProject(id: string) {
  const { errors } = await client.models.FormProject.delete({ id });
  if (errors) throw new Error("Failed to delete FormProject.");
}

export async function deleteForm(id: string) {
  try {
    // 1. Deletar todas as FormSubmissions associadas ao form
    const { data: submissions } = await client.models.FormSubmissions.list({
      filter: { formId: { eq: id } },
    });

    for (const sub of submissions ?? []) {
      await deleteFormSubmissionCascade(sub.id); // já cuida dos FormTags e EquipmentTags
    }

    // 2. Deletar todos os FormProject relacionados
    const { data: formProjects } = await client.models.FormProject.list({
      filter: { formID: { eq: id } },
    });

    for (const fp of formProjects ?? []) {
      const formProjectId = fp.id;

      // 3. Deletar EquipmentTags relacionados ao formProjectId
      const { data: equipmentTags } = await client.models.EquipmentTag.list({
        filter: { formProjectID: { eq: formProjectId } },
      });

      for (const tag of equipmentTags ?? []) {
        await deleteEquipmentTag(tag.id);
      }

      // 4. Deletar o FormProject em si
      await deleteFormProject(formProjectId);
    }

    // 5. Finalmente, deletar o próprio Form
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

export async function deleteFormTag(id: string) {
  try {
    const { errors } = await client.models.FormTag.delete({ id });
    if (errors) {
      console.error(errors);
      throw new Error("Error deleting formTag2.");
    }
  } catch (error) {
    console.error("Error deleting formTag2:", error);
    throw new Error("Failed to delete formTag2.");
  }
}

export async function deleteEquipmentTag(id: string) {
  try {
    const { errors } = await client.models.EquipmentTag.delete({ id });
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
    const { data, errors } = await client.models.FormTag.list({
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

export async function GetFormWithSubmissionDetails(id: string) {
  try {
    const { data: form, errors: formErrors } = await client.models.Form.get({ id });
    if (formErrors || !form) {
      console.error(formErrors || "Form not found.");
      return null;
    }

    const [formTagsResp, submissionsResp] = await Promise.all([
      client.models.FormTag.list({ filter: { formID: { eq: form.id } } }),
      client.models.FormSubmissions.list({ filter: { formId: { eq: form.id } } }),
    ]);

    if (formTagsResp.errors || submissionsResp.errors) {
      console.error(formTagsResp.errors || submissionsResp.errors);
      return null;
    }

    const formTags = formTagsResp.data || [];
    const submissions = submissionsResp.data || [];

    const submissionDetails = await Promise.all(
      formTags.map(async (tag) => {
        const rawContentTest = tag.contentTest?.trim() ?? "";
        const contentTestIds = rawContentTest === "[]" || rawContentTest === ""
          ? []
          : rawContentTest.split(",").map((s) => s.trim());

        const matchedSubmission = submissions.find((sub) =>
          contentTestIds.includes(sub.id)
        );

        // Get EquipmentTag
        const { data: equipmentTag } = await client.models.EquipmentTag.get({
          id: tag.tagID ?? "",
        });

        // Get FormProject from EquipmentTag
        const formProjectID = equipmentTag?.formProjectID;
        let projectName = "Unknown";
        let projectCode = "Unknown";

        if (formProjectID) {
          const { data: formProject } = await client.models.FormProject.get({
            id: formProjectID,
          });

          if (formProject?.projectID) {
            const { data: project } = await client.models.Project.get({
              id: formProject.projectID,
            });

            if (project) {
              projectName = project.projectName;
              projectCode = project.projectCode ?? "No Code";
            }
          }
        }

        return {
          formId: form.id,
          formSubmissionsId: matchedSubmission?.id ?? null,
          submittedAt: matchedSubmission?.createdAt ?? null,
          equipmentTag: equipmentTag?.Tag ?? "No Tag",
          formtagId: tag.id,
          contentTest: contentTestIds,
          docNumber: tag.docNumber ?? "No Doc Number",
          projectName,
          projectCode,
          docRevisionNumber: tag.docNumberRevision ?? "0",
        };

      })
    );

    return {
      form,
      projectLog: submissionDetails,
    };
  } catch (error) {
    console.error("Error fetching form with submission details:", error);
    throw new Error("Failed to fetch form and submission details.");
  }
}



export async function getMatchingFormSubmissions(submissionId: string) {
  try {
    // Fetch form tags where contentTest contains the submissionId
    const { data: formSubmitted, errors } = await client.models.FormTag.list({
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
    const { data: formTag, errors } = await client.models.FormTag.get({ id: formTagId });

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

    if (errors || !content) {
      console.warn("Submission not found or has errors", { errors, submissionId });
      return null;
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
      await client.models.FormTag.list({
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
        const equipmentTag = tag.tagID ? await client.models.EquipmentTag.get({ id: tag.tagID }) : null;

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

type RawForm = {
  id: string;
  name: string | null;
  description?: string | null;
  published: boolean | null;
  content?: string | null;
  createdAt?: string | null;
  visits?: number | null;
  submissions?: number | null;
  equipmentName?: string | null;
  clientName?: string | null;
  formRevision?: number | null;
};

type ClientFormData = {
  clientName: string;
  projectName: string | null;
  projectID: string | null;
  forms: RawForm[];
};

export async function GetFormsInformation(
  userId: string,
  group: string,
  company: string
): Promise<ClientFormData[]> {
  try {
    const { data: clientsData, errors: clientErrors } = await client.models.Client.list();
    if (clientErrors) throw new Error("Failed to fetch clients.");

    const { data: userSubmissions, errors: submissionErrors } = await client.models.FormSubmissions.list({
      filter: { userId: { eq: userId } },
    });
    if (submissionErrors) throw new Error("Failed to fetch form submissions.");

    const submittedFormIds = new Set(userSubmissions.map(sub => sub.formId));

    const results: ClientFormData[] = [];

    for (const clientItem of clientsData) {
      if (group === "viewer" && clientItem.ClientName !== company) continue;

      const { data: formsData, errors: formErrors } = await client.models.Form.list({
        filter: { clientID: { eq: clientItem.id ?? undefined } },
      });
      if (formErrors) throw new Error("Failed to fetch forms.");

      const visibleForms = formsData.filter(form => {
        if (group === "admin") return true;
        if (group === "user") return form.userId === userId || submittedFormIds.has(form.id);
        if (group === "viewer") return form.published === true;
        return false;
      });

      if (visibleForms.length > 0) {
        results.push({
          clientName: clientItem.ClientName,
          projectName: null,
          projectID: null,
          forms: visibleForms.map(form => ({
            id: form.id,
            name: form.name,
            description: form.description,
            published: form.published,
            content: form.content,
            createdAt: form.createdAt,
            visits: form.visits,
            submissions: form.submissions,
            equipmentName: form.equipmentName,
            clientName: clientItem.ClientName,
            formRevision: form.revision,
          })),
        });
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

export async function GetProjectsFromShareURL(shareURL: string) {
  try {
    // 1. Buscar o form pelo shareURL
    const { data: forms, errors: formErrors } = await client.models.Form.list({
      filter: { shareURL: { eq: shareURL } },
    });
    if (formErrors || !forms || forms.length === 0) {
      console.error("Form not found or error:", formErrors);
      throw new Error("Form not found.");
    }
    const form = forms[0];

    if (!form.clientID) {
      throw new Error("Form does not have a clientID.");
    }

    // 2. Buscar client pelo clientID do form
    const { data: clients, errors: clientErrors } = await client.models.Client.list({
      filter: { id: { eq: form.clientID } },
    });
    if (clientErrors || !clients || clients.length === 0) {
      console.error("Client not found or error:", clientErrors);
      throw new Error("Client not found.");
    }
    const clientData = clients[0];

    if (!clientData.id) {
      throw new Error("Client ID is null.");
    }

    // 3. Buscar projects pelo clientID
    const { data: projects, errors: projectErrors } = await client.models.Project.list({
      filter: { clientID: { eq: clientData.id } }
    });
    if (projectErrors) {
      console.error("Error fetching projects:", JSON.stringify(projectErrors, null, 2));
      throw new Error(`Error fetching projects: ${projectErrors[0]?.message || 'unknown error'}`);
    }
    // 4. Mapear para lista que pode ser usada no dropdown
    // retornando id e nome separado para facilitar
    const projectList = projects.map(project => ({
      projectCode: project.projectCode,
      name: project.projectName,
    }));


    return { projectList };
  } catch (error) {
    console.error("Error in GetProjectsFromShareURL:", error);
    throw error;
  }
}


export async function CreateForm(
  _name: string, // o name enviado pode ser vazio ou prefixado (ex: ABCFRM-)
  equipmentName: string,
  description: string,
  userId: string,
  clientID: string,
) {
  // Fetch all forms for the client
  const { data: clientForms, errors: clientFormErrors } = await client.models.Form.list({
    filter: {
      clientID: { eq: clientID },
    },
  });

  if (clientFormErrors) {
    console.error("Error fetching client forms:", clientFormErrors);
    throw new Error("Error fetching existing forms.");
  }

  // Get the client to retrieve the code
  const { data: clients } = await client.models.Client.list();
  const matchedClient = clients?.find((c) => c.id === clientID);
  const clientCode = matchedClient?.ClientCode ?? "XXX";

  // Calculate the next sequence number
  const formCount = clientForms?.length ?? 0;
  const sequenceNumber = formCount.toString().padStart(4, "0");
  const name = `${clientCode}FRM-${sequenceNumber}`;

  // Create the form
  const { errors: formErrors, data: form } = await client.models.Form.create({
    equipmentName,
    name,
    description,
    userId,
    clientID,
  });

  if (formErrors) {
    console.error("Error creating form:", formErrors);
    throw new Error("Something went wrong while creating the form");
  }

  return {
    formId: form?.id,
    equipmentName,
    name,
  };
}

export async function GetNextFormName(clientId: string) {
  const { data: clients, errors: clientErrors } = await client.models.Client.list();
  if (clientErrors || !clients) throw new Error("Failed to fetch clients.");

  const matchedClient = clients.find(c => c.id === clientId);
  if (!matchedClient) throw new Error("Client not found");

  const code = matchedClient.ClientCode ?? "XXX";

  const { data: existingForms, errors: formErrors } = await client.models.Form.list({
    filter: {
      clientID: { eq: clientId }
    },
  });

  if (formErrors) {
    console.error("Error creating form:", formErrors);
    throw new Error("Something went wrong while creating the form");
  }

  const count = existingForms?.length ?? 0;
  const paddedNumber = count.toString().padStart(4, "0");

  return `${code}FRM-${paddedNumber}`;
}



export const runForm = async (
  shareUrl: string,
  equipmentTag: string,
  docNumber: string,
  projectCode: string,
  forceRevision: boolean = false
): Promise<{
  success: boolean;
  createdTagID?: string;
  tagCreatedAt?: string;
  revisionBumped?: boolean;
  createdFormTagID?: string;
}> => {
  try {
    // 1. Get form
    const formResp = await client.models.Form.list({
      filter: { shareURL: { eq: shareUrl } },
    });
    const form = formResp.data?.[0];
    if (!form) return { success: false };

    // 2. Get project
    const projectResp = await client.models.Project.list({
      filter: { projectCode: { eq: projectCode } },
    });
    const project = projectResp.data?.[0];
    if (!project) return { success: false };

    // 3. Get or create FormProject
    const existingFormProjectResp = await client.models.FormProject.list({
      filter: {
        formID: { eq: form.id },
        projectID: { eq: project.id ?? undefined },
      },
    });

    let formProject = existingFormProjectResp.data?.[0];
    if (!formProject) {
      const createdFormProject = await client.models.FormProject.create({
        formID: form.id,
        projectID: project.id,
      });
      if (!createdFormProject.data) return { success: false };
      formProject = createdFormProject.data;
    }

    // 4. Get or create EquipmentTag
    const existingTagResp = await client.models.EquipmentTag.list({
      filter: {
        formProjectID: { eq: formProject.id },
        Tag: { eq: equipmentTag },
      },
    });

    let equipTag = existingTagResp.data?.[0];
    if (!equipTag) {
      const createdEquipTag = await client.models.EquipmentTag.create({
        Tag: equipmentTag,
        formProjectID: formProject.id,
      });
      if (!createdEquipTag.data) return { success: false };
      equipTag = createdEquipTag.data;
    }

    // 5. Check if FormTag with same docNumber already exists
    const existingFormTagResp = await client.models.FormTag.list({
      filter: {
        docNumber: { eq: docNumber },
      },
    });

    const existingFormTags = existingFormTagResp.data ?? [];
    const revisionBumped = existingFormTags.length > 0;

    // Early return if duplicate found and not forcing revision
    if (revisionBumped && !forceRevision) {
      return {
        success: false,
        revisionBumped: true,
      };
    }

    const nextRevision = revisionBumped
      ? Math.max(...existingFormTags.map(f => f.docNumberRevision ?? 0)) + 1
      : 0;

    // 6. Create new FormTag with updated revision
    const formTagResp = await client.models.FormTag.create({
      formID: form.id,
      tagID: equipTag.id,
      docNumber,
      docNumberRevision: nextRevision,
    });

    if (!formTagResp.data) return { success: false };

    return {
      success: true,
      createdTagID: equipTag.id,
      tagCreatedAt: equipTag.createdAt,
      revisionBumped,
      createdFormTagID: formTagResp.data.id,
    };
  } catch (error) {
    console.error("Error executing runForm:", error);
    return { success: false };
  }
};



export async function SaveFormAfterTest(formtagId: string, content: string) {
  try {
    const { data: formTag, errors } = await client.models.FormTag.get({ id: formtagId });

    if (errors || !formTag) {
      console.error("Error fetching FormTag by ID:", errors);
      return;
    }

    const updated = await client.models.FormTag.update({
      id: formtagId,
      contentTest: content,
    });

    if (!updated || updated.errors) {
      console.error("Update failed:", updated.errors);
    }

    return updated;
  } catch (err) {
    console.error("Error SaveFormAfterTest:", err);
  }
}

export async function SaveFormAfterTestAction(formData: FormData) {
  const formtagId = formData.get("formTagId") as string;
  const rawResponses = formData.get("responses") as string;
  const rawFormContent = formData.get("formContent") as string;

  if (!formtagId) {
    throw new Error("Missing formtagID");
  }

  const submission = {
    responses: JSON.parse(rawResponses),
    formContent: JSON.parse(rawFormContent),
  };

  const jsonContent = JSON.stringify(submission);
  await SaveFormAfterTest(formtagId, jsonContent);
}



export async function GetTagIDWithFormIdandFormTagID(formId: string, formtagID: string): Promise<string | null> {
  try {
    const { data, errors } = await client.models.FormTag.list({
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
    const { data: formTags, errors } = await client.models.FormTag.list({
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

export async function GetFormNameFromSubmissionId(FormSubmissionsId: string) {
  try {
    // 1. Buscar o FormTag onde o contentTest === FormSubmissionsId
    const { data: formTags, errors } = await client.models.FormTag.list({
      filter: { contentTest: { eq: FormSubmissionsId } },
    });

    if (errors || formTags.length === 0) {
      throw new Error("No FormTag found with this submission ID.");
    }

    const formTag = formTags[0];
    const formId = formTag.formID;
    const docNumber = formTag.docNumber;
    const docNumberRevision = formTag.docNumberRevision;

    // 2. Buscar a própria submissão para pegar a revisão usada na época
    const { data: submission, errors: submissionErrors } = await client.models.FormSubmissions.get({ id: FormSubmissionsId });

    if (submissionErrors || !submission) {
      throw new Error("Submission not found.");
    }

    const formRevision = submission.formRevision ?? 0;

    // 3. Buscar o nome do formulário
    const { data: forms, errors: formErrors } = await client.models.Form.list({
      filter: { id: { eq: formId ?? undefined } },
    });

    if (formErrors || forms.length === 0) {
      throw new Error("Form not found.");
    }

    const form = forms[0];
    const formName = form.name ?? null;

    return { formName, revision: formRevision, docNumber, docNumberRevision };
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

import {
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
}


export async function TurnEditable(formId: string) {
  try {
    const form = {
      id: formId,
      published: false,
    };
    const { errors } = await client.models.Form.update(form);

    if (errors) {
      console.error(errors);
      throw new Error("Failed to turn the form editable.");
    }
  } catch (error) {
    console.error("Error to turn the form editable:", error);
    throw new Error("Failed to turn the form editable.");
  }
}