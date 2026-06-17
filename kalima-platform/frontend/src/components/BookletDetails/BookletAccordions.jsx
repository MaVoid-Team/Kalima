import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export default function BookletAccordions({ product }) {
  const { t } = useTranslation("product");

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mt-6"
      defaultValue="about"
    >
      {/* About this Resource */}
      <AccordionItem value="about" className="border-b px-1">
        <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
          {t("booklet.aboutResource", "About this Resource")}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          <p className="mb-4">{product.description}</p>
          <ul className="list-disc ps-5 space-y-1">
            <li>
              <strong>Grade Level:</strong> {product.gradeLevel || "4 - 6"}
            </li>
            <li>
              <strong>Subject:</strong>{" "}
              {product.subject || "Earth Sciences, Biology"}
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Curriculum Alignment */}
      <AccordionItem value="curriculum" className="border-b px-1">
        <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
          {t("booklet.curriculumAlignment", "Curriculum Alignment")}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>
            Aligned with Next Generation Science Standards (NGSS) for 5th Grade
            Life Science.
          </p>
        </AccordionContent>
      </AccordionItem>

      {/* File Details */}
      <AccordionItem value="files" className="border-b px-1">
        <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
          {t("booklet.fileDetails", "File Details")}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>PDF (A4 and Letter size included). 20 Pages total.</p>
        </AccordionContent>
      </AccordionItem>

      {/* Publisher Info */}
      <AccordionItem value="publisher" className="border-b px-1">
        <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
          {t("booklet.publisherInfo", "Publisher Info")}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          <p>
            ScienceWithSarah - Creating interactive learning materials since
            2018.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
