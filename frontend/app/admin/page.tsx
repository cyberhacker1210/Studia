'use client';

import { useState } from 'react';
import { Mail, Calendar, Globe } from 'lucide-react';

export default function AdminPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/waitlist', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
        setAuthenticated(true);
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Error fetching emails');
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin secret"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Access Dashboard'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Hint: Check your .env.local for ADMIN_SECRET
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Waitlist Dashboard
            </h1>
            <div className="text-sm text-gray-600">
              Total: <span className="font-bold text-2xl text-primary-600">{emails.length}</span>
            </div>
          </div>

          {emails.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No signups yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Language</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-600">{entry.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{entry.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Globe size={16} className="text-gray-400" />
                          <span className="uppercase text-sm font-medium text-primary-600">
                            {entry.language}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={fetchEmails}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                const csv = [
                  ['ID', 'Email', 'Language', 'Date'],
                  ...emails.map(e => [e.id, e.email, e.language, new Date(e.createdAt).toISOString()])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `studia-waitlist-${Date.now()}.csv`;
                a.click();
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}