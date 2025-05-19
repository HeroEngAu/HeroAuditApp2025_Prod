"use client";

import {
  useState,
  type ReactNode,
} from "react";
import { DesignerContext } from "./DesignerContext";
import type { FormElementInstance } from "../FormElements";

export default function DesignerContextProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

  const addElement = (index: number, element: FormElementInstance) => {
    setElements((prev) => {
      const newElements = [...prev];
      newElements.splice(index, 0, element);
      return newElements;
    });
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const updateElement = (id: string, updatedElement: FormElementInstance) => {
    setElements((prev) => prev.map((el) => (el.id === id ? updatedElement : el)));
  };

  return (
    <DesignerContext.Provider
      value={{
        elements,
        setElements,
        addElement,
        removeElement,
        updateElement,
        selectedElement,
        setSelectedElement,
      }}
    >
      {children}
    </DesignerContext.Provider>
  );
}
