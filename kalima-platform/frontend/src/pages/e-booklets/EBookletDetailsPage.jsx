import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  FileText,
  Eye,
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
import { formatTimeUntilRelease } from "@/lib/storeUtils";
import { useEBookletCart, useEBookletTemplate } from "@/hooks/useEBooklets";
import { useTranslation } from "react-i18next";

const formatMoney = (amount, currency = "EGP", language = "en") => {
  return new Intl.NumberFormat(language?.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

function DetailCover({ template, t }) {
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
          {t("details.coverLabel")}
        </span>
        <BookOpenCheck className="h-10 w-10 text-emerald-800" />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
          {t("details.secureTemplate")}
        </p>
        <h2 className="mt-3 max-w-sm text-4xl font-black leading-none tracking-tight">
          {template?.title || t("store.coverFallback")}
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

function NotFoundState({ t }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpenCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {t("details.notFoundTitle")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("details.notFoundDescription")}
      </p>
      <Button asChild className="mt-7">
        <Link to="/e-booklets">{t("common.backToEBooklets")}</Link>
      </Button>
    </main>
  );
}

export default function EBookletDetailsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { templateId, instanceId } = useParams();
  const lookupId = templateId || instanceId;
  const legacyInstanceRoute = Boolean(instanceId);
  const navigate = useNavigate();
  const { template, loading, notFound } = useEBookletTemplate(lookupId, {
    legacyInstance: legacyInstanceRoute,
  });
  const { addTemplate } = useEBookletCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lookupId]);

  useEffect(() => {
    if (!legacyInstanceRoute || loading) return;
    const canonicalTemplateId = template?.template_id || template?.templateId || template?.template?.id;
    if (canonicalTemplateId) {
      navigate(`/e-booklets/${canonicalTemplateId}`, { replace: true });
      return;
    }
    if (notFound || template) {
      navigate("/e-booklets", { replace: true });
    }
  }, [legacyInstanceRoute, loading, navigate, notFound, template]);

  if (loading) return <DetailSkeleton />;
  if (legacyInstanceRoute) return <DetailSkeleton />;
  if (notFound || !template) return <NotFoundState t={t} />;

  const handleAddToCart = () => {
    addTemplate(template);
    navigate("/e-booklet-cart");
  };

  const activeVersion = template.activeVersion;
  const isReleased = template.is_released !== false;
  const countdownText = !isReleased
    ? formatTimeUntilRelease(template.time_until_release_ms, t)
    : null;
  const hotspotTypes = [
    { label: t("admin.editor.hotspots.types.text"), Icon: FileText },
    { label: t("admin.editor.hotspots.types.image"), Icon: ImageIcon },
    { label: t("admin.editor.hotspots.types.video"), Icon: Video },
    { label: t("admin.editor.hotspots.types.audio"), Icon: Volume2 },
  ];

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.95),#ffffff_48%)] pt-24 text-foreground">
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-14 pt-8 md:grid-cols-[0.95fr_1.05fr] md:px-6 lg:pt-14">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_-45px_rgba(15,23,42,0.5)]">
          <DetailCover template={template} t={t} />
        </div>

        <div className="min-w-0 md:pt-4">
          <Button asChild variant="ghost" className="-ml-3 mb-5">
            <Link to="/e-booklets">
              <ArrowLeft className="h-4 w-4" />
              {t("common.backToEBooklets")}
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
              {t("details.templateBadge")}
            </Badge>
            {!isReleased && (
              <Badge className="rounded-md bg-amber-100 text-amber-900 hover:bg-amber-100">
                {t("common.comingSoonWithTime", { time: countdownText })}
              </Badge>
            )}
            {template.categoryTitle && (
              <span className="text-sm font-medium text-muted-foreground">
                {template.categoryTitle}
              </span>
            )}
            {template.teacherName && (
              <span className="text-sm font-medium text-muted-foreground">
                {template.teacherName}
              </span>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
            {template.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {template.description || t("details.descriptionFallback")}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("details.stats.pages"), value: template.pageCount || "-", Icon: FileText },
              { label: t("details.stats.hotspots"), value: template.hotspotCount || 0, Icon: MousePointerClick },
              { label: t("details.stats.version"), value: activeVersion?.version_number || "-", Icon: ShieldCheck },
              { label: t("details.stats.access"), value: Number.isFinite(Number(template.seatsRemaining)) ? template.seatsRemaining : t("common.invite"), Icon: Users },
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
                  {t("details.templatePrice")}
                </p>
                <div className="mt-1 text-3xl font-black tracking-tight text-emerald-950">
                  {formatMoney(template.price, template.currency, i18n.language)}
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <Button
                  asChild
                  type="button"
                  size="lg"
                  variant="outline"
                  disabled={!activeVersion?.id || !isReleased}
                  className="w-full active:scale-[0.98] md:w-auto"
                >
                  <Link to={`/e-booklets/${template.template_id || template.id}/preview`}>
                    <Eye className="h-4 w-4" />
                    {t("details.preview")}
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!activeVersion?.id || !isReleased}
                  className="w-full active:scale-[0.98] md:w-auto"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t("details.addToCart")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-20 md:grid-cols-[0.9fr_1.1fr] md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("details.includedTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {t("details.includedDescription")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            t("details.includedItems", { returnObjects: true }),
          ].flat().map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-border/70 bg-white p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
              <span className="text-sm leading-6 text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-6">
        <div className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold tracking-tight">{t("details.hotspotContent")}</h2>
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
                  {t("details.hotspotDescription")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-amber-500/30 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <div className="flex gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              {t("details.antiDownload")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
