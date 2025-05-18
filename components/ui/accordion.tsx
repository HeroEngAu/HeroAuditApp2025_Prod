import * as React from "react";
import { Accordion } from "@aws-amplify/ui-react";

interface AccordionItem {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultValue?: string;
  onChange?: (value: string | null) => void;
}

export const ReusableAccordion: React.FC<AccordionProps> = ({
  items,
  defaultValue,
  onChange,
}) => {
  return (
    <Accordion.Container
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onChange={(event) => onChange?.(Array.isArray(event) ? event[0] : null)}
    >
      {items.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Trigger>
            {item.title}
            <Accordion.Icon />
          </Accordion.Trigger>
          <Accordion.Content>{item.content}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Container>
  );
};
