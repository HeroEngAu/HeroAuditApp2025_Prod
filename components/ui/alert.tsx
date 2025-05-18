import { Alert, AlertProps } from "@aws-amplify/ui-react";

interface CustomAlertProps extends AlertProps {
  message: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, ...props }) => {
  return <Alert {...props}>{message}</Alert>;
};

export default CustomAlert;
