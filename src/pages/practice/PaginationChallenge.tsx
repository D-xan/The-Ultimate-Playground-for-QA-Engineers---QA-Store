import React, { useEffect, useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { api } from '@/utils/api';
import { ProductCard } from '@/components/customer/ProductCard';
import { Button } from '@/components/ui/Button';

export default function PaginationChallenge() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const all = await api.products.getAll();
        setProducts(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Store Pagination</h1>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Navigate to the second page of the table",
    "description": "Locate the pagination controls and click the button for page '2' or 'Next'.",
    "positive": [
      "The table updates to show page 2 data.",
      "The 'Page 2' button becomes the active indicator."
    ],
    "negative": [
      "Clicking 'Next' on the last page goes past the end.",
      "The table data doesn't change."
    ]
  },
  {
    "title": "Verify that the pagination state updates correctly",
    "description": "Check the UI text that says 'Showing X to Y of Z results' to ensure it reflects the correct current page.",
    "positive": [
      "The 'Showing X to Y' text accurately reflects the page.",
      "The total results count remains consistent."
    ],
    "negative": [
      "The text shows incorrect numbers (e.g., Showing 11 to 20 of 5).",
      "The state text disappears."
    ]
  },
  {
    "title": "Extract the names of items on the last page",
    "description": "Navigate to the last page and scrape the text of all items listed in a specific column.",
    "positive": [
      "The script successfully navigates to the end.",
      "An array of names is extracted correctly."
    ],
    "negative": [
      "The script fails to identify the last page button.",
      "The extracted array is empty."
    ]
  }
]} /></div>
        <p className="text-slate-500">Practice automating page navigation through a catalog of real products.</p>
        
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-64 rounded-xl bg-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4" id="pagination-product-grid">
          {currentProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-border mt-8 flex flex-col items-center gap-4">
          <div className="text-sm text-slate-500" id="pagination-info">Showing page {currentPage} of {totalPages}</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} id="pagination-prev">Previous</Button>
            
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return <span key={`dots-${index}`} className="px-2 text-slate-400">...</span>;
              }
              return (
                <Button 
                  key={page}
                  variant="outline" 
                  className={currentPage === page ? "bg-primary text-white hover:bg-primary/90 border-primary" : ""} 
                  onClick={() => handlePageChange(page as number)}
                  id={`pagination-${page}`}
                >
                  {page}
                </Button>
              )
            })}
            
            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} id="pagination-next">Next</Button>
          </div>
        </section>
      )}
    </div>
  );
}
