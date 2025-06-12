'use client';
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "../components/ui/card";
import {
  Button,
  View,
  Heading,
  Text,
  TextField,
  TextAreaField,
  Flex,
  Alert,
} from "@aws-amplify/ui-react";
import { IoIosCreate } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import {
  GetClients,
  CreateForm,
} from "../actions/form";
import { useTheme } from "next-themes";
import { fetchAuthSession } from "aws-amplify/auth";
import useUserAttributes from "./userAttributes";

interface CreateFormDialogProps {
  onFormCreated?: () => void;
}

const CreateFormDialog: React.FC<CreateFormDialogProps> = ({
  onFormCreated,
}) => {
  const router = useRouter();
  const [clients, setClients] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [equipmentName, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { theme } = useTheme();

  const dialogRef = useRef<HTMLDivElement>(null);

  const [userGroup, setUserGroup] = useState<string | null>(null);
  const { attributes } = useUserAttributes();
  const userId = attributes?.sub;

  useEffect(() => {
    if (!userId) return;
    const fetchUserGroup = async () => {
      try {
        const session = await fetchAuthSession();
        const rawGroups = session.tokens?.accessToken.payload["cognito:groups"];
        if (Array.isArray(rawGroups) && typeof rawGroups[0] === "string") {
          setUserGroup(rawGroups[0]);
        } else {
          setUserGroup(null);
        }
      } catch (error) {
        console.error("Error fetching user group:", error);
        setUserGroup(null);
      }
    };
    fetchUserGroup();
  }, [userId]);

  useEffect(() => {
    const fetchClients = async () => {
      const clientsData = await GetClients();
      setClients(clientsData.map((c) => c.name));
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCreateForm = async () => {
    try {
      setError(null);
      if (!name || !description || !equipmentName || !userId || !selectedClient) {
        setError("Please fill in all fields.");
        return;
      }

      const form = await CreateForm(
        name,
        equipmentName,
        description,
        userId,
        selectedClient,
      );

      if (!form?.formId) throw new Error("Form ID not returned");

      setSuccess("Form created successfully!");
      onFormCreated?.();
      setIsOpen(false);

      localStorage.setItem("form-data", JSON.stringify({
        formId: form.formId,
        name,
        description,
        client: selectedClient,
        equipmentName,
      }));

      router.push(`/builder/${form.formId}`);
    } catch (err) {
      console.error("Error creating form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    }
  };


  return (
    <View>
      {userGroup !== "viewer" && (
        <Card
          onClick={() => setIsOpen(true)} // Trigger the function when the card is clicked
          className="
        h-[235px] cursor-pointer border-2 border-dashed p-4 flex flex-col justify-center items-center
        border-black transition-colors duration-300 ease-in-out
        hover:border-blue-400
        hover:bg-blue-50
        dark:border-gray-300
        dark:hover:border-blue-300
        dark:hover:bg-gray-800
        dark:hover:text-white "
        >
          <CardHeader className="flex flex-col justify-center items-center gap-2">
            <IoIosCreate className="text-4xl" />
            <span className="text-xl font-bold">Create New Form</span>
          </CardHeader>
        </Card>
      )}
      {isOpen && (
        <View
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          style={{ alignItems: "center", justifyContent: "center", zIndex: 50 }}
        >
          <View
            ref={dialogRef}
            padding="2rem"
            borderRadius="medium"
            width="90%"
            maxWidth="600px"
            boxShadow="0 4px 12px rgba(0,0,0,0.2)"
            className="bg-white text-black dark:bg-neutral-900 dark:text-white"
          >

            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="1rem"
            >
              <Heading className="text-foreground" level={3}>Create New Form</Heading>
              <Button variation="link" className="link-button" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </Flex>

            <Text className="text-foreground" marginBottom="1rem">Add details to create your form</Text>

            {error && (
              <Alert variation="error" isDismissible>
                {error}
              </Alert>
            )}
            {success && (
              <Alert variation="success" isDismissible>
                {success}
              </Alert>
            )}
            <label className="block mb-1 text-md font-medium">
              Client:
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className={`
              w-full p-2 rounded border 
              ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"}
              max-h-48 overflow-y-auto
              `}
            >
              <option value="" disabled>
                Select Client
              </option>
              {clients
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((client, idx) => (
                  <option key={idx} value={client}>
                    {client}
                  </option>
                ))}
            </select>
            <label className="pt-1 block text-md font-medium">
              Form Name:
            </label>
            <TextField
              label=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter form name"
              className="pt-1 block text-md font-medium text-foreground"
              inputStyles={{
                color: theme === "dark" ? "white" : "black",
                backgroundColor: theme === "dark" ? "#1f2937" : "white",
              }}
            />
            <label className="pt-1 block text-md font-medium">
              Equipment Name:
            </label>
            <TextField
              label=""
              value={equipmentName}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Enter the equipment"
              className="pt-1 block text-md font-medium"
              inputStyles={{
                color: theme === "dark" ? "white" : "black",
                backgroundColor: theme === "dark" ? "#1f2937" : "white",
              }}
            />
            <label className="pt-1 block text-md font-medium">
              Form Description:
            </label>
            <TextAreaField
              label=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={4}
              resize="vertical"
              className="pt-1 block text-md font-medium"
              inputStyles={{
                color: theme === "dark" ? "white" : "black",
                backgroundColor: theme === "dark" ? "#1f2937" : "white",
              }}
            />

            <Flex justifyContent="flex-end" marginTop="1rem">
              <Button variation="primary" onClick={handleCreateForm}>
                <FaSave /> Create Form
              </Button>
            </Flex>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateFormDialog;
