"use client";

import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface JobCardProps {
  job: any;
  companyLogo?: string | null;
  selected?: boolean;
  onClick?: () => void;
  applied?: boolean;
}

export default function JobCard({ job, companyLogo, selected, onClick, applied }: JobCardProps) {
  const getCompanyLabel = (j: any) => {
    if (!j) return null;
    return j.companyName || j.company || (j.company && j.company.name) || j.posterName || j.postedBy?.name || j.createdByName || j.employerName || null;
  };

  const formatRp = (v: any) => {
    try {
      const n = Number(String(v).replace(/[^0-9.-]+/g, '')) || 0;
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return v;
    }
  };

  const companyName = getCompanyLabel(job);

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer p-4 rounded-lg border ${selected ? 'border-teal-400 shadow-sm bg-white' : 'border-gray-100 bg-white'}`}
    >
      {applied ? (
        <div className="absolute right-3 top-3 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Applied</div>
      ) : null}
      <div className="flex items-start gap-3">
        
        <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {companyLogo ? (
            <img src={companyLogo} alt={`${companyName || 'Company'} logo`} className="object-cover w-full h-full" />
          ) : (
            <img src="/rakamin.png" alt="Rakamin" className="object-cover w-full h-full" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-black">{job.title}</h3>
          {companyName ? <div className="text-xs text-gray-500 mt-1">{companyName}</div> : null}

          {(job.location || job.locationName || job.city || job.domicile || job.workLocation) ? (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{job.location || job.locationName || job.city || job.domicile || job.workLocation}</span>
            </div>
          ) : null}

          <div className="text-xs text-gray-500 mt-2">{formatRp(job.minSalary)} - {formatRp(job.maxSalary)}</div>
        </div>
      </div>
    </div>
  );
}
