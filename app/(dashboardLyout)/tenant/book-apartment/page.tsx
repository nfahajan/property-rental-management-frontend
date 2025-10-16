import React from "react";
import BookApartment from "./components/BookApartment";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <BookApartment />
    </ErrorBoundary>
  );
};

export default page;
