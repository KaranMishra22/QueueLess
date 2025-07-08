import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaUserClock, FaTicketAlt } from 'react-icons/fa';

const socket = io('http://localhost:5000');

export default function Queue() {
  const { serviceId } = useParams();
  const locationHook = useLocation();
  const [tokens, setTokens] = useState([]);
  const [name, setName] = useState('');
  const [myToken, setMyToken] = useState(null);
  const [modeScan, setModeScan] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(locationHook.search);
    const isScan = queryParams.get('mode') === 'scan';
    setModeScan(isScan);

    if (isScan) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (err) => {
            console.error(err);
            setLocationError('Location access denied. You must allow location to join this queue.');
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser.');
      }
    }
  }, [locationHook.search]);

  useEffect(() => {
    fetchQueue();

    socket.on(`queueUpdate-${serviceId}`, (updatedQueue) => {
      setTokens(updatedQueue);
    });

    return () => socket.off(`queueUpdate-${serviceId}`);
  }, [serviceId]);

  const fetchQueue = async () => {
    const res = await axios.get(`http://localhost:5000/api/queue/status/${serviceId}`);
    setTokens(res.data);
  };

  const joinQueue = async () => {
    if (modeScan && (!userLocation || locationError)) {
      alert(locationError || 'Location not available. Try again.');
      return;
    }

    const res = await axios.post(`http://localhost:5000/api/queue/join`, {
      userName: name,
      serviceId,
      location: userLocation
    });

    setMyToken(res.data);
  };

  const getPositionInLine = () => {
    if (!myToken) return null;
    const activeQueue = tokens.filter(t => ['waiting', 'arrived'].includes(t.status));
    const index = activeQueue.findIndex(t => t._id === myToken._id);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <FaTicketAlt className="text-blue-600" />
        Queue for: <span className="text-blue-600">{serviceId}</span>
      </h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter your name"
          onChange={e => setName(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring focus:border-blue-500"
        />
        <button
          onClick={joinQueue}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          Join Queue
        </button>
      </div>

      {locationError && modeScan && (
        <div className="text-sm text-red-600 mb-4">{locationError}</div>
      )}

      {myToken && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-green-200 w-full max-w-md">
          <h3 className="text-lg font-semibold text-green-600">
            🎉 You joined the queue!
          </h3>
          <p className="text-gray-700">Your Token Number: <strong>#{myToken.tokenNumber}</strong></p>
          <p className="text-sm text-gray-500 italic">Status: {myToken.status}</p>
          <p className="text-sm text-gray-500 mb-1">Joined via: {myToken.isOnSite ? 'On-site (Scan)' : 'Remote'}</p>
          {getPositionInLine() && (
            <p className="text-sm text-blue-600 font-medium">🎯 You are {getPositionInLine()} in line.</p>
          )}
        </div>
      )}

      <h3 className="text-xl font-medium mb-2 text-gray-700">Current Queue</h3>
      <ul className="w-full max-w-md space-y-3">
        {tokens
          .filter(t => ['waiting', 'arrived'].includes(t.status))
          .map((t, i) => (
            <li
              key={t._id}
              className={`flex items-center justify-between px-4 py-2 rounded-md shadow-sm transform transition-all duration-300 ease-in-out
                ${t._id === myToken?._id ? 'bg-yellow-100 border border-yellow-300 font-semibold' : 'bg-white'}
              `}
            >
              <span>#{t.tokenNumber} - {t.userName}</span>
              <span className="text-sm italic text-gray-500">{t.status}</span>
            </li>
        ))}
      </ul>
    </div>
  );
}
