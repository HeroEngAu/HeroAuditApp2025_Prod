"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { View, Heading, Text, Alert, Flex, TextField } from "@aws-amplify/ui-react";
import { runForm } from "../actions/form";
import { useRouter } from "next/navigation";

function VisitBtn({ shareUrl }: { shareUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error] = useState<string | null>(null);
  const [success] = useState<string | null>(null);
  const [equipmentName, setEquipName] = useState("");
  const [equipmentTag, setEquipTag] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEquipName(""); // reset state
    setEquipTag("");  // reset state
  };
  
  if (!mounted) {
    return null; // avoiding window not defined error
  }
  
  const handleRunForm = async () => {
    // Execute the runForm function
    const { success, createdTagID } = await runForm(shareUrl, equipmentName, equipmentTag);
    
    if (success && createdTagID) {
      // If form creation is successful, navigate to the new page
      localStorage.setItem("tagId", createdTagID); // ou FormTag2Id se preferir
      router.push(`${window.location.origin}${shareUrl}`);
      
      
    } else {
      alert("Failed to run the form. Please check the equipment and tag details.");
    }
  };
  return (
    <>
      <Button
        className="w-[200px]"
        onClick={() => setIsDialogOpen(true)}
      >
        Visit
      </Button>

      {isDialogOpen && (
        <View
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0,0,0,0.5)"
          display="flex"
          style={{
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <View
            ref={dialogRef}
            backgroundColor="white"
            padding="2rem"
            borderRadius="medium"
            width="90%"
            maxWidth="600px"
            boxShadow="0 4px 12px rgba(0,0,0,0.2)"
          >
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="1rem"
            >
              <Heading level={3}>Equipment Details</Heading>
              <Button className="link-button" onClick={handleDialogClose}>
                ✕
              </Button>
            </Flex>

            <Text marginBottom="1rem">Add details to run your form</Text>

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

            <TextField
              label="Equipment Name"
              value={equipmentName}
              onChange={(e) => setEquipName(e.target.value)}
              placeholder="Enter equipment name"
            />

            <TextField
              label="Equipment Tag"
              value={equipmentTag}
              onChange={(e) => setEquipTag(e.target.value)}
              placeholder="Enter Equipment Tag"
              row={4}
            />

            <Flex justifyContent="flex-end" marginTop="1rem">
              <Button
                className="w-[200px]"
                onClick={handleRunForm}
              >
                Run Form
              </Button>
            </Flex>
          </View>
        </View>
      )}
    </>
  );
}

export default VisitBtn;
