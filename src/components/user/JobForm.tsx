import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthContext } from '../../contexts/AuthContext';

type Props = {
  onClose?: () => void;
  formId?: string;
  initialData?: any;
  isEdit?: boolean;
  onSaved?: (id: string) => void;
};

const JobForm: React.FC<Props> = ({ onClose, formId, initialData, isEdit, onSaved }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [jobTypeVisible, setJobTypeVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState('1');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileRequirements, setProfileRequirements] = useState<Record<string, 'mandatory' | 'optional' | 'off'>>({
    fullName: 'mandatory',
    photoProfile: 'mandatory',
    gender: 'mandatory',
    domicile: 'mandatory',
    email: 'mandatory',
    phone: 'mandatory',
    linkedin: 'mandatory',
    dob: 'mandatory',
  });

  const JOB_TYPE_OPTIONS = [
    { value: 'fulltime', label: 'Full-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'parttime', label: 'Part-time' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const typeLabel = (val: string) => JOB_TYPE_OPTIONS.find((o) => o.value === val)?.label || val;

  const router = useRouter();

  const { user } = useAuthContext();

  const [status, setStatus] = useState<string>('Active');

  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || '');
      setDescription(initialData.description || '');
      setLocation(initialData.location || '');
      setCount(String(initialData.count ?? 1));
      setMinSalary(initialData.minSalary || '');
      setMaxSalary(initialData.maxSalary || '');
      if (initialData.profileRequirements) setProfileRequirements(initialData.profileRequirements);
      if ((initialData as any).status) setStatus((initialData as any).status);
    }
  }, [initialData]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      
      const payload = {
        title,
        type,
        description,
        location,
        count: Number(count || 0),
        minSalary,
        maxSalary,
        profileRequirements,
        status,
        createdBy: user?.uid || null,
        createdAt: serverTimestamp(),
      } as any;

      if (isEdit && initialData?.id) {
        await updateDoc(doc(db, 'jobs', initialData.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        onSaved?.(initialData.id);
        onClose?.();
      } else {
        const ref = await addDoc(collection(db, 'jobs'), payload);
        console.log('Job saved', ref.id, payload);
        onSaved?.(ref.id);
        onClose?.();
        
        try {
          await router.push({ pathname: '/admin', query: { toast: 'created', id: ref.id } });
        } catch (navErr) {
          console.error('Navigation after publish failed', navErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div>
  <label className="block text-sm font-medium text-black">Job Name <span className="text-red-500">*</span></label>
  <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-black/40" placeholder="Ex. Front End Engineer" />
      </div>

      <div>
  <label className="block text-sm font-medium text-black">Job Type <span className="text-red-500">*</span></label>
        
        <div className="mt-1 relative" aria-haspopup="listbox">
          <button
            type="button"
            onClick={() => {
        if (!jobTypeVisible) {
          setJobTypeVisible(true);
          setTimeout(() => setJobTypeOpen(true), 10);
              } else {
                setJobTypeOpen(false);
                setTimeout(() => setJobTypeVisible(false), 180);
              }
            }}
            className="w-full text-left border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between text-black bg-white"
            aria-expanded={jobTypeOpen}
          >
            <span className={`${type ? 'text-black' : 'text-black/50'}`}>{type ? typeLabel(type) : 'Select job type'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          
          {jobTypeVisible && (
            <div
              className={`absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-sm z-50 transform origin-top transition-all duration-150 ${
                jobTypeOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
              }`}
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setType(opt.value);
                    setJobTypeOpen(false);
                    setTimeout(() => setJobTypeVisible(false), 160);
                  }}
                  className={`w-full text-left px-6 py-4 ${type === opt.value ? 'bg-teal-500 text-white font-medium hover:bg-teal-600' : 'bg-white text-black hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <input type="hidden" name="type" value={type} required />
      </div>

      <div>
  <label className="block text-sm font-medium text-black">Job Description <span className="text-red-500">*</span></label>
  <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 h-28 text-black placeholder-black/40" placeholder="Ex." />
      </div>

    <div>
  <label className="block text-sm font-medium text-black">Location</label>
  <input name="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-black/40" placeholder="City, Remote, etc." />
    </div>

      <div>
  <label className="block text-sm font-medium text-black">Number of Candidate Needed <span className="text-red-500">*</span></label>
  <input name="count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-black/40" placeholder="Ex. 2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-black">Minimum Estimated Salary</label>
          <input value={minSalary} onChange={(e) => setMinSalary(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-black/40" placeholder="Rp 7.000.000" />
        </div>
        <div>
          <label className="block text-sm text-black">Maximum Estimated Salary</label>
          <input value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-black/40" placeholder="Rp 8.000.000" />
        </div>
      </div>

        
        <div className="mt-4">
          <label className="block text-sm font-medium text-black">Status</label>
          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={() => setStatus('Active')} className={`px-3 py-1 rounded-full text-sm border ${status === 'Active' ? 'border-teal-400 text-teal-500 bg-white' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>Active</button>
            <button type="button" onClick={() => setStatus('Inactive')} className={`px-3 py-1 rounded-full text-sm border ${status === 'Inactive' ? 'border-red-400 text-red-500 bg-white' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>Inactive</button>
            <button type="button" onClick={() => setStatus('Draft')} className={`px-3 py-1 rounded-full text-sm border ${status === 'Draft' ? 'border-yellow-400 text-yellow-500 bg-white' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>Draft</button>
          </div>
        </div>

  
  <div className="mt-6 bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b">
          <h4 className="text-sm font-semibold text-black">Minimum Profile Information Required</h4>
        </div>
        <div className="divide-y">
          {[
            { key: 'fullName', label: 'Full name' },
            { key: 'photoProfile', label: 'Photo Profile' },
            { key: 'gender', label: 'Gender' },
            { key: 'domicile', label: 'Domicile' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone number' },
            { key: 'linkedin', label: 'Linkedin link' },
            { key: 'dob', label: 'Date of birth' },
          ].map((f) => {
            const value = profileRequirements[f.key];
            return (
              <div key={f.key} className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-black">{f.label}</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={value === 'mandatory'}
                    onClick={() => setProfileRequirements((s) => ({ ...s, [f.key]: 'mandatory' }))}
                    className={
                      `px-3 py-1 rounded-full text-sm border ${
                        value === 'mandatory'
                          ? 'border-teal-400 text-teal-500 bg-white'
                          : 'bg-gray-100 text-gray-500 border-gray-300'
                      }`
                    }
                  >
                    Mandatory
                  </button>

                  <button
                    type="button"
                    aria-pressed={value === 'optional'}
                    onClick={() => setProfileRequirements((s) => ({ ...s, [f.key]: 'optional' }))}
                    className={
                      `px-3 py-1 rounded-full text-sm border ${
                        value === 'optional'
                          ? 'border-teal-400 text-teal-500 bg-white'
                          : 'bg-gray-100 text-gray-500 border-gray-300'
                      }`
                    }
                  >
                    Optional
                  </button>

                  <button
                    type="button"
                    aria-pressed={value === 'off'}
                    onClick={() => setProfileRequirements((s) => ({ ...s, [f.key]: 'off' }))}
                    className={
                      `px-3 py-1 rounded-full text-sm border ${
                        value === 'off'
                          ? 'border-teal-400 text-teal-500 bg-white'
                          : 'bg-gray-100 text-gray-500 border-gray-300'
                      }`
                    }
                  >
                    Off
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
      <div className="pt-4 border-t" />
    </form>
  );
};

export default JobForm;
