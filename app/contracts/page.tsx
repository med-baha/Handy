"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContractsPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingContract, setUpdatingContract] = useState<string | null>(null);

    const fetchContracts = async () => {
        try {
            const token = await getToken();
            const res = await fetch('http://localhost:3001/api/contracts', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (res.ok) {
                const data = await res.json();
                setContracts(data);
            }
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (contractId: string, status: 'accepted' | 'rejected') => {
        setUpdatingContract(contractId);

        try {
            const token = await getToken();
            const res = await fetch(`http://localhost:3001/api/contracts/${contractId}/status`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Refresh contracts list
                fetchContracts();
                toast.success(
                    status === 'accepted'
                        ? 'Contract accepted successfully!'
                        : 'Contract rejected',
                    { duration: 3000 }
                );
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to update contract", { duration: 5000 });
            }
        } catch (error) {
            console.error("Error updating contract:", error);
            toast.error("Error updating contract", { duration: 5000 });
        } finally {
            setUpdatingContract(null);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    // Separate contracts into pending and accepted
    const pendingContracts = contracts.filter(c => c.status === 'pending');
    const acceptedContracts = contracts.filter(c => c.status === 'accepted');

    return (
        <div className="min-h-screen bg-base-200 font-sans text-base-content">
            <div className="container mx-auto max-w-7xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-ghost gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>
                    <h1 className="text-3xl font-bold text-secondary">Contracts</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg text-secondary"></span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pending Contracts Section */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-2xl flex items-center gap-2">
                                    <Clock size={24} className="text-warning" />
                                    Pending Proposals
                                </h2>

                                {pendingContracts.length === 0 ? (
                                    <p className="text-base-content/50 text-center py-8">No pending contract proposals</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingContracts.map((contract) => (
                                            <div key={contract._id} className="border border-base-300 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{contract.title}</h3>
                                                        <p className="text-sm text-base-content/70">
                                                            From: {contract.sender?.name || 'Unknown'} → To: {contract.receiver?.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <div className="badge badge-warning gap-2">
                                                        <Clock size={14} />
                                                        Pending
                                                    </div>
                                                </div>

                                                <p className="text-base-content/80 mb-3">{contract.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Price</p>
                                                        <p className="font-semibold">${contract.price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Est. Hours</p>
                                                        <p className="font-semibold">{contract.estimatedHours}h</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Location</p>
                                                        <p className="font-semibold">{contract.location}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Deadline</p>
                                                        <p className="font-semibold">
                                                            {new Date(contract.deadline).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-xs text-base-content/60 mb-1">Payment Terms</p>
                                                    <p className="text-sm">{contract.paymentTerms}</p>
                                                </div>

                                                {/* Show accept/reject buttons only if user is the receiver */}
                                                {contract.receiver?._id && (
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            className="btn btn-sm btn-error gap-2"
                                                            onClick={() => handleUpdateStatus(contract._id, 'rejected')}
                                                            disabled={updatingContract === contract._id}
                                                        >
                                                            {updatingContract === contract._id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <XCircle size={16} />
                                                                    Reject
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-success gap-2"
                                                            onClick={() => handleUpdateStatus(contract._id, 'accepted')}
                                                            disabled={updatingContract === contract._id}
                                                        >
                                                            {updatingContract === contract._id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle size={16} />
                                                                    Accept
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Accepted Contracts Section */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-2xl flex items-center gap-2">
                                    <CheckCircle size={24} className="text-success" />
                                    Accepted Contracts
                                </h2>

                                {acceptedContracts.length === 0 ? (
                                    <p className="text-base-content/50 text-center py-8">No accepted contracts</p>
                                ) : (
                                    <div className="space-y-4">
                                        {acceptedContracts.map((contract) => (
                                            <div key={contract._id} className="border border-success rounded-lg p-4 bg-success/5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{contract.title}</h3>
                                                        <p className="text-sm text-base-content/70">
                                                            From: {contract.sender?.name || 'Unknown'} → To: {contract.receiver?.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <div className="badge badge-success gap-2">
                                                        <CheckCircle size={14} />
                                                        Accepted
                                                    </div>
                                                </div>

                                                <p className="text-base-content/80 mb-3">{contract.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Price</p>
                                                        <p className="font-semibold">${contract.price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Est. Hours</p>
                                                        <p className="font-semibold">{contract.estimatedHours}h</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Location</p>
                                                        <p className="font-semibold">{contract.location}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-base-content/60">Deadline</p>
                                                        <p className="font-semibold">
                                                            {new Date(contract.deadline).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-base-content/60 mb-1">Payment Terms</p>
                                                    <p className="text-sm">{contract.paymentTerms}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
