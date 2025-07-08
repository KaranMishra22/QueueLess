import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaChalkboardTeacher } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to <span className="text-blue-600">QueueLess</span></h1>
        <p className="text-gray-600 mb-8 text-sm">Skip the wait. Manage your queue — virtually and smartly.</p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/queue/salon123')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            <FaUserPlus className="text-xl" />
            Join Salon Queue
          </button>

          <button
            onClick={() => navigate('/provider')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
          >
            <FaChalkboardTeacher className="text-xl" />
            Go to Provider Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
