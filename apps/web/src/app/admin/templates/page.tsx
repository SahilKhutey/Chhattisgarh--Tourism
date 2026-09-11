import { TemplateDashboard } from "@/components/admin/templates";

export const metadata = {
  title: "Content Templates | Admin",
  description: "Manage, filter, and create reusable content templates.",
};

export default function AdminTemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <TemplateDashboard />
    </div>
  );
}
