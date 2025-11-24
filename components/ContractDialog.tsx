import React from 'react';

interface ContractFormData {
    title: string;
    description: string;
    price: string;
    deadline: string;
    location: string;
    estimatedHours: string;
    paymentTerms: string;
}

interface ContractDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contractForm: ContractFormData;
    setContractForm: (form: ContractFormData) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

const ContractDialog: React.FC<ContractDialogProps> = ({
    isOpen,
    onClose,
    contractForm,
    setContractForm,
    onSubmit,
    isSubmitting
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Create Contract Proposal</h3>

                <div className="space-y-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Title</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Contract title"
                            value={contractForm.title}
                            onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-24"
                            placeholder="Describe the work to be done"
                            value={contractForm.description}
                            onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Price ($)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="0.00"
                                value={contractForm.price}
                                onChange={(e) => setContractForm({ ...contractForm, price: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Estimated Hours</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="0"
                                value={contractForm.estimatedHours}
                                onChange={(e) => setContractForm({ ...contractForm, estimatedHours: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Location</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Job location"
                            value={contractForm.location}
                            onChange={(e) => setContractForm({ ...contractForm, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Deadline</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={contractForm.deadline}
                            onChange={(e) => setContractForm({ ...contractForm, deadline: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Payment Terms</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full h-20"
                            placeholder="Payment terms and conditions"
                            value={contractForm.paymentTerms}
                            onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                        />
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        className="btn"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onSubmit}
                        disabled={
                            isSubmitting ||
                            !contractForm.title ||
                            !contractForm.description ||
                            !contractForm.price ||
                            !contractForm.deadline ||
                            !contractForm.location ||
                            !contractForm.estimatedHours ||
                            !contractForm.paymentTerms
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            'Send Proposal'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractDialog;
