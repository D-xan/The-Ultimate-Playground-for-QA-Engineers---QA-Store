import React, { useEffect, useState, useMemo } from 'react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowUpDown, Edit, Trash2, Plus } from 'lucide-react';
import { getTestId } from '@/utils/testUtils';

type Product = any;

export default function AdminProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  useEffect(() => {
    api.products.getAll().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const columnHelper = createColumnHelper<Product>();

  const columns = useMemo(() => [
    columnHelper.accessor('sku', {
      header: 'SKU',
      cell: info => <span className="font-mono text-xs font-semibold text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Product Name',
      cell: info => <span className="font-medium text-slate-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => <span className="font-medium text-slate-700">${info.getValue()}</span>,
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: info => {
        const val = info.getValue();
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${val < 10 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
            {val} in stock
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your product catalog</p>
        </div>
        <Button className="shrink-0" data-testid={getTestId('admin-add-product-btn')}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-slate-50/50">
          <Input 
            placeholder="Search products..." 
            className="max-w-sm bg-white" 
            data-testid={getTestId('admin-product-search')}
          />
        </div>
        
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading mock data...</div>
          ) : (
            <table className="w-full text-left text-sm" data-testid={getTestId('admin-products-table')}>
              <thead className="bg-slate-50 text-slate-600 border-b border-border">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="px-6 py-4 font-semibold uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2 hover:text-primary transition-colors' : ''}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="border-t border-border bg-slate-50 p-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
