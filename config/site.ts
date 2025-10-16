export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
    linkedin: string;
  };
  keywords: string[];
  authors: {
    name: string;
    url: string;
  }[];
  creator: string;
};

export const siteConfig: SiteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Home Nest",
  description: `${
    process.env.NEXT_PUBLIC_APP_NAME || "Home Nest"
  } is a modern property management system connecting landlords and tenants with powerful search, filtering, and application tracking.`,
  url: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  ogImage: "/og-image.png",

  links: {
    twitter: "",
    github: "",
    linkedin: "",
  },
  keywords: [
    "properties",
    "property management",
    "property management system",
    "property management system",
    "landlords",
    "tenants",
    "rentals",
    "rent",
    "rental",
    "rental management",
    "rental management system",
  ],
  authors: [
    {
      name: "Home Nest",
      url: "",
    },
  ],
  creator: "Home Nest Team",
};
