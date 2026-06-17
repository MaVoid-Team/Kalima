import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  FileText,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEBookletCart } from "@/hooks/useEBooklets";
import { useTranslation } from "react-i18next";

const formatMoney = (amount, currency = "EGP", language = "en") => {
  return new Intl.NumberFormat(language?.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

function EmptyCart({ t }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {t("cart.emptyTitle")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("cart.emptyDescription")}
      </p>
      <Button asChild className="mt-7">
        <Link to="/e-booklets">{t("common.browse")}</Link>
      </Button>
    </main>
  );
}

export default function EBookletCartPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const navigate = useNavigate();
  const { items, total, currency, removeItem, clear, count } = useEBookletCart();

  if (items.length === 0) return <EmptyCart t={t} />;

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff_42%)] pt-24 text-foreground">
      <section className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-20 pt-10 md:grid-cols-[1fr_380px] md:px-6">
        <div>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
                {t("cart.badge")}
              </Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                {t("cart.title")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t("cart.description")}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={clear}>
              <Trash2 className="h-4 w-4" />
              {t("cart.clear", { defaultValue: "Clear cart" })}
            </Button>
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.template_id || item.id} className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[240px_1fr]">
                <div className="min-h-[240px] bg-[linear-gradient(135deg,#f8fafc,#ecfdf5_56%,#fff7ed)] p-5">
                  <div className="flex h-full flex-col justify-between text-slate-950">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Kalima
                      </span>
                      <BookOpenCheck className="h-7 w-7 text-emerald-800" />
                    </div>
                    <div>
                      <div className="text-2xl font-black leading-tight tracking-tight">
                        {t("common.eBooklet")}
                      </div>
                      <div className="mt-2 h-1 w-14 rounded-full bg-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.description || t("cart.itemFallback")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.template_id)}
                      title={t("cart.removeTitle")}
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t("common.quantity"), value: "1", Icon: ShoppingBag },
                      { label: t("common.pages"), value: item.pageCount || "-", Icon: FileText },
                      { label: t("common.access"), value: t("common.invite"), Icon: Users },
                      { label: t("common.file"), value: t("common.private"), Icon: LockKeyhole },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="rounded-md border border-border/70 p-3">
                        <Icon className="mb-2 h-4 w-4 text-emerald-800" />
                        <div className="font-bold text-foreground">{value}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                    <span className="text-sm text-muted-foreground">
                      {t("cart.templatePrice")}
                    </span>
                    <span className="text-xl font-black">
                      {formatMoney(item.price, item.currency, i18n.language)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
          <h2 className="text-xl font-bold tracking-tight">{t("cart.summary")}</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("common.quantity")}</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("common.subtotal")}</span>
              <span className="font-semibold">{formatMoney(total, currency, i18n.language)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("common.payment")}</span>
              <span className="font-semibold">{t("common.manual")}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 text-base">
              <span className="font-bold">{t("common.total")}</span>
              <span className="font-black">{formatMoney(total, currency, i18n.language)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-emerald-700/20 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <ShieldCheck className="mb-2 h-5 w-5" />
            {t("cart.adminNotice")}
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => navigate("/e-booklet-checkout")}
            className="mt-6 w-full active:scale-[0.98]"
          >
            {t("cart.checkout")}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/e-booklets">{t("cart.keepBrowsing")}</Link>
          </Button>
        </aside>
      </section>
    </main>
  );
}
