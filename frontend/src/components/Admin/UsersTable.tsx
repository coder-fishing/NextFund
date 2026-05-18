import React from 'react';
import { AdminUser } from '@/services/adminService';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
       No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Người dùng</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Quyền</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600">Ví / Provider</th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-center">
              Số chiến dịch
            </th>
            <th className="py-4 px-4 text-sm font-semibold text-gray-600 text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-50">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="text-xs">
                  <p className="text-gray-700 font-mono">
                    {u.walletAddress
                      ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}`
                      : 'Chưa liên kết ví'}
                  </p>
                  <p className="text-gray-400 italic">via {u.provider}</p>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold">
                  {u.campaignCount}
                </span>
              </td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
