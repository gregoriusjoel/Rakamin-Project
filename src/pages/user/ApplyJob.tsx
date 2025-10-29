"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuthContext } from '../../contexts/AuthContext';
import { ArrowLeftIcon, PhotoIcon, CalendarIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
const isBrowser = typeof window !== 'undefined';
// @ts-ignore
import { provinsi, kabupaten } from 'daftar-wilayah-indonesia';
import { customArray as countryCustomArray } from 'country-codes-list';
import ModalCamera from './ModalCamera';
import ApplySuccessModal from '../../components/ApplySuccessModal';

export default function ApplyJob() {
  const router = useRouter();
  const { user, userProfile } = useAuthContext();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [domicile, setDomicile] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  
  const [provOpen, setProvOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const provRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);
  
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement | null>(null);
  const [countryDial, setCountryDial] = useState<string>('+62');
  const [countryFlag, setCountryFlag] = useState<string>('🇮🇩');
  const [countryList, setCountryList] = useState<Array<{ name: string; value: string }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  
  const [provQuery, setProvQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [countryQuery, setCountryQuery] = useState('');

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const toIso = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const formatDisplayDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const [provinces, setProvinces] = useState<Array<{ kode_provinsi?: string; nama?: string }>>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
          if (isBrowser && typeof provinsi === 'function') {
            try {
              const p = provinsi();
              if (p && Array.isArray(p) && p.length > 0) {
                if (!mounted) return;
                setProvinces(p.map((it: any) => ({ kode_provinsi: it.kode || it.kode_provinsi || it.id || it.code, nama: it.nama || it.name })));
                return;
              }
            } catch (inner) {
              console.warn('provinsi() call failed, falling back to proxy', inner);
            }
          }

          const res = await fetch('/api/wilayah/provinsi');
          if (!res.ok) throw new Error('no-provinsi');
          const data = await res.json();
          if (!mounted) return;
          if (Array.isArray(data) && data.length > 0) {
            setProvinces(data.map((it: any) => ({ kode_provinsi: it.kode_provinsi || it.kode || it.id, nama: it.nama || it.name })));
          }
        } catch (err) {
          console.warn('Failed to populate provinces for ApplyJob', err);
        }
    })();
    return () => { mounted = false; };
  }, []);

  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (provRef.current && !(provRef.current as any).contains(e.target)) setProvOpen(false);
      if (cityRef.current && !(cityRef.current as any).contains(e.target)) setCityOpen(false);
      if (countryRef.current && !(countryRef.current as any).contains(e.target)) setCountryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  
  useEffect(() => {
    try {
      const list = countryCustomArray({ name: '{flag} {countryNameEn}', value: '{countryCallingCode}' }, { sortBy: 'countryNameEn', sortDataBy: 'countryNameEn' });
      
      setCountryList(list as any);
      
      const id = list.find((c: any) => c.value === '62');
      if (id) {
        setCountryDial('+' + id.value);
        
        const token = id.name && id.name.split(' ')[0];
        if (token) setCountryFlag(token);
      }
    } catch (err) {
      console.warn('Failed to load country list', err);
    }
  }, []);

  
  const fetchCitiesForProvince = async (kodeProv: string) => {
    try {
      if (typeof kabupaten === 'function') {
        try {
          let k: any[] | null = kabupaten(Number(kodeProv));
          if (!k || (Array.isArray(k) && k.length === 0)) k = kabupaten(kodeProv as any);
          if (Array.isArray(k) && k.length > 0) {
            const names = k.map((it: any) => it.nama || it.name || it.kota || it.kabupaten).filter(Boolean);
            if (names.length) { setCityOptions(Array.from(new Set(names))); return; }
          }
        } catch (callErr) {
          console.warn('kabupaten() call failed, falling back to proxy', callErr);
        }
      }

      const res = await fetch(`/api/wilayah/kota/${kodeProv}`);
      if (!res.ok) throw new Error('no-kota');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const names = data.map((it: any) => it.nama || it.name || it.kota).filter(Boolean);
        if (names.length) setCityOptions(Array.from(new Set(names)));
      }
    } catch (err) {
    }
  };
  
  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); 
    const startDate = new Date(year, month, 1 - startDay);
    const days: any[] = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(startDate);
      dt.setDate(startDate.getDate() + i);
      const iso = toIso(dt);
      const monthOffset = dt.getMonth() - month;
      days.push({ date: dt, day: dt.getDate(), monthOffset, iso });
    }
    setCalendarDays(days);
  }, [viewDate]);

  const changeMonth = (deltaMonths: number) => setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + deltaMonths, 1));

  const handleSelectDate = (d: any) => {
    setDob(d.iso);
    setShowCalendar(false);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = calendarRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setShowCalendar(false);
    };
    if (showCalendar) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showCalendar]);

  useEffect(() => {
    if (!router) return;
    const q = router.query?.jobId || router.asPath.split('?jobId=')[1];
    const id = Array.isArray(q) ? q[0] : q;
    if (id) {
      setJobId(String(id));
      (async () => {
        try {
          const ref = doc(db, 'jobs', String(id));
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setJobData(snap.data());
          }
        } catch (err) {
          console.error('Failed to load job data for apply page', err);
        }
      })();
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      if (!email && user.email) setEmail(user.email);
      if (!name && (userProfile as any)?.name) setName((userProfile as any).name);
    }
  }, [user, userProfile]);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/user" aria-label="back" className="inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-gray-50">
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {jobData?.title ? `Apply ${jobData.title}` : 'Apply for this job'}
              {jobData && (jobData.companyName || jobData.company) ? ` at ${jobData.companyName || jobData.company}` : ''}
            </h1>
          </div>

          <div className="text-sm text-gray-500 flex items-center gap-2">
              <InformationCircleIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">This field required to fill</span>
            </div>
        </div>

          
          <div className="mb-6">
            <div className="flex items-center gap-4 bg-gradient-to-r from-white to-teal-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
              <img src={jobData?.companyLogo || '/rakamin.png'} alt="company" className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{jobData?.title || 'Job opening'}</div>
                <div className="text-xs text-gray-500">{jobData?.companyName || jobData?.company || 'Company'}</div>
              </div>
              <div className="ml-auto text-sm text-gray-600">{jobData?.location || ''}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-8 shadow-lg">
          <div className="mb-6">
            <div className="text-red-600 font-medium">* Required</div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            <div className="flex items-start gap-6">
              <div>
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-teal-50 to-cyan-50 flex items-center justify-center overflow-hidden border">
                        {capturedImage ? (
                          <img src={capturedImage} alt="applicant" className="w-32 h-32 object-cover rounded-full" />
                        ) : (
                          /* placeholder avatar - kept as illustration; allow replacing with camera capture later */
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" className="w-24 h-24 text-gray-400">
                            <g fill="none" fillRule="evenodd">
                              <circle cx="60" cy="60" r="60" fill="#E6FFFA" />
                              <g transform="translate(20 20)" fill="#9AE6B4">
                                <path d="M40 40c11 0 20-9 20-20S51 0 40 0 20 9 20 20s9 20 20 20z" />
                              </g>
                            </g>
                          </svg>
                        )}
                      </div>

                      
                    </div>
              </div>
            </div>
            
            <div className="w-full flex justify-start mt-2 mb-4 pl-2">
              {!capturedImage ? (
                <button
                  type="button"
                  aria-label="Take a picture"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-transform duration-150 ease-in-out active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-100"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-teal-50">
                    <PhotoIcon className="h-4 w-4 text-teal-700" />
                  </span>
                  <span className="text-sm font-semibold text-gray-900">Take a Picture</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow md:transition focus:outline-none"
                >
                  <span className="text-sm font-medium text-gray-800">Change photo</span>
                </button>
              )}
            </div>

            
            <ModalCamera
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              imageSrc={capturedImage || undefined}
              onCapture={(dataUrl) => {
                setCapturedImage(dataUrl);
                setModalOpen(false);
              }}
            />

            <div>
              <form className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault();
                  if (submitting) return;
                  
                  if (!selectedProvince) {
                    alert('Please select a province.');
                    setProvOpen(true);
                    return;
                  }
                  if (!domicile) {
                    alert('Please choose your domicile.');
                    setCityOpen(true);
                    return;
                  }
                  setSubmitting(true);
                  try {
                    const payload: any = {
                      name: name,
                      dob: dob,
                      gender: gender,
                      domicile: domicile,
                      phone: phone,
                      email: email,
                      linkedin: linkedin,
                      jobId: jobId ?? null,
                      jobTitle: jobData?.title ?? null,
                      applicantUid: user?.uid ?? null,
                      createdAt: serverTimestamp(),
                    };

                    
                    if (capturedImage) {
                      try {
                        payload.photoBase64 = capturedImage;
                      } catch (err) {
                        console.error('Failed to attach captured image to payload', err);
                      }
                    }

                    await addDoc(collection(db, 'candidates'), payload);
                    
                    setShowApplySuccess(true);
                  } catch (err) {
                    console.error('Failed to submit application', err);
                    alert('Failed to submit application. Please try again.');
                  } finally {
                    setSubmitting(false);
                  }
                }}>
                  <input type="hidden" name="jobId" value={jobId ?? ''} />
                  <input type="hidden" name="jobTitle" value={jobData?.title ?? ''} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full name<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 shadow-sm transition"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of birth<span className="text-red-500">*</span></label>
                    <div className="mt-2 relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowCalendar((s) => !s)}
                        className="text-left w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 shadow-sm transition"
                        aria-haspopup="dialog"
                        aria-expanded={showCalendar}
                      >
                        <span className={`${dob ? 'text-gray-900' : 'text-gray-400'}`}>
                          {dob ? formatDisplayDate(dob) : 'Select your date of birth'}
                        </span>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </button>

                      {showCalendar ? (
                        <div ref={calendarRef} className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg p-4 w-80">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => changeMonth(-12)} className="p-1 rounded hover:bg-gray-100 text-gray-900">«</button>
                              <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-100 text-gray-900">‹</button>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {viewDate.toLocaleString('default', { month: 'short' })} {viewDate.getFullYear()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-100 text-gray-900">›</button>
                              <button type="button" onClick={() => changeMonth(12)} className="p-1 rounded hover:bg-gray-100 text-gray-900">»</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 text-xs text-gray-500 gap-1 mb-2">
                            <div className="text-center">S</div>
                            <div className="text-center">M</div>
                            <div className="text-center">T</div>
                            <div className="text-center">W</div>
                            <div className="text-center">T</div>
                            <div className="text-center">F</div>
                            <div className="text-center">S</div>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((d, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectDate(d)}
                                className={`h-10 rounded flex items-center justify-center ${d.iso === dob ? 'bg-teal-600 text-white shadow' : (d.monthOffset !== 0 ? 'text-gray-300' : 'text-gray-800 hover:bg-gray-100')}`}
                              >
                                {d.day}
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm">
                            <button type="button" onClick={() => { setDob(''); setShowCalendar(false); }} className="text-teal-600">Clear</button>
                            <button type="button" onClick={() => { setShowCalendar(false); }} className="text-gray-600">Close</button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pronoun (gender)<span className="text-red-500">*</span></label>
                    <div className="mt-3 flex items-center gap-8">
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name="pronoun" className="form-radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
                        <span className="text-sm text-gray-700">She/her (Female)</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name="pronoun" className="form-radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
                        <span className="text-sm text-gray-700">He/him (Male)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province <span className="text-red-500">*</span></label>
                      <div className="mt-2 relative" ref={provRef}>
                        <button
                        type="button"
                        onClick={() => { setProvOpen((s) => { const next = !s; if (next) setProvQuery(''); return next; }); }}
                          aria-haspopup="listbox"
                          aria-expanded={provOpen}
                          className="w-full text-left rounded-xl border border-gray-200 px-4 py-3 pr-10 text-gray-700 flex items-center gap-2 justify-between focus:outline-none focus:ring-2 focus:ring-teal-100 transition shadow-sm bg-white"
                        >
                          <span className={`${selectedProvince ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedProvince ? (provinces.find(p => p.kode_provinsi === selectedProvince)?.nama || selectedProvince) : 'Select province'}
                          </span>
                          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transform ${provOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {provOpen ? (
                        <div className="absolute z-40 mt-2 w-full bg-white rounded-xl border border-gray-100 shadow-lg max-h-56 overflow-hidden">
                          <div className="p-2">
                            <input value={provQuery} onChange={(e) => setProvQuery(e.target.value)} autoFocus placeholder="Search province..." className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100" />
                          </div>
                          <ul role="listbox" className="max-h-44 overflow-auto p-2">
                            {provinces.filter(p => (p.nama ?? '').toLowerCase().includes(provQuery.toLowerCase())).map((p) => (
                              <li key={p.kode_provinsi} role="option" onClick={() => { setSelectedProvince(p.kode_provinsi || ''); setProvOpen(false); setProvQuery(''); fetchCitiesForProvince(p.kode_provinsi || ''); }} className="px-3 py-2 rounded hover:bg-teal-50 cursor-pointer text-sm text-gray-800">{p.nama || p.kode_provinsi}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domicile<span className="text-red-500">*</span></label>
                    <div className="mt-2 relative" ref={cityRef}>
                      <button
                        type="button"
                        onClick={() => { setCityOpen((s) => { const next = !s; if (next) setCityQuery(''); return next; }); }}
                        aria-haspopup="listbox"
                        aria-expanded={cityOpen}
                        className="w-full text-left rounded-xl border border-gray-200 px-4 py-3 pr-10 text-gray-700 flex items-center gap-2 justify-between focus:outline-none focus:ring-2 focus:ring-teal-100 transition shadow-sm bg-white"
                      >
                        <span className={`${domicile ? 'text-gray-900' : 'text-gray-400'}`}>
                          {domicile || 'Choose your domicile'}
                        </span>
                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transform ${cityOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {cityOpen ? (
                        <div className="absolute z-40 mt-2 w-full bg-white rounded-xl border border-gray-100 shadow-lg max-h-56 overflow-hidden">
                          <div className="p-2">
                            <input value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} autoFocus placeholder="Search city..." className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100" />
                          </div>
                          <ul role="listbox" className="max-h-44 overflow-auto p-2">
                            {cityOptions.length === 0 ? (
                              <li className="px-3 py-2 text-sm text-gray-500">No cities available</li>
                            ) : cityOptions.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).map((c) => (
                              <li key={c} role="option" onClick={() => { setDomicile(c); setCityOpen(false); setCityQuery(''); }} className="px-3 py-2 rounded hover:bg-teal-50 cursor-pointer text-sm text-gray-800">{c}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone number<span className="text-red-500">*</span></label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative" ref={countryRef}>
                        <button type="button" onClick={() => setCountryOpen(s => !s)} className="inline-flex items-center gap-2 px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none min-w-[84px] justify-start">
                          <span className="text-sm font-semibold leading-none text-black">{countryFlag}</span>
                          <span className="text-sm text-black leading-none">{countryDial}</span>
                        </button>

                        {countryOpen ? (
                          <div className="absolute left-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-40 overflow-hidden">
                            <div className="p-2">
                              <input value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} autoFocus placeholder="Search country..." className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-teal-100" />
                            </div>
                            <ul className="max-h-44 overflow-auto p-1">
                              {countryList.length === 0 ? (
                                <li className="px-2 py-2 text-sm text-gray-500">Loading...</li>
                              ) : (
                                countryList.filter(c => (c.name + c.value).toLowerCase().includes(countryQuery.toLowerCase())).map((c) => (
                                  <li key={c.value} className="px-2 py-2 hover:bg-teal-50 rounded cursor-pointer flex items-center gap-2" onClick={() => {
                                    setCountryDial('+' + c.value);
                                    const token = c.name.split(' ')[0];
                                    setCountryFlag(token || '');
                                    setCountryOpen(false);
                                    setCountryQuery('');
                                  }}>
                                    <span className="text-sm font-semibold leading-none text-black">{c.name.split(' ')[0]}</span>
                                    <span className="text-sm text-gray-800 leading-none">{c.name.replace(/^[^ ]+\s?/, '')}</span>
                                    <span className="ml-auto text-xs text-gray-500">+{c.value}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        ) : null}
                      </div>

                      <input
                        type="tel"
                        placeholder="81XXXXXXXXXX"
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-0 focus:border-gray-300"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email<span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-0 focus:border-gray-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link Linkedin</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-0 focus:border-gray-300"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white px-6 py-3 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>
      <ApplySuccessModal open={showApplySuccess} onClose={() => { setShowApplySuccess(false); router.push('/user?applied=true'); }} />
    </div>
  );
}
