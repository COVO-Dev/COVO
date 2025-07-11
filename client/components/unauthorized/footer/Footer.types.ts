export interface FooterLink {
  label: string;
  href: string;
  sectionId?: string;
}

export interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

export interface FooterProps {
  className?: string;
}

export interface ContactInfo {
  type: 'email' | 'phone' | 'address';
  value: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}
