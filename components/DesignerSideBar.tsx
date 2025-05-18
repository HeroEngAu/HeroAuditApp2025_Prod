import useDesigner from "./hooks/useDesigner";
import FormElementsSidebar from "./FormElementsSideBar";
import PropertiesFormSidebar from "./PropertiesFormSidebar";
import { View, useTheme } from "@aws-amplify/ui-react";

function DesignerSidebar() {
  const { selectedElement } = useDesigner();
  const { tokens } = useTheme();

  return (
    <View
      width="100%"
      height="100%"
      overflow="auto"
      padding={tokens.space.medium}
      
      style={{ borderLeft: `1px solid ${tokens.colors.border.primary}` }}

    >
      {!selectedElement && <FormElementsSidebar />}
      {selectedElement && <PropertiesFormSidebar />}
    </View>
  );
}

export default DesignerSidebar;
