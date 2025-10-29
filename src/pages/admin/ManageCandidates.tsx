import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/Navbar';

const ManageCandidates: React.FC = () => {
  const router = useRouter();
  const { jobId } = router.query;
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    if (!jobId) return;
    const id = Array.isArray(jobId) ? jobId[0] : jobId;
    (async () => {
      try {
        const d = await getDoc(doc(db, 'jobs', id));
        if (d.exists()) {
          const data = d.data() as any;
          setJobTitle(data.title || '');
        } else {
          setJobTitle('');
        }
      } catch (e) {
        console.error('Failed to load job', e);
      }
    })();
  }, [jobId]);

  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) {
      setCandidates([]);
      return;
    }

    const id = Array.isArray(jobId) ? jobId[0] : jobId;
    const col = collection(db, 'candidates');
    const q = query(col, where('jobId', '==', id));

    const unsub = onSnapshot(q, (snap) => {
      const docs: any[] = [];
      snap.forEach(d => {
        docs.push({ id: d.id, ...(d.data() as any) });
      });
      setCandidates(docs);
    }, (err) => {
      console.error('Failed to listen to candidates', err);
      setCandidates([]);
    });

    return () => unsub();
  }, [jobId]);

  return (
  <div className="min-h-screen bg-white pt-20 px-6">
      
      <Navbar
        left={(
          <>
            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Job list
            </button>
            <span className="text-gray-400">›</span>
            <button className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm">
              Manage Candidate
            </button>
          </>
        )}
      />

      <div className="max-w-7xl mx-auto">
  <h2 className="text-lg font-semibold text-black mb-4">{jobTitle || 'Front End Developer'}</h2>

        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[48vh] flex items-center justify-center">
          {candidates.length === 0 ? (
            <div className="w-full p-12 flex flex-col items-center justify-center text-center">
              
              <div className="mb-6">
                <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="20" width="220" height="140" rx="6" fill="#fff" stroke="#E6E6E6" strokeWidth="2" />
                  <g transform="translate(40,50)">
                    <rect x="0" y="0" width="120" height="80" rx="6" fill="#0EA5A4" opacity="0.08" />
                    <circle cx="60" cy="36" r="28" fill="#0EA5A4" opacity="0.12" />
                    <path d="M92 0L116 24" stroke="#0EA5A4" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-black mb-2">No candidates found</h3>
              <p className="text-sm text-gray-500">Share your job vacancies so that more candidates will apply.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-white border-b">
                    <th className="px-6 py-4 text-left w-56">
                      <input type="checkbox" className="w-5 h-5 text-teal-500 rounded border-gray-200" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">EMAIL ADDRESS</th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">PHONE NUMBERS</th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">DATE OF BIRTH</th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">DOMICILE</th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">GENDER</th>
                    <th className="px-6 py-4 text-left text-xs text-gray-500">LINK LINKEDIN</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={i} className={`border-t ${i % 2 === 0 ? '' : ''}`}>
                      <td className="px-6 py-5 align-top w-56">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5 text-teal-500 rounded border-gray-200" />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{c.email}</td>
                      <td className="px-6 py-5 text-sm text-gray-600">{c.phone}</td>
                      <td className="px-6 py-5 text-sm text-gray-600">{c.dob}</td>
                      <td className="px-6 py-5 text-sm text-gray-600">{c.domicile}</td>
                      <td className="px-6 py-5 text-sm text-gray-600">{c.gender}</td>
                      <td className="px-6 py-5 text-sm text-teal-500 underline">
                        <a href={c.linkedin} target="_blank" rel="noreferrer">{c.linkedin}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCandidates;
