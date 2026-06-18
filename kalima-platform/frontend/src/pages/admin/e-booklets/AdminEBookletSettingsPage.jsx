import { Link } from "react-router-dom";
import { CalendarRange, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const comingSoonCards = [
  {
    title: "Default Delivery Settings",
    description: "Default invite quota, access duration, and delivery presets will live here.",
  },
  {
    title: "Checklist Rules",
    description: "Configure delivery blockers and warnings for the delivery checklist.",
  },
  {
    title: "Pricing Defaults",
    description: "Default student store price and internal teacher cost rules will live here.",
  },
];

export default function AdminEBookletSettingsPage() {
  return (
    <div className="space-y-6" data-testid="admin-e-booklet-settings-page">
      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Settings className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">E-Booklet Settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure eBooklet terms now. Delivery, checklist, and pricing defaults are reserved for the next settings build.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border bg-background p-5 shadow-sm">
          <CalendarRange className="h-5 w-5 text-primary" />
          <h3 className="mt-4 font-semibold">Terms & Milestones</h3>
          <p className="mt-2 text-sm text-muted-foreground">Manage active eBooklet terms and milestone settings.</p>
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link to="/admin/e-booklets/settings/terms-milestones">Open</Link>
          </Button>
        </article>

        {comingSoonCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-dashed bg-muted/20 p-5 text-muted-foreground shadow-sm">
            <Lock className="h-5 w-5" />
            <h3 className="mt-4 font-semibold text-foreground">{card.title}</h3>
            <p className="mt-2 text-sm">{card.description}</p>
            <Button className="mt-4 w-full" variant="outline" disabled>
              Coming soon
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
