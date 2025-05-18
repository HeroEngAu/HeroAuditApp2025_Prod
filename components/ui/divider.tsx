import { Divider } from "@aws-amplify/ui-react";

export const Separator: React.FC = () => {
  return (
    <Divider
      orientation="horizontal"
      size="small"
      color="neutral.40"
      margin="1rem 0"
    />
  );
};

export default Separator;
