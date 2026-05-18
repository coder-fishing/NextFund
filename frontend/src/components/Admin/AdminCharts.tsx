'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { AdminStats } from '@/services/adminService';

interface AdminChartsProps {
  stats: AdminStats | null;
}

const COLORS = {
  pending: '#fbbf24', // Amber 400
  approved: '#10b981', // Emerald 500
  rejected: '#ef4444', // Red 500
  active: '#3b82f6', // Blue 500
  completed: '#6366f1', // Indigo 500
  cancelled: '#6b7280', // Gray 500
};

export function AdminCharts({ stats }: AdminChartsProps) {
  if (!stats) return null;

  // Data for Status Pie Chart
  const statusData = [
    { name: 'Pending', value: stats.statusBreakdown.pending, color: COLORS.pending },
    { name: 'Approved', value: stats.statusBreakdown.approved, color: COLORS.approved },
    { name: 'Rejected', value: stats.statusBreakdown.rejected, color: COLORS.rejected },
    { name: 'Active', value: stats.statusBreakdown.active, color: COLORS.active },
    { name: 'Completed', value: stats.statusBreakdown.completed, color: COLORS.completed },
    { name: 'Cancelled', value: stats.statusBreakdown.cancelled, color: COLORS.cancelled },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Status Distribution Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Campaign Status</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Bar Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Overview Statistics</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Campaigns', count: stats.totalCampaigns },
                { name: 'Users', count: stats.totalUsers },
                { name: 'Donations', count: stats.totalDonations },
                { name: 'Completed', count: stats.completedGoalCount },
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
