import TenantDashboard from "./components/TenantDashboard";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <TenantDashboard />
    </ErrorBoundary>
  );
};

export default page;
