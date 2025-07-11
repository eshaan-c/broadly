import React, { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.getPrograms({ country: 'Spain' });
        setPrograms(response.programs);
      } catch (err) {
        setError('Failed to fetch programs');
        console.error(err);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="p-4 bg-blue-500 text-white">
      <h1 className="text-3xl font-bold underline">Abroadly</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="mt-4">
        {programs.map((program) => (
          <li key={program.id} className="mb-2">
            {program.name} - {program.city}, {program.country}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;