import React, { useEffect, useState } from "react";
import { getRevenueSummary, getRevenueBreakdown } from "../../routes/revenue";

export default function Revenue() {
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [sumData, breakdownData] = await Promise.all([
          getRevenueSummary(),
          getRevenueBreakdown()
        ]);
        setSummary(sumData);
        setBreakdown(breakdownData);
      } catch {
        setError("Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><button className="btn btn-primary loading">Loading</button></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: summary.totalRevenue },
          { title: 'Lesson Revenue', value: summary.totalLessonRevenue },
          { title: 'Booklet Revenue', value: summary.totalBookletRevenue },
          { title: 'Attendances Paid', value: summary.totalAttendancesPaid }
        ].map((item, idx) => (
          <div key={idx} className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 shadow-primary">
            <div className="card-body">
              <h2 className="card-title">{item.title}</h2>
              <p className="text-3xl font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakdown.map((row, idx) => (
          <div key={idx} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title capitalize">{row.paymentType} {row.bookletPurchased ? '(with booklet)' : ''}</h3>
              <div className="mt-2 space-y-1">
                <p><span className="font-semibold">Count:</span> {row.count}</p>
                <p><span className="font-semibold">Lesson Rev:</span> {row.totalLessonRevenue}</p>
                <p><span className="font-semibold">Booklet Rev:</span> {row.totalBookletRevenue}</p>
                <p><span className="font-semibold">Total Rev:</span> {row.totalRevenue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
