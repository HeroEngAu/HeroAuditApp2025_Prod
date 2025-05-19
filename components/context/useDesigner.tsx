import { useContext } from "react";
import { DesignerContext, type DesignerContextType } from "./DesignerContext";

export const useDesigner = (): DesignerContextType => {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerContextProvider");
  }
  return context;
};
