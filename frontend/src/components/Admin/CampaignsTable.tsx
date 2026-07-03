import React, { useState } from 'react';
import { AdminCampaign } from '@/services/adminService';
import { CampaignDetailModal } from './CampaignDetailModal';

interface CampaignsTableProps {
  campaigns: AdminCampaign[];
  onStatusUpdate: (id: string, status: 'approved' | 'rejected') => Promise<boolean> | void;
  isLoading: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  active: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  manual: 'bg-violet-100 text-violet-700 border-violet-200',
};

export function CampaignsTable({
  campaigns,
  onStatusUpdate,
  isLoading,
}: CampaignsTableProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<AdminCampaign | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        Không có chiến dịch nào được tìm thấy.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Thông tin</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Phân tích AI</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Tiến độ</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Ngày tạo</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr
              key={c._id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <td className="py-4 px-4">
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                    {truncate(c.title, 40)}
                  </p>
                  <p className="text-xs text-gray-500">{c.creator}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    statusColors[c.status] || 'bg-gray-100'
                  }`}
                >
                  {c.status.toUpperCase()}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="w-full max-w-[100px]">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>{Math.round((c.currentAmount / c.goalAmount) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          (c.currentAmount / c.goalAmount) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">
                {formatDate(c.createdAt)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onStatusUpdate(c._id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => onStatusUpdate(c._id, 'rejected')}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedCampaign(c)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Xem chi tiết"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onStatusUpdate={onStatusUpdate}
        />
      )}
    </div>
  );
}
