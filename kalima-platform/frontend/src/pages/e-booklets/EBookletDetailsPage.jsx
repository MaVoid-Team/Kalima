import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  FileText,
  ImageIcon,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
  ShoppingBag,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEBookletCart, useEBookletTemplate } from "@/hooks/useEBooklets";

const formatMoney = (amount, currency = "EGP") => {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

function DetailCover({ template }) {
  if (template?.coverUrl) {
    return (
      <img
        src={template.coverUrl}
        alt={`${template.title} cover`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between bg-[linear-gradient(135deg,#f8fafc,#f0fdf4_58%,#fff7ed)] p-7 text-slate-950">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-slate-300/80 bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
          Kalima E-Booklet
        </span>
        <BookOpenCheck className="h-10 w-10 text-emerald-800" />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
          Secure interactive template
        </p>
        <h2 className="mt-3 max-w-sm text-4xl font-black leading-none tracking-tight">
          {template?.title || "Interactive booklet"}
        </h2>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-20 pt-32 md:grid-cols-[0.95fr_1.05fr] md:px-6">
      <Skeleton className="min-h-[520px] rounded-lg" />
      <div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-5 h-12 w-3/4" />
        <Skeleton className="mt-5 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-5/6" />
        <Skeleton className="mt-10 h-44 w-full" />
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpenCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        E-booklet not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        The template may be unpublished, archived, or moved out of the public
        E-Booklet Store.
      </p>
      <Button asChild className="mt-7">
        <Link to="/e-booklets">Back to E-Booklets</Link>
      </Button>
    </main>
  );
}

const hotspotTypes = [
  { label: "Text notes", Icon: FileText },
  { label: "Images", Icon: ImageIcon },
  { label: "Video", Icon: Video },
  { label: "Audio", Icon: Volume2 },
];

export default function EBookletDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { template, loading, notFound } = useEBookletTemplate(slug);
  const { replaceWithTemplate } = useEBookletCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <DetailSkeleton />;
  if (notFound || !template) return <NotFoundState />;

  const handleAddToCart = () => {
    replaceWithTemplate(template);
    navigate("/e-booklet-cart");
  };

  const activeVersion = template.activeVersion;

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.95),#ffffff_48%)] pt-24 text-foreground">
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-14 pt-8 md:grid-cols-[0.95fr_1.05fr] md:px-6 lg:pt-14">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_-45px_rgba(15,23,42,0.5)]">
          <DetailCover template={template} />
        </div>

        <div className="min-w-0 md:pt-4">
          <Button asChild variant="ghost" className="-ml-3 mb-5">
            <Link to="/e-booklets">
              <ArrowLeft className="h-4 w-4" />
              Back to E-Booklets
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
              E-Booklet Template
            </Badge>
            {template.categoryTitle && (
              <span className="text-sm font-medium text-muted-foreground">
                {template.categoryTitle}
              </span>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
            {template.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {template.description || "A reusable interactive booklet template. After purchase, Kalima admin delivers a teacher-specific PDF while preserving the template hotspot layer."}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pages", value: template.pageCount || "-", Icon: FileText },
              { label: "Hotspots", value: template.hotspotCount || 0, Icon: MousePointerClick },
              { label: "Version", value: activeVersion?.version_number || "-", Icon: ShieldCheck },
              { label: "Access", value: "Invite", Icon: Users },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-lg border border-border/70 bg-white p-4">
                <Icon className="mb-3 h-5 w-5 text-emerald-800" />
                <div className="text-2xl font-black tracking-tight">{value}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-emerald-900/15 bg-emerald-50/70 p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                  Template price
                </p>
                <div className="mt-1 text-3xl font-black tracking-tight text-emerald-950">
                  {formatMoney(template.price, template.currency)}
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                onClick={handleAddToCart}
                disabled={!activeVersion?.id}
                className="w-full active:scale-[0.98] md:w-auto"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to e-booklet cart
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-20 md:grid-cols-[0.9fr_1.1fr] md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            What is included
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The published template carries the reusable hotspot map. Admin
            delivery adds the teacher-specific PDF, branding, invite quota, and
            student access controls.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Reusable template version locked at purchase time",
            "Teacher-specific PDF delivered after admin validation",
            "Private page-by-page viewer with no public file URLs",
            "Watermark-ready access for teachers and students",
            "Multi-use invite link model with quota control",
            "Hotspot content loaded only when opened",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-border/70 bg-white p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
              <span className="text-sm leading-6 text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-6">
        <div className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold tracking-tight">Hotspot content</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hotspotTypes.map(({ label, Icon }, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-lg border border-border/70 bg-card p-5",
                  index === 0 && "border-emerald-700/30 bg-emerald-50/60",
                )}
              >
                <Icon className="h-6 w-6 text-emerald-800" />
                <h3 className="mt-4 font-bold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Hotspots are rendered from normalized template coordinates, so
                  the teacher PDF can change while the interactive layer stays
                  reusable.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-amber-500/30 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <div className="flex gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Downloading is blocked inside Kalima through private storage,
              authenticated page access, hidden viewer download controls, and
              watermarking. Screenshots and camera capture cannot be fully
              prevented by any web platform.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
