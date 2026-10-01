export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
  requiresAuth?: boolean;
  description?: string;
  badge?: string;
  exact?: boolean;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
};
