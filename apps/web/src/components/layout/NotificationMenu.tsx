'use client';

import React, { useState } from 'react';

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 'notif-1',
      title: 'GSTR-3B Due Soon',
      desc: 'GST Return filing is due in 5 days for May 2024.',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'New WhatsApp Extraction',
      desc: 'Invoice from Rahul Traders extracted with 96% AI confidence.',
      time: '4h ago',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Stock Alert',
      desc: 'Cement 50kg bags are low on stock.',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer"
        aria-label="View notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-lg py-2 z-50 animate-in fade-in duration-150">
            <div className="px-4 py-2 border-b border-outline-variant/50 flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface font-bold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setUnreadCount(0)}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-surface-container-low transition-colors ${
                    notif.unread ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-xs font-bold text-on-surface">{notif.title}</span>
                    <span className="text-[10px] text-on-surface-variant">{notif.time}</span>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant mt-1">{notif.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
