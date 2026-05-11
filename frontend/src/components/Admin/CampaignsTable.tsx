import React from 'react';
import { AdminCampaign } from '@/services/adminService';
import { Badge, statusToVariant } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate } from '@/utils/date';
import { truncate } from '@/utils/string';

interface CampaignsTableProps {
  campaigns: AdminCampaign[];
  onStatusUpdate: (id: string, status: 'approved' | 'rejected') => void;
  isLoading: boolean;
}

export function CampaignsTable({
  campaigns,
  onStatusUpdate,
  isLoading,
}: CampaignsTableProps) {
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
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Phân tích AI</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Tiến độ</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Ngày tạo</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => {
            const progress = (c.currentAmount / c.goalAmount) * 100;
            const trustScore = c.aiTrustScore ?? 0;
            const hasAiAnalysis = c.aiPrediction !== undefined;

            return (
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
                  <Badge variant={statusToVariant[c.status]}>
                    {c.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  {hasAiAnalysis ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${trustScore >= 80 ? 'text-emerald-600' : trustScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          Score: {trustScore}
                        </span>
                        <Badge variant={c.aiPrediction === 'approved' ? 'emerald' : c.aiPrediction === 'rejected' ? 'red' : 'violet'}>
                          {c.aiPrediction?.toUpperCase()}
                        </Badge>
                      </div>
                      {c.aiReasons && c.aiReasons.length > 0 && (
                        <p className="text-[10px] text-gray-500 max-w-[150px] truncate" title={c.aiReasons.join(', ')}>
                          {c.aiReasons[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Chưa phân tích</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="w-full max-w-[100px]">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {formatDate(c.createdAt)}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    {(c.status === 'pending' || c.status === 'manual') && (
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
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
