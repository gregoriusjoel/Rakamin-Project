"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function CompanyProfile() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'companies', user.uid);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setCompanyName(data.name || data.companyName || '');
          setLocation(data.location || '');
          setWebsite(data.website || '');
          setLogoUrl(data.logoUrl || data.logo || '');
          setDescription(data.description || '');
        }
      })
      .catch((err) => console.error('Load company profile error', err))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLocalLogoPreview(url);
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      };
    } else {
      setLocalLogoPreview(null);
    }
  }, [logoFile]);

  const handleLogoSelect = (file?: File) => {
    if (!file) return;
    setLogoFile(file);
  };

  const uploadLogoToServer = async (file: File) => {
    if (!user) throw new Error('No user');
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('uid', user.uid);
      const resp = await fetch('/api/uploadLogo', { method: 'POST', body: form });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed: ${resp.status} ${txt}`);
      }
      const data = await resp.json();
      return data.url as string;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(null);
    try {
      const ref = doc(db, 'companies', user.uid);
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        try {
          finalLogoUrl = await uploadLogoToServer(logoFile);
        } catch (err) {
          console.error('Upload logo failed', err);
        }
      }

      await setDoc(ref, {
        name: companyName,
        location,
        website,
        logoUrl: finalLogoUrl,
        description,
        ownerUid: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSuccess('Company profile saved');
    } catch (err) {
      console.error('Save company profile error', err);
      setSuccess('Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-6">
      <Navbar left={<div onClick={() => router.push('/admin')} className="text-lg font-semibold text-black cursor-pointer">Job List</div>} />

      <main className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 flex flex-col items-center gap-4">
                <div className="w-36 h-36 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                  {uploadingLogo ? (
                    <div className="text-sm text-gray-500">Uploading...</div>
                  ) : localLogoPreview || logoUrl ? (
                    <img src={localLogoPreview || logoUrl || ''} alt="logo preview" className="object-contain w-full h-full" />
                  ) : (
                    <div className="text-sm text-gray-400">No logo</div>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Upload logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoSelect(e.target.files?.[0])}
                    className="mt-2 w-full text-sm text-gray-700"
                  />
                  <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoUrl('');
                        }}
                        className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    {localLogoPreview && (
                      <span className="text-xs text-gray-500 self-center">Preview selected image</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-4">
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company name</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo URL (optional)</label>
                    <input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black px-3 py-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">You can paste an existing logo URL or upload an image above.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-black px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      const ref = doc(db, 'companies', user?.uid || '');
                      getDoc(ref)
                        .then((snap) => {
                          if (snap.exists()) {
                            const data = snap.data() as any;
                            setCompanyName(data.name || data.companyName || '');
                            setLocation(data.location || '');
                            setWebsite(data.website || '');
                            setLogoUrl(data.logoUrl || data.logo || '');
                            setDescription(data.description || '');
                          }
                        })
                        .finally(() => setLoading(false));
                    }}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
