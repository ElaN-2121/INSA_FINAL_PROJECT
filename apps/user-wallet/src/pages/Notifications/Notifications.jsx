import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { get, patch, formatDateTime, timeAgo } from '@ethiocred/utils';
import { Loader, Button, PageHeader, EmptyState, Badge } from '@ethiocred/ui';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = () => {
    get('/notifications')
      .then(({ data }) => setNotifications(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  // Group notifications chronologically
  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Earlier This Week': [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;

    notifications.forEach((item) => {
      const itemTime = new Date(item.created_at).getTime();
      if (itemTime >= today) {
        groups.Today.push(item);
      } else if (itemTime >= yesterday) {
        groups.Yesterday.push(item);
      } else if (itemTime >= weekAgo) {
        groups['Earlier This Week'].push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Activity alerts, consent requests, and credential issuance updates."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <CheckCheck className="mr-1.5 h-4 w-4 text-slate-500" />
              {markingAll ? 'Marking All...' : 'Mark All Read'}
            </Button>
          ) : null
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely up to date. You will receive notifications when employers request verification access or universities issue new credentials."
        />
      ) : (
        <div className="space-y-8">
          {groupedNotifications.map(([groupTitle, items]) => (
            <div key={groupTitle} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {groupTitle}
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-2">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                    className={`relative flex items-start gap-4 rounded-xl border p-4.5 transition-all duration-200 cursor-pointer ${
                      notification.is_read
                        ? 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                        : 'border-navy-300 bg-navy-50/50 hover:bg-navy-50/80 shadow-md ring-1 ring-navy-200'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notification.is_read && (
                      <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    )}

                    {/* Icon */}
                    <div
                      className={`rounded-lg p-2.5 shrink-0 ${
                        notification.is_read
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-navy-800 text-white'
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <p
                        className={`text-sm leading-relaxed ${
                          notification.is_read ? 'text-slate-700' : 'text-slate-900 font-semibold'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span>{timeAgo(notification.created_at)}</span>
                        <span>·</span>
                        <span>{formatDateTime(notification.created_at)}</span>
                        {!notification.is_read && (
                          <span className="text-emerald-700 font-medium">New alert</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
