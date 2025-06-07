// src/pages/NotificationPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    axios.get("/api/notifications").then((res) => setNotifications(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifikasi</h2>
      <ul className="space-y-4">
        {notifications.map((note) => (
          <li key={note.id} className="p-4 bg-gray-50 border rounded-md shadow">
            <p className="text-sm text-gray-700">{note.message}</p>
            <span className="text-xs text-gray-400">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
