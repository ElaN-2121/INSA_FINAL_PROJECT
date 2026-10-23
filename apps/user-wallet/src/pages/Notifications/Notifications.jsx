import { Loader } from '@ethiocred/ui';
import { useEffect, useState } from 'react';
import { get, patch, formatDateTime, timeAgo } from '@ethiocred/utils';

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => !notification.is_read && handleMarkRead(notification.id)}
              className={`w-full rounded-lg border border-gray-200 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                notification.is_read
                  ? 'border-l-4 border-l-transparent bg-white p-5'
                  : 'border-l-4 border-l-blue-500 bg-blue-50/50 p-5 shadow-sm'
              }`}
            >
              <p
                className={`text-sm leading-relaxed ${
                  notification.is_read ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
                }`}
              >
                {notification.message}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {timeAgo(notification.created_at)} · {formatDateTime(notification.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
