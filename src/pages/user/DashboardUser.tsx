"use client";

import { useAuthContext } from '../../contexts/AuthContext';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import JobCard from '../../components/user/JobCard';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface DashboardProps {
  onLogout?: () => void;
}

export default function DashboardComponent({ onLogout }: DashboardProps) {
  const { user, userProfile, logout } = useAuthContext();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string | null>>({});
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = query(collection(db, 'jobs'), where('status', '==', 'Active'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const arr = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        arr.sort((a, b) => {
          const ta = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?._seconds || 0) * 1000;
          const tb = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?._seconds || 0) * 1000;
          return tb - ta;
        });
        setJobs(arr);
        setSelectedJobId((prev) => prev ?? (arr.length > 0 ? arr[0].id : null));
      },
      (err) => console.error('Jobs subscription error', err)
    );

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  const getCompanyLabel = (j: any) => {
    if (!j) return null;
    return j.companyName || j.company || (j.company && j.company.name) || j.posterName || j.postedBy?.name || j.createdByName || j.employerName || null;
  };

  const getCompanyUid = (j: any) => {
    if (!j) return null;
    return (
      j.postedBy?.uid || j.posterUid || j.ownerUid || j.createdByUid || j.createdById || j.postedById || (j.company && j.company.uid) || null
    );
  };

  const computeInitials = (name?: string | null) => {
    if (!name) return null;
    const n = name.trim();
    if (!n) return null;
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (n.length === 1) return n[0].toUpperCase();
    return (n[0] + n[n.length - 1]).toUpperCase();
  };

  const capitalize = (s?: string | null) => {
    if (!s) return s;
    const str = String(s);
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  
  useEffect(() => {
    let mounted = true;
    async function loadLogos() {
      if (!jobs || jobs.length === 0) return;
      const uids = Array.from(new Set(jobs.map((j) => getCompanyUid(j)).filter(Boolean)));
      const toFetch = uids.filter((uid) => !(uid in companyLogos));
      if (toFetch.length === 0) return;
      try {
        const results: Record<string, string | null> = {};
        await Promise.all(
          toFetch.map(async (uid) => {
            try {
              const ref = doc(db, 'companies', uid as string);
              const snap = await getDoc(ref);
              if (snap.exists()) {
                const data = snap.data() as any;
                results[uid as string] = data.logoUrl || data.logo || null;
              } else {
                results[uid as string] = null;
              }
            } catch (err) {
              console.error('Failed loading company doc', err);
              results[uid as string] = null;
            }
          })
        );
        if (!mounted) return;
        setCompanyLogos((prev) => ({ ...prev, ...results }));
      } catch (err) {
        console.error('Error loading company logos', err);
      }
    }

    loadLogos();
    return () => { mounted = false; };
    
  }, [jobs]);

  
  useEffect(() => {
    if (!user) {
      setAppliedIds({});
      return;
    }

    const col = collection(db, 'candidates');
    let q;
    if (user.uid) {
      q = query(col, where('applicantUid', '==', user.uid));
    } else if (user.email) {
      q = query(col, where('email', '==', user.email));
    } else {
      setAppliedIds({});
      return;
    }

    const unsub = onSnapshot(q, (snap) => {
      const ids: Record<string, boolean> = {};
      snap.forEach(d => {
        const data = d.data() as any;
        if (data && data.jobId) ids[String(data.jobId)] = true;
      });
      setAppliedIds(ids);
    }, (err) => {
      console.error('Failed to listen to user candidates', err);
      setAppliedIds({});
    });

    return () => unsub();
  }, [user]);

  const formatRp = (v: any) => {
    try {
      const n = Number(String(v).replace(/[^0-9.-]+/g, '')) || 0;
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        left={
          <Image
            src="/rakamin-logo.png"
            alt="Rakamin Logo"
            width={120}
            height={40}
            loading="eager"
            style={{ width: 'auto', height: 'auto' }}
          />
        }
      />

  
  <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 min-h-[60vh] flex flex-col items-center justify-center">
            <img src="/undraw_no_data_qbuo.svg" alt="No jobs" className="w-64 h-auto mb-6" />
            <h2 className="text-lg font-semibold text-black">No job openings available</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait for the next batch of openings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {jobs.map((job) => {
                  const uid = getCompanyUid(job);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      companyLogo={uid ? companyLogos[uid] : null}
                      selected={selectedJobId === job.id}
                      applied={Boolean(appliedIds[job.id])}
                      onClick={() => setSelectedJobId(job.id)}
                    />
                  );
                })}
              </div>
            </div>

            
            <div className="lg:col-span-9">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[60vh]">
                {selectedJob ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {(() => {
                              const uid = getCompanyUid(selectedJob);
                              const logo = uid ? companyLogos[uid] : null;
                              return (
                                <img src={logo || '/rakamin.png'} alt={getCompanyLabel(selectedJob) || 'Company'} className="object-cover w-full h-full" />
                              );
                            })()}
                          </div>

                          <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{capitalize(selectedJob.type) || 'Full-Time'}</span>
                            </div>
                            <h2 className="text-xl font-semibold text-black">{selectedJob.title}</h2>
                            { getCompanyLabel(selectedJob) ? (
                              <div className="text-sm text-gray-600 mt-2">{getCompanyLabel(selectedJob)}</div>
                            ) : null }
                            {(selectedJob.location || selectedJob.locationName || selectedJob.city || selectedJob.domicile || selectedJob.workLocation) && (
                              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                <span>{selectedJob.location || selectedJob.locationName || selectedJob.city || selectedJob.domicile || selectedJob.workLocation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      <div>
                        {appliedIds[selectedJob.id] ? (
                          <button className="bg-gray-200 text-gray-700 inline-flex items-center justify-center text-sm px-3 py-2 rounded-md cursor-default disabled:opacity-50" disabled>
                            Applied
                          </button>
                        ) : (
                          <Link href={`/user/ApplyJob?jobId=${selectedJob.id}`} className="bg-yellow-400 hover:bg-yellow-500 text-white inline-flex items-center justify-center text-sm px-3 py-2 rounded-md">
                            Apply
                          </Link>
                        )}
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="prose prose-sm text-gray-700">
                      {String(selectedJob.description || '').split('\n').map((line: string, idx: number) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">Select a job to see details</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}