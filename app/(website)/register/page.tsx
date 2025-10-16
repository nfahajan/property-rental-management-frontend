export const metadata = {
  title: "Register",
  description: "This is the register page",
};
import Register from "./components/Register";
import { ErrorBoundary } from "./components/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <Register />
    </ErrorBoundary>
  );
};

export default page;
