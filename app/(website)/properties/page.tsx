export const metadata: Metadata = {
  title: " Property",
  description: "Secure and efficient property management system",
};
import { Metadata } from "next";
import Properties from "./components/Properties";

const page = () => {
  return <Properties />;
};

export default page;
