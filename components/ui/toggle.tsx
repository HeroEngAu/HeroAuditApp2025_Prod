import React from "react";
import { ToggleButton, ToggleButtonProps } from "@aws-amplify/ui-react";

interface ToggleProps extends Omit<ToggleButtonProps, "onChange"> {
  label?: string;
  onChange?: (value: string | undefined) => void;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  onChange,
  defaultPressed,
  isPressed,
  isDisabled,
  isLoading,
  loadingText,
  onClick,
  size = "small",
  variation = "primary",
  value,
  ...props
}) => {
  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {label && <span>{label}</span>}
      <ToggleButton
        {...props}
        defaultPressed={defaultPressed}
        isPressed={isPressed}
        isDisabled={isDisabled}
        isLoading={isLoading}
        loadingText={loadingText}
        onClick={onClick}
        size={size}
        variation={variation}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default Toggle;
