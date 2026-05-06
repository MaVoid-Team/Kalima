import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CircleDollarSign,
  FileText,
  ImageIcon,
  LockKeyhole,
  Search,
  ShieldCheck,
  ShoppingBag,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEBookletCart, useEBookletStore } from "@/hooks/useEBooklets";

const formatMoney = (amount, currency = "EGP") => {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

function StoreSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr]">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-lg border border-border/70 bg-card p-4",
            index === 0 && "md:col-span-2 xl:row-span-2",
          )}
        >
          <Skeleton className="aspect-[4/3] w-full rounded-md" />
          <Skeleton className="mt-5 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function EBookletCover({ template, featured = false }) {
  if (template.coverUrl) {
    return (
      <img
        src={template.coverUrl}
        alt={`${template.title} cover`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(135deg,#f8fafc,#ecfdf5_55%,#fff7ed)] p-5 text-slate-900">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Kalima
        </span>
        <BookOpenCheck className={cn("text-emerald-700", featured ? "h-8 w-8" : "h-6 w-6")} />
      </div>
      <div>
        <div className={cn("font-bold leading-tight", featured ? "text-3xl" : "text-xl")}>
          Interactive booklet
        </div>
        <div className="mt-2 h-1 w-14 rounded-full bg-emerald-600" />
      </div>
    </div>
  );
}

function EBookletCard({ template, featured, onAdd }) {
  return (
    <article
      className={cn(
        "group grid overflow-hidden rounded-lg border border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]",
        featured ? "md:grid-cols-[0.92fr_1.08fr] xl:row-span-2" : "grid-rows-[auto_1fr]",
      )}
    >
      <Link
        to={`/e-booklets/${template.slug}`}
        className={cn(
          "block overflow-hidden bg-muted",
          featured ? "min-h-[300px] md:min-h-full" : "aspect-[4/3]",
        )}
      >
        <EBookletCover template={template} featured={featured} />
      </Link>

      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
            E-Booklet
          </Badge>
          {template.categoryTitle && (
            <span className="text-xs font-medium text-muted-foreground">
              {template.categoryTitle}
            </span>
          )}
        </div>

        <Link
          to={`/e-booklets/${template.slug}`}
          className={cn(
            "mt-4 line-clamp-2 font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-800",
            featured ? "text-2xl md:text-3xl" : "text-xl",
          )}
        >
          {template.title}
        </Link>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {template.description || "Interactive PDF booklet delivered by admin with teacher branding and controlled student access."}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="rounded-md border border-border/70 px-3 py-2">
            <FileText className="mb-1 h-4 w-4 text-foreground" />
            <span>{template.pageCount || "Page"} pages</span>
          </div>
          <div className="rounded-md border border-border/70 px-3 py-2">
            <Video className="mb-1 h-4 w-4 text-foreground" />
            <span>{template.hotspotCount || 0} hotspots</span>
          </div>
          <div className="rounded-md border border-border/70 px-3 py-2">
            <LockKeyhole className="mb-1 h-4 w-4 text-foreground" />
            <span>No download</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Price
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatMoney(template.price, template.currency)}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onAdd(template)}
            disabled={!template.activeVersion?.id}
            className="active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onClearSearch }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        <BookOpenCheck className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight">
        No e-booklets are published yet
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Published e-booklet templates will appear here after the admin prepares
        the secure PDF version, cover, price, and hotspot content.
      </p>
      <Button type="button" variant="outline" onClick={onClearSearch} className="mt-6">
        Clear search
      </Button>
    </div>
  );
}

export default function EBookletStorePage() {
  const navigate = useNavigate();
  const { replaceWithTemplate } = useEBookletCart();
  const [searchValue, setSearchValue] = useState("");
  const {
    templates,
    filters,
    loading,
    pagination,
    setSearch,
    setPage,
  } = useEBookletStore({ limit: 12 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchValue.trim());
  };

  const handleAddToCart = (template) => {
    replaceWithTemplate(template);
    navigate("/e-booklet-cart");
  };

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.limit));

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1)_42%)] pt-24 text-foreground">
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-10 pt-8 md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:pt-14">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
            <ShieldCheck className="h-4 w-4" />
            Invite-only interactive booklets
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            E-booklets built for branded classroom delivery.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Browse reusable booklet templates, request admin customization, and
            keep the final PDF private with watermarking, page-by-page access,
            and invite-controlled student entry.
          </p>
        </div>

        <div className="grid content-end gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Access model
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Template plus teacher PDF
                </h2>
              </div>
              <LockKeyhole className="h-8 w-8 text-emerald-800" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              {[
                { label: "Text", Icon: FileText },
                { label: "Image", Icon: ImageIcon },
                { label: "Video", Icon: Video },
                { label: "Audio", Icon: Volume2 },
                { label: "Private", Icon: LockKeyhole },
                { label: "Quota", Icon: CircleDollarSign },
              ].map(({ label, Icon }) => (
                <div key={label} className="rounded-md border border-border/70 p-3">
                  <Icon className="mb-2 h-4 w-4 text-emerald-800" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-6">
        <div className="mb-7 flex flex-col gap-4 border-t border-border/80 pt-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">E-booklet store</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Separate catalog for interactive booklets. Normal Market product
              logic is not used here.
            </p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search e-booklet templates"
              className="h-11 pl-9"
            />
          </form>
        </div>

        {filters.search && (
          <div className="mb-5 flex items-center justify-between rounded-md border border-border/70 bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Search results for <strong className="text-foreground">{filters.search}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                setSearch("");
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <StoreSkeleton />
        ) : templates.length === 0 ? (
          <EmptyState
            onClearSearch={() => {
              setSearchValue("");
              setSearch("");
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr]">
              {templates.map((template, index) => (
                <EBookletCard
                  key={template.id}
                  template={template}
                  featured={index === 0}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm">
                <span className="text-muted-foreground">
                  Page {pagination.page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pagination.page >= totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
