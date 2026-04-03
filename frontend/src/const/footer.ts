export type FooterLink = {
  title: string;
  href: string;
};

export type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    heading: "Donate",
    links: [
      { title: "Categories", href: "/categories" },
      { title: "Crisis relief", href: "/crisis-relief" },
      { title: "Social Impact Funds", href: "/social-impact" },
      { title: "Supporter Space", href: "/supporters" },
    ],
  },
  {
    heading: "Fundraise",
    links: [
      { title: "How to start a campaign", href: "/how-it-works" },
      { title: "Fundraising categories", href: "/fundraising-categories" },
      { title: "Team fundraising", href: "/team-fundraising" },
      { title: "Charity fundraising", href: "/charity" },
      { title: "Sign up as a nonprofit", href: "/nonprofit" },
    ],
  },
  {
    heading: "About",
    links: [
      { title: "How NextFund works", href: "/about/how-nextfund-works" },
      { title: "NextFund Giving Guarantee", href: "/about/guarantee" },
      { title: "Supported countries", href: "/about/countries" },
      { title: "Pricing", href: "/pricing" },
      { title: "Help Center", href: "/help" },
    ],
  },
  {
    heading: "Company",
    links: [
      { title: "Newsroom", href: "/newsroom" },
      { title: "Careers", href: "/careers" },
      { title: "Partnerships", href: "/partnerships" },
      { title: "NextFund for nonprofits", href: "/nextfund-for-nonprofits" },
    ],
  },
];

export const footerLegalLinks: FooterLink[] = [
  { title: "Terms", href: "/legal/terms" },
  { title: "Privacy Notice", href: "/legal/privacy" },
  { title: "Accessibility", href: "/legal/accessibility" },
  { title: "Cookie Policy", href: "/legal/cookies" },
];
