"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { submitFormAction, SaveFormAfterTestAction, updateVisitCount } from "../actions/form";
import useUserAttributes from "./userAttributes";

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const { attributes } = useUserAttributes();
  const userId = attributes?.sub;
  const [formtagId, setFormtagId] = useState<string | null>(null);

  const validateForm = useCallback(() => {
    if (!userId) return false;

    for (const field of content) {
      const actualValue = formValues.current[field.id] || "";
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    return Object.keys(formErrors.current).length === 0;
  }, [content, userId]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  useEffect(() => {
    const storedFormTagId = localStorage.getItem("formtagId");
    if (storedFormTagId) {
      setFormtagId(storedFormTagId);
    }
  }, []);



  useEffect(() => {
    if (!formtagId) return;

    const uniqueKey = `visited-${formUrl}-${formtagId}-${Date.now()}`;

    updateVisitCount(formUrl);
    sessionStorage.setItem(uniqueKey, "true");
  }, [formUrl, formtagId]);

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
      formData.append("userId", userId ?? "");
      formData.append("formId", formUrl);
      formData.append("responses", JSON.stringify(cleanData));
      formData.append("formContent", JSON.stringify(content));

      if (formtagId) {
        formData.append("formTagId", formtagId);
      }
      console.log("formTagId on formsubmitcomponent", formtagId)

      await submitFormAction(formData);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  const saveProgress = useCallback(async () => {
    try {
      const cleanData = JSON.parse(JSON.stringify(formValues.current));
      if (!formtagId) {
        toast({
          title: "Missing form tag ID",
          description: "Unable to save progress without formtagId",

          variant: "destructive",
        });
        return;
      }
      console.log("formtagId in component", formtagId)
      const formData = new FormData();
      formData.append("formId", formUrl);
      formData.append("formTagId", formtagId);
      formData.append("responses", JSON.stringify(cleanData));
      formData.append("formContent", JSON.stringify(content));

      await SaveFormAfterTestAction(formData);
      toast({
        title: "Progress saved",
        description: "Your progress has been saved successfully.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Save failed",
        description: "Could not save your progress.",
        variant: "destructive",
      });
    }
  }, [formUrl, formtagId, content, formValues]);

  useEffect(() => {
    if (formtagId && content.length > 0) {
      saveProgress();
    }
  }, [formtagId, content, saveProgress]);

  if (submitted) {
    return (
      <div className="flex justify-center w-full h-full items-center p-8">
        <div className="flex justify-center flex-col gap-6 flex-grow bg-background w-full h-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded">
          <h1 className="text-3xl font-bold text-primary">Form successfully submitted!</h1>
          <p className="text-muted-foreground text-lg">
            Thanks for your submission. You can safely close this page, go back to the form, or return to the home page.
          </p>
          <div className="flex gap-4">
            <a
              href={`/forms/${formUrl}`}
              className="px-5 py-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
            >
              Go back to form
            </a>
            <a
              href="/"
              className="px-5 py-2 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md"
            >
              Return to homepage
            </a>
          </div>
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
