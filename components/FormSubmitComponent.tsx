"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { submitFormAction, SaveFormAfterTestAction, updateVisitCount } from "../actions/form";

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());
  const [tagId, setTagId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();


  const validateForm: () => boolean = useCallback(() => {
    for (const field of content) {
      const actualValue = formValues.current[field.id] || "";
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  }, [content]);
  useEffect(() => {
    const storedTagId = localStorage.getItem("tagId");
    if (storedTagId) {
      setTagId(storedTagId);
    }
  }, []);

  useEffect(() => {
    if (!tagId) return;
    console.log("tagid formsubmitcompontet", tagId);
    const storageKey = `visited-${formUrl}-${tagId}`;
    const alreadyVisited = sessionStorage.getItem(storageKey);
  
    if (!alreadyVisited) {
      updateVisitCount(formUrl);
      sessionStorage.setItem(storageKey, "true");
    }
  }, [formUrl, tagId]);
  

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  const submitForm = async () => {
    formErrors.current = {};
    const validForm = validateForm();
    if (!validForm) {
      setRenderKey(new Date().getTime());
      toast({
        title: "Error",
        description: "please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const cleanData = JSON.parse(JSON.stringify(formValues.current));

      const formData = new FormData();
      formData.append("formId", formUrl);
      formData.append("responses", JSON.stringify(cleanData)); // valores preenchidos
      formData.append("formContent", JSON.stringify(content)); // estrutura do formulário

      if (tagId) {
        formData.append("tagId", tagId);
      }

      await submitFormAction(formData);
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  const saveProgress = async () => {
    try {
      const cleanData = JSON.parse(JSON.stringify(formValues.current));
      if (!tagId) {
        toast({
          title: "Missing tag ID",
          description: "Unable to save progress without tagId",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("formId", formUrl);
      formData.append("tagId", tagId);
      formData.append("responses", JSON.stringify(cleanData));
      formData.append("formContent", JSON.stringify(content));

      await SaveFormAfterTestAction(formData);
      toast({
        title: "Progress saved",
        description: "Your progress has been saved successfully.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save your progress.",
        variant: "destructive",
      });
    }
  };


  if (submitted) {
    return (
      <div className="flex justify-center w-full h-full items-center p-8">
        <div className="flex flex-col gap-4 flex-grow bg-background w-full h-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded">
          <h1 className="text-2xl font-bold">Form submitted</h1>
          <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full h-full items-center p-8">
      <div
        key={renderKey}
        className="flex flex-col gap-4 flex-grow bg-background w-full h-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded"
      >
        {content.map((element) => {
          const FormElement = FormElements[element.type].formComponent;
          return (
            <FormElement
              key={element.id}
              elementInstance={element}
              submitValue={submitValue}
              isInvalid={formErrors.current[element.id]}
              defaultValue={formValues.current[element.id]}
            />
          );
        })}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => {
              startTransition(submitForm);
            }}
            disabled={pending}
          >
            {!pending ? (
              <>
                <HiCursorClick className="mr-2" />
                Submit
              </>
            ) : (
              <ImSpinner2 className="animate-spin" />
            )}
          </Button>

          <Button
            onClick={saveProgress}
            disabled={pending}
          >
            {!pending ? (
              <>
                <HiCursorClick className="mr-2" />
                Save
              </>
            ) : (
              <ImSpinner2 className="animate-spin" />
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}

export default FormSubmitComponent;
