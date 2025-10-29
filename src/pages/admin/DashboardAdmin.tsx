import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import JobForm from '../../components/user/JobForm';
import Toast from '../../components/Toast';
import Navbar from '../../components/Navbar';
import { MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const DashboardAdmin: React.FC = () => {
	const router = useRouter();
	const { user, userProfile, loading } = useAuthContext();
	const [showModal, setShowModal] = useState(false);
	const [jobs, setJobs] = useState<any[]>([]);
	const [toastVisible, setToastVisible] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [expandedJob, setExpandedJob] = useState<string | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editJob, setEditJob] = useState<any | null>(null);

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.replace('/login');
				return;
			}

			const role = (userProfile as any)?.role || 'user';
			if (role !== 'admin') {
				router.replace('/user');
			}
		}
	}, [loading, user, userProfile, router]);

	useEffect(() => {
		const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
		const unsub = onSnapshot(
			q,
			(snapshot) => {
				const arr = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
				setJobs(arr as any[]);
			},
			(error) => console.error('Jobs subscription error', error)
		);

		return () => unsub();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm('Delete this job?')) return;
		try {
			await deleteDoc(doc(db, 'jobs', id));
			setToastMessage('Job deleted');
			setToastVisible(true);
		} catch (err) {
			console.error('Delete failed', err);
			setToastMessage('Failed to delete job');
			setToastVisible(true);
		}
	};

	const handleToggleStatus = async (job: any) => {
		try {
			const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
			await updateDoc(doc(db, 'jobs', job.id), { status: newStatus });
			setToastMessage('Job updated');
			setToastVisible(true);
		} catch (err) {
			console.error('Update failed', err);
			setToastMessage('Failed to update job');
			setToastVisible(true);
		}
	};

	return (
		<div className="min-h-screen bg-white pt-16 px-6">
			<Navbar />

		
			<Modal
				isOpen={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setEditJob(null);
				}}
				title="Edit Job"
				footer={
					<div className="flex items-center justify-end gap-3">
						<button
							onClick={() => {
								if (editJob) {
									handleDelete(editJob.id);
									setEditModalOpen(false);
									setEditJob(null);
								}
							}}
							className="px-4 py-2 rounded text-sm bg-red-50 text-red-600 hover:bg-red-100"
						>
							Delete
						</button>

						<button
							type="button"
							onClick={() => {
								const form = document.getElementById('edit-job-form') as HTMLFormElement | null;
								if (form) {
									if (typeof (form as any).requestSubmit === 'function') {
										(form as any).requestSubmit();
									} else {
										form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
									}
								}
							}}
							className="px-4 py-2 rounded bg-teal-500 text-white text-sm"
						>
							Save changes
						</button>
					</div>
				}
			>
				{editJob && (
					<JobForm
						formId="edit-job-form"
						initialData={editJob}
						isEdit
						onClose={() => {
							setEditModalOpen(false);
							setEditJob(null);
						}}
						onSaved={(id) => {
							setToastMessage('Job updated');
							setToastVisible(true);
							setEditModalOpen(false);
							setEditJob(null);
						}}
					/>
				)}
			</Modal>

		
			<Modal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				title="Job Opening"
				footer={
					<div className="flex items-center justify-end">
						<button
							type="button"
							onClick={() => {
								const form = document.getElementById('job-form') as HTMLFormElement | null;
								if (form) {
									if (typeof (form as any).requestSubmit === 'function') {
										(form as any).requestSubmit();
									} else {
										form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
									}
								}
							}}
							className="px-4 py-2 rounded bg-teal-500 text-white text-sm hover:bg-teal-600"
						>
							Publish Job
						</button>
					</div>
				}
			>
				<JobForm formId="job-form" onClose={() => setShowModal(false)} />
			</Modal>

			<div className="bg-white">
				<div className="max-w-7xl mx-auto px-6 py-6">
					
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
						<div className="lg:col-span-12">
							<div className="relative">
								<input
									type="text"
									placeholder="Search by job details"
									className="w-full border border-gray-200 rounded-full py-3 px-4 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200 text-black placeholder-black/60"
								/>
								<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500">
									<MagnifyingGlassIcon className="h-5 w-5" aria-hidden />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

				
			<section className="bg-white py-8">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						<div className="lg:col-span-9">
							{jobs.length === 0 ? (
								<div className="min-h-[40vh] flex items-center justify-center">
									<div className="max-w-3xl w-full text-center py-12">
										<div className="mx-auto mb-6" style={{ width: 420 }}>
											<svg viewBox="0 0 800 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
												<rect x="200" y="120" width="360" height="220" rx="12" stroke="#E6E6E6" strokeWidth="3" fill="#fff" />
												<rect x="120" y="60" width="360" height="220" rx="12" stroke="#E6E6E6" strokeWidth="3" fill="#fff" />
												<circle cx="420" cy="320" r="36" fill="#F59E0B" />
												<path d="M392 296 L444 348" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" />
												<path d="M180 200 C200 140 320 140 340 200" stroke="#0EA5A4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</div>

										<h2 className="text-xl md:text-2xl font-semibold text-black mb-2">No job openings available</h2>
										<p className="text-sm text-black/70 mb-6">Create a job opening now and start the candidate process.</p>
										<button
											onClick={() => setShowModal(true)}
											className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-6 rounded-lg"
										>
											Create a new job
										</button>
									</div>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-6">
									{jobs.map((job) => {
										const status = job.status || 'Active';
										const started = job.createdAt && (job.createdAt.toDate ? job.createdAt.toDate() : new Date(job.createdAt));
										const startedLabel = started ? `started on ${started.getDate()} ${started.toLocaleString('en-US', { month: 'short' })} ${started.getFullYear()}` : '';
										const formatRp = (v: any) => {
											try {
												const n = Number(String(v).replace(/[^0-9.-]+/g, '')) || 0;
												return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
											} catch (e) {
												return v;
											}
										};

										const locationLabel = (() => {
											const l = job.location;
											if (typeof l === 'string' && l.trim()) return l;
											if (l && typeof l === 'object') {
												if (typeof l.name === 'string' && l.name.trim()) return l.name;
												if (typeof l.label === 'string' && l.label.trim()) return l.label;
												if (typeof l.city === 'string' && l.city.trim()) return l.city;
											}
											if (typeof job.locationName === 'string' && job.locationName.trim()) return job.locationName;
											if (typeof job.city === 'string' && job.city.trim()) return job.city;
											if (typeof job.domicile === 'string' && job.domicile.trim()) return job.domicile;
											if (typeof job.workLocation === 'string' && job.workLocation.trim()) return job.workLocation;
											if (job.address && typeof job.address === 'object') {
												if (typeof job.address.city === 'string' && job.address.city.trim()) return job.address.city;
												if (typeof job.address.name === 'string' && job.address.name.trim()) return job.address.name;
											}
											if (job.company && typeof job.company === 'object') {
												if (typeof job.company.location === 'string' && job.company.location.trim()) return job.company.location;
												if (job.company.address && typeof job.company.address === 'object' && typeof job.company.address.city === 'string' && job.company.address.city.trim()) return job.company.address.city;
											}
											if (job.metadata && typeof job.metadata === 'object') {
												if (typeof job.metadata.location === 'string' && job.metadata.location.trim()) return job.metadata.location;
											}
											return '';
										})();

										const formatJobType = (t: any) => {
											if (!t) return '';
											const map: Record<string, string> = {
												fulltime: 'Full-time',
												parttime: 'Part-time',
												contract: 'Contract',
												internship: 'Internship',
												freelance: 'Freelance',
											};
											if (typeof t === 'string') {
												const key = t.toLowerCase();
												if (map[key]) return map[key];
												return t
													.toString()
													.split(/[\s-_]+/)
													.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
													.join(' ');
											}
											return String(t);
										};

										return (
											<div key={job.id} className="relative bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
												<div className="flex items-start justify-between">
													<div>
														<div className="flex items-center gap-3 mb-2">
															<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : status === 'Inactive' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
																{status}
															</span>
															{startedLabel && <span className="inline-block px-3 py-1 text-sm border border-gray-200 rounded text-black" style={{ color: '#000' }}>{startedLabel}</span>}
														</div>
														<h3 className="text-lg font-semibold text-black">{job.title}</h3>
														{locationLabel && (
															<div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
																<MapPinIcon className="h-4 w-4 text-gray-400" aria-hidden />
																<span className="text-sm">{locationLabel}</span>
															</div>
														)}
														<div className="text-sm text-gray-600 font-medium mt-1">{formatRp(job.minSalary)} - {formatRp(job.maxSalary)}</div>
													</div>

													<div className="flex items-center gap-2 relative">
														<button onClick={() => { setEditJob(job); setEditModalOpen(true); }} className="relative inline-flex items-center px-4 py-2 bg-teal-500 text-white text-sm rounded-md shadow-sm">Manage Job</button>

														<button
															onClick={() => {
																router.push(`/admin/ManageCandidates?jobId=${job.id}`);
															}}
															className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 text-sm rounded-md text-gray-700 hover:bg-gray-50"
														>
															Manage Candidates
														</button>

														<button
															aria-expanded={expandedJob === job.id}
															onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
															className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
														>
															<ChevronDownIcon className={`h-4 w-4 transform ${expandedJob === job.id ? 'rotate-180' : ''}`} aria-hidden />
														</button>
													</div>
												</div>

												<div
													className={`mt-4 border-t pt-4 transition-all duration-300 ease-in-out overflow-hidden ${
														expandedJob === job.id ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
													}`}
													aria-hidden={expandedJob !== job.id}
												>
													<div className={`transform transition-all duration-300 ${expandedJob === job.id ? 'py-4 translate-y-0 opacity-100' : 'py-0 -translate-y-3 opacity-0'}`}>
														<h4 className="text-md font-semibold text-black mb-2">Job Details</h4>
														<p className="text-sm text-gray-600">{formatJobType(job.type)}</p>
														<div className="mt-4 text-sm text-gray-700">{typeof job.description === 'object' && job.description !== null ? JSON.stringify(job.description) : job.description}</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>

						<div className="lg:col-span-3 hidden lg:block">
							<div className="sticky top-6">
								<div className="bg-[#0f1724] text-white rounded-lg p-5 shadow-lg relative overflow-hidden">
									<div className="mb-4">
										<h3 className="text-lg font-semibold">Recruit the best candidates</h3>
										<p className="text-sm text-white/80 mt-2">Create jobs, invite, and hire with ease</p>
									</div>
									<button
										onClick={() => setShowModal(true)}
										className="mt-2 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md font-medium"
									>
										Create a new job
									</button>
									<div className="absolute right-0 top-2 bottom-2 w-2 bg-teal-400 rounded-l-full" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
		</div>
	);
};

export default DashboardAdmin;
