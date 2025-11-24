import express from 'express';
import { createContractProposal, getUserContracts, updateContractStatus } from '../controllers/contract.controller.js';

const router = express.Router();

// Create contract proposal
router.post('/', createContractProposal);

// Get all contracts for user
router.get('/', getUserContracts);

// Update contract status (accept/reject)
router.patch('/:id/status', updateContractStatus);

export default router;
