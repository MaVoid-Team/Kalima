"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className="kalima-scrollbar relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground [&_tr]:border-b", className)}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/table-row border-b transition-colors hover:bg-muted/50 focus-within:bg-muted/40 data-[state=selected]:bg-muted",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  numeric = false,
  actions = false,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-start align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        numeric && "text-end tabular-nums",
        actions && "w-0 text-end",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  numeric = false,
  date = false,
  status = false,
  actions = false,
  truncate = false,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]",
        numeric && "text-end tabular-nums font-medium",
        date && "text-muted-foreground tabular-nums",
        status && "[&_[data-slot=badge]]:rounded-full",
        actions && "w-0 text-end transition-opacity md:opacity-80 md:group-hover/table-row:opacity-100 md:group-focus-within/table-row:opacity-100",
        truncate && "max-w-[18rem] truncate",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
