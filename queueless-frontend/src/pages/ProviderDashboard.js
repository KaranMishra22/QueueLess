import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

const socket = io('http://localhost:5000');

export default function ProviderDashboard() {
  const serviceId = 'salon123';
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    fetchTokens();

    socket.on(`queueUpdate-${serviceId}`, (updatedQueue) => {
      setTokens(updatedQueue);
    });

    return () => socket.off(`queueUpdate-${serviceId}`);
  }, []);

  const fetchTokens = async () => {
    const res = await axios.get(`http://localhost:5000/api/queue/status/${serviceId}`);
    setTokens(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.patch(`http://localhost:5000/api/queue/update/${id}`, { status });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Provider Dashboard – <span className="text-blue-600">{serviceId}</span>
      </h2>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-blue-100 text-blue-800">
            <tr>
              <th className="px-4 py-2">Token #</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr
                key={t._id}
                className={`border-b hover:bg-gray-50 ${
                  t.isCurrent ? 'bg-yellow-100 font-semibold' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-700">#{t.tokenNumber}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  {t.userName}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.isOnSite ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.isOnSite ? 'On-Site' : 'Remote'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${t.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      t.status === 'arrived' ? 'bg-indigo-100 text-indigo-700' :
                      t.status === 'served' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => updateStatus(t._id, 'arrived')}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Mark Arrived"
                  >
                    <FaClock />
                  </button>
                  <button
                    onClick={() => updateStatus(t._id, 'served')}
                    className="text-green-600 hover:text-green-800"
                    title="Mark Served"
                  >
                    <FaCheckCircle />
                  </button>
                  <button
                    onClick={() => updateStatus(t._id, 'skipped')}
                    className="text-red-600 hover:text-red-800"
                    title="Skip"
                  >
                    <FaTimesCircle />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tokens.length === 0 && (
          <div className="text-center text-gray-400 mt-6">No tokens in the queue yet.</div>
        )}
      </div>
    </div>
  );
}
