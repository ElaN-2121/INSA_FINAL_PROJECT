import { useEffect, useState } from 'react';
import { get, patch, formatDateTime, timeAgo } from '@ethiocred/utils';
import Loader from '../../components/Loader/Loader.jsx';

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => !notification.is_read && handleMarkRead(notification.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                notification.is_read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-l-4 border-l-blue-500 border-gray-200 font-semibold'
              }`}
            >
              <p className={`text-sm ${notification.is_read ? 'text-gray-700 font-normal' : 'text-gray-900'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {timeAgo(notification.created_at)} · {formatDateTime(notification.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
