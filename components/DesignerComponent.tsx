import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { FormElementInstance } from "./FormElements";


interface DesignerComponentProps {
  elementInstance: FormElementInstance;
}

const DesignerComponent: React.FC<DesignerComponentProps> = ({
  elementInstance,
}) => {
  const { label, placeHolder, helperText, required } =
    elementInstance.extraAttributes || {};

  return (
    <div className="designer-component">
      <Label>
        {label}
        {required && " *"}
      </Label>
      <Input placeholder={placeHolder} readOnly />
      {helperText && <p className="helper-text">{helperText}</p>}
    </div>
  );
};

export default DesignerComponent;
