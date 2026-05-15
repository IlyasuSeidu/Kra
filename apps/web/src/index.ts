export interface PublicPage {
  route: string;
  title: string;
  description: string;
}

export interface LandingSection {
  id: string;
  title: string;
  purpose: string;
}

export const publicPages: PublicPage[] = [
  {
    route: "/",
    title: "Kra Landing",
    description: "The public landing page for Kra across Africa."
  },
  {
    route: "/how-it-works",
    title: "How It Works",
    description: "Explains the sender, station, driver, and receiver journey."
  },
  {
    route: "/pricing",
    title: "Pricing",
    description: "Explains route pricing, surcharges, and policy boundaries."
  },
  {
    route: "/track",
    title: "Track Package",
    description: "Public tracking entry point for senders and receivers."
  },
  {
    route: "/business",
    title: "Business",
    description: "Explains the service for retail and small-business senders."
  },
  {
    route: "/coverage",
    title: "Coverage",
    description: "Explains active routes, stations, and launch-city availability."
  },
  {
    route: "/partners",
    title: "Partners",
    description: "Public partner intake for stations, fleet partners, and business senders."
  },
  {
    route: "/about",
    title: "About Kra",
    description: "Public company story, trust posture, and operating model."
  },
  {
    route: "/support",
    title: "Support",
    description: "Public support and help surface."
  },
  {
    route: "/privacy",
    title: "Privacy",
    description: "Public privacy notice for senders, staff, and receivers."
  },
  {
    route: "/terms",
    title: "Terms",
    description: "Public delivery, payment, and platform terms."
  }
];

export const landingSections: LandingSection[] = [
  {
    id: "hero",
    title: "Trust-first intercity delivery",
    purpose: "Explain the value proposition, launch geography, and primary calls to action."
  },
  {
    id: "proof",
    title: "Why Kra is different",
    purpose: "Show tracking, custody, station operations, OTP delivery proof, and support discipline."
  },
  {
    id: "corridors",
    title: "Launch corridors and stations",
    purpose: "Show live operating routes, station names, and final-mile availability limits."
  },
  {
    id: "business",
    title: "For merchants and repeat senders",
    purpose: "Present business value, predictable pricing, and support pathways."
  },
  {
    id: "trust",
    title: "Safety, payments, and accountability",
    purpose: "Expose refund rules, support SLAs, and operator accountability signals."
  },
  {
    id: "faq",
    title: "Public answers before signup",
    purpose: "Reduce support load with pricing, timing, tracking, and receiver FAQs."
  }
];

export const publicSurface = {
  app: "web",
  pages: publicPages,
  landingSections,
  seoBaseline: {
    siteName: "Kra",
    locale: "en-GH"
  }
};
