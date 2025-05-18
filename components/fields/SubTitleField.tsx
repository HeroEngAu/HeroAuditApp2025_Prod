import React from "react";
import { TextFieldProps, TextField } from "@aws-amplify/ui-react";

interface SubTitleFieldProps extends TextFieldProps {
  label: string;
  placeholder?: string;
  descriptiveText: string;
  errorMessage?: string;
  isDisabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
}

const SubTitleField: React.FC<SubTitleFieldProps> = ({
  label = "Subtitle",
  placeholder = "Enter subtitle",
  descriptiveText = "Subtitle for the section",
  errorMessage = "Invalid subtitle",
  isDisabled = false,
  onChange,
  onBlur,
  ...props
}) => {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      descriptiveText={descriptiveText}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      onChange={onChange}
      {...props}
    />
  );
};

export default SubTitleField;
