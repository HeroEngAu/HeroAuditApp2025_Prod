
import { useState } from "react";
import { Button } from "./ui/button";
import { HiSaveAs } from "react-icons/hi";
import useDesigner from "./hooks/useDesigner";
import { saveFormAction } from "../actions/form";
import { toast } from "./ui/use-toast";
import { FaSpinner } from "react-icons/fa";

// Client-side component
function SaveFormBtn({ id }: { id: string }) {
  const { elements } = useDesigner();
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const formData = new FormData();
    formData.append("id", id);  // Include the form ID
    formData.append("content", JSON.stringify(elements));  // Include the form content

    try {
      await saveFormAction(formData);

      toast({
        title: "Success",
        description: "Your form has been saved",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        variant={"outline"}
        className="gap-2"
        disabled={loading}
        type="submit"
      >
        <HiSaveAs className="h-4 w-4" />
        Save
        {loading && <FaSpinner className="animate-spin" />}
      </Button>
    </form>
  );
}

export default SaveFormBtn;
