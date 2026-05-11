import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className={`p-6 rounded-2xl text-green shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>

      </div>
    </div>
  );
}
