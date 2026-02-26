"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Szukaj...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      {filterColumn && (
        <Input
          placeholder={filterPlaceholder}
          value={
            (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn(filterColumn)?.setFilterValue(e.target.value)
          }
          className="max-w-sm h-10 border-[#EEEEEE]"
        />
      )}
      <div className="rounded-xl border border-[#EEEEEE] overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-[#FAFAFA] hover:bg-[#FAFAFA]"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[#8C8C8C] text-xs font-medium uppercase tracking-wide"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-[#FAFAFA] border-[#EEEEEE]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm text-[#1F1F1F]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-[#8C8C8C]"
                >
                  Brak danych.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#8C8C8C]">
            Strona {table.getState().pagination.pageIndex + 1} z{" "}
            {table.getPageCount()}
          </p>
          <span className="text-[#EEEEEE]">|</span>
          <label className="flex items-center gap-1.5 text-sm text-[#8C8C8C]">
            Wierszy na stronie:
            <Input
              type="number"
              min={1}
              max={200}
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) table.setPageSize(val);
              }}
              className="h-8 w-16 border-[#EEEEEE] text-center text-sm px-1"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-[#EEEEEE] text-[#1F1F1F] hover:bg-[#FAFAFA]"
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-[#EEEEEE] text-[#1F1F1F] hover:bg-[#FAFAFA]"
          >
            Następna
          </Button>
        </div>
      </div>
    </div>
  );
}
