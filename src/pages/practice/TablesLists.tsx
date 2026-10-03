import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function TablesLists() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const staticData = [
    { id: 1, name: 'Laptop', price: 999, stock: 'In Stock' },
    { id: 2, name: 'Smartphone', price: 699, stock: 'Low Stock' },
    { id: 3, name: 'Headphones', price: 199, stock: 'Out of Stock' },
  ];

  const sortedData = [...staticData].sort((a, b) => 
    sortOrder === 'asc' ? a.price - b.price : b.price - a.price
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tables & Lists</h1>
        <p className="text-slate-500">Practice extracting data from static, dynamic, and sortable tables.</p>
        
      </div>

      {/* Tables */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Tables</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Sort the table by 'Price' descending",
    "description": "Click the 'Price' column header twice (or as needed) to sort the table in descending order.",
    "positive": [
      "The table rows reorder based on price.",
      "The highest price is in the first row."
    ],
    "negative": [
      "Clicking the header doesn't sort the data.",
      "The sort indicator arrow shows the wrong direction."
    ]
  },
  {
    "title": "Filter the table to show only a specific status",
    "description": "Use the filter input or dropdown to show only rows where the status is 'Active'.",
    "positive": [
      "Only 'Active' rows are visible.",
      "Rows with other statuses are hidden."
    ],
    "negative": [
      "The filter is case-sensitive and fails.",
      "No rows are shown despite matching data existing."
    ]
  },
  {
    "title": "Count the total number of rows matching the filter",
    "description": "After applying a filter, count the visible `<tr>` elements in the table body and verify it matches expectations.",
    "positive": [
      "The counted rows match the expected number.",
      "The pagination 'total results' text matches the count."
    ],
    "negative": [
      "Hidden rows are incorrectly counted.",
      "The count is zero when it shouldn't be."
    ]
  }
]} /></div>
        
        <div className="space-y-8">
          {/* Static Table */}
          <div>
            <h3 className="font-semibold mb-3">Static Table</h3>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left" id="table-static">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staticData.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">${item.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.stock === 'In Stock' ? 'bg-success/10 text-success' :
                          item.stock === 'Out of Stock' ? 'bg-danger/10 text-danger' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {item.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sortable Table */}
          <div>
            <h3 className="font-semibold mb-3">Sortable Table</h3>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm text-left" id="table-sortable">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} id="table-sort-price">
                      <div className="flex items-center gap-2">
                        Price {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">${item.price}</td>
                      <td className="px-4 py-3">{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Lists */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Lists</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Unordered List</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700" id="list-unordered">
              <li>First item</li>
              <li>Second item</li>
              <li>Third item</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Ordered List</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700" id="list-ordered">
              <li>Step one</li>
              <li>Step two</li>
              <li>Step three</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Pagination */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Pagination</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-slate-500" id="pagination-info">Showing page {currentPage} of {totalPages}</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} id="pagination-prev">Previous</Button>
            
            {[1, 2, 3].map(page => (
              <Button 
                key={page}
                variant="outline" 
                className={currentPage === page ? "bg-primary text-white hover:bg-primary/90 border-primary" : ""} 
                onClick={() => handlePageChange(page)}
                id={`pagination-${page}`}
              >
                {page}
              </Button>
            ))}
            
            <span className="px-2">...</span>
            
            <Button 
              variant="outline" 
              className={currentPage === 10 ? "bg-primary text-white hover:bg-primary/90 border-primary" : ""} 
              onClick={() => handlePageChange(10)}
              id="pagination-10"
            >
              10
            </Button>
            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} id="pagination-next">Next</Button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
