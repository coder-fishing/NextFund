'use client';

import React, { useState } from 'react';
import { AdminCampaign } from '@/services/adminService';

interface CampaignDetailModalProps {
  campaign: AdminCampaign;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'approved' | 'rejected') => Promise<boolean> | void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

const aiPredictionColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  manual: 'bg-violet-50 text-violet-700 border-violet-100',
};

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onStatusUpdate,
}: CampaignDetailModalProps) {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(campaign.receiveWalletAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (err) {
      console.error('Failed to copy wallet:', err);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(campaign.creator);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const success = await onStatusUpdate(campaign._id, status);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercent = campaign.goalAmount > 0 
    ? Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100))
    : 0;

  // Format AI trust score as a percentage (handles 0.85 -> 85% or 85 -> 85%)
  const formattedTrustScore = campaign.aiTrustScore !== undefined && campaign.aiTrustScore !== null
    ? campaign.aiTrustScore <= 1
      ? Math.round(campaign.aiTrustScore * 100)
      : Math.round(campaign.aiTrustScore)
    : null;

  // Modals are only actionable if status is pending or manual
  const isActionable = campaign.status === 'pending' || campaign.status === 'manual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 truncate max-w-[400px]">
              Chi tiết chiến dịch
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {campaign.status.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Campaign Image */}
          {campaign.image && campaign.image.length > 0 && (
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img 
                src={campaign.image[0]} 
                alt={campaign.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Campaign Title & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                {campaign.category || 'General'}
              </span>
              <span className="text-xs text-gray-400">
                Mã: {campaign._id}
              </span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 leading-snug">
              {campaign.title}
            </h4>
          </div>

          {/* Goal & Current Progress */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Đã đạt được</span>
                <span className="text-lg font-bold text-emerald-600">{campaign.currentAmount} ETH</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Mục tiêu</span>
                <span className="text-sm font-semibold text-gray-700">{campaign.goalAmount} ETH</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1 font-semibold">
                <span>Tiến độ</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator info */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium block">Người tạo</span>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-700 truncate flex-1">
                  {campaign.creator}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="text-gray-400 hover:text-emerald-600 p-1 rounded transition-colors"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Receiving Wallet */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium block">Địa chỉ ví nhận tiền</span>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-700 truncate flex-1" title={campaign.receiveWalletAddress}>
                  {campaign.receiveWalletAddress}
                </span>
                <button
                  onClick={handleCopyWallet}
                  className="text-gray-400 hover:text-emerald-600 p-1 rounded transition-colors"
                  title="Copy wallet address"
                >
                  {copiedWallet ? (
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium block">Ngày tạo</span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 block">
                {formatDate(campaign.createdAt)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium block">Hạn cuối</span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 block">
                {formatDate(campaign.endDate)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="text-xs text-gray-400 font-medium block">Mô tả chi tiết</span>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {campaign.description}
            </div>
          </div>

          {/* AI Prediction Analysis */}
          {(campaign.aiPrediction || formattedTrustScore !== null || (campaign.aiReasons && campaign.aiReasons.length > 0)) && (
            <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
                <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Phân tích tự động AI
                </span>
                
                {campaign.aiPrediction && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${aiPredictionColors[campaign.aiPrediction.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                    AI: {campaign.aiPrediction.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI Score */}
                {formattedTrustScore !== null && (
                  <div className="md:col-span-1 flex flex-col justify-center items-center bg-white rounded-xl p-3 border border-indigo-100/40">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Độ tin cậy</span>
                    <span className={`text-2xl font-black mt-1 ${
                      formattedTrustScore >= 80 ? 'text-emerald-600' :
                      formattedTrustScore >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {formattedTrustScore}%
                    </span>
                  </div>
                )}

                {/* AI Reasons */}
                {campaign.aiReasons && campaign.aiReasons.length > 0 && (
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Các điểm lưu ý (Rules)</span>
                    <ul className="space-y-1">
                      {campaign.aiReasons.map((reason, index) => (
                        <li key={index} className="text-xs text-indigo-900 flex items-start gap-1">
                          <span className="text-indigo-400 mt-0.5 select-none">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 disabled:opacity-50 transition-all cursor-pointer font-sans"
          >
            Hủy
          </button>

          {isActionable && (
            <>
              <button
                onClick={() => handleAction('rejected')}
                disabled={isProcessing}
                className="px-5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white border border-red-100 disabled:opacity-50 transition-all cursor-pointer font-sans"
              >
                Từ chối
              </button>

              <button
                onClick={() => handleAction('approved')}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white border border-emerald-100 disabled:opacity-50 transition-all cursor-pointer font-sans"
              >
                Duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
