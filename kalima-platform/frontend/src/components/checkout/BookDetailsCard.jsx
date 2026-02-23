import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BookDetailsCard({
  hasBooks,
  bookFields,
  state,
  updateField,
}) {
  const { t } = useTranslation("checkout");

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className=" border-b border-muted pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="w-5 h-5 text-primary" />
          {t("payment.book_details", "Book Details")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 animate-in fade-in duration-500 delay-100">
        {bookFields.includes("nameOnBook") && (
          <div className="space-y-3">
            <Label
              htmlFor="nameOnBook"
              className="font-semibold text-foreground/80"
            >
              {t("payment.name_on_book", "Name on Book")}
            </Label>
            <Input
              id="nameOnBook"
              value={state.nameOnBook}
              onChange={(e) => updateField("nameOnBook", e.target.value)}
              className="h-12"
            />
          </div>
        )}
        {bookFields.includes("numberOnBook") && (
          <div className="space-y-3">
            <Label
              htmlFor="numberOnBook"
              className="font-semibold text-foreground/80"
            >
              {t("payment.number_on_book", "Number on Book")}
            </Label>
            <Input
              id="numberOnBook"
              value={state.numberOnBook}
              onChange={(e) => updateField("numberOnBook", e.target.value)}
              className="h-12"
            />
          </div>
        )}
        {bookFields.includes("seriesName") && (
          <div className="space-y-3">
            <Label
              htmlFor="seriesName"
              className="font-semibold text-foreground/80"
            >
              {t("payment.series_name", "Series Name")}
            </Label>
            <Input
              id="seriesName"
              value={state.seriesName}
              onChange={(e) => updateField("seriesName", e.target.value)}
              className="h-12"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
