import React from "react";
import MyBooking from "./components/MyBooking";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <MyBooking />
    </ErrorBoundary>
  );
};

export default page;
