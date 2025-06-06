import { Text } from "@react-pdf/renderer";
import { Parser } from "htmlparser2";
import type { ReactElement } from "react";

type TextStyle = {
  fontWeight?: "bold";
  fontStyle?: "italic";
  textDecoration?: "underline";
  color?: string;
};

type TextNode = {
  text: string;
  style: TextStyle;
};

export function renderHtmlToPDFElements(htmlString: string): ReactElement[] {
  const elements: TextNode[] = [];
  let currentText = "";
  const styleStack: TextStyle[] = [{}];

  const pushTextNode = () => {
    if (currentText) {
      const mergedStyle = Object.assign({}, ...styleStack);
      elements.push({ text: currentText, style: mergedStyle });
      currentText = "";
    }
  };

  const parser = new Parser({
    onopentag(name, attribs) {
      pushTextNode();
      const prev = { ...styleStack[styleStack.length - 1] };
      const next: TextStyle = { ...prev };

      if (name === "b" || name === "strong") next.fontWeight = "bold";
      if (name === "i" || name === "em") next.fontStyle = "italic";
      if (name === "u") next.textDecoration = "underline";
      if (attribs?.style) {
        const styleStr = attribs.style;
        styleStr.split(";").forEach((s) => {
          const [key, value] = s.split(":").map((v) => v?.trim());
          if (key === "color") next.color = value;
        });
      }

      styleStack.push(next);
    },
    ontext(text) {
      currentText += text;
    },
    onclosetag(name) {
      pushTextNode();
      if (styleStack.length > 1) styleStack.pop();
      if (name === "p" || name === "br") {
        elements.push({ text: "\n", style: {} });
      }
    },
  });

  parser.write(htmlString);
  parser.end();
  pushTextNode();

  return elements.map((el, idx) => (
    <Text key={idx} style={el.style}>
      {el.text}
    </Text>
  ));
}
