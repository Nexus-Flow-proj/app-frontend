export interface NavMainItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  items?: { title: string; url: string }[];
}
