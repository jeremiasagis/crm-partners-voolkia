"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TablePaginationProps = {
  total: number;
  page: number; // 0-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-sm text-muted-warm">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v));
            onPageChange(0);
          }}
        >
          <SelectTrigger className="h-8 w-[80px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="tabular-nums">
          {page + 1} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={page >= pages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
