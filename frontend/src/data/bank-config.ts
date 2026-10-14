import { BankDetails } from '@/types';

/**
 * Bank Transfer Instructions and Account Configuration.
 * Configured by the Administrator.
 */
export const adminBankDetails: BankDetails = {
  bankName: 'Commercial Bank of Ceylon PLC',
  accountName: 'V2Nexus Lanka (Pvt) Ltd',
  accountNumber: '8010 4920 1824',
  branch: 'Kollupitiya Super Branch (012)',
  instructions: [
    'Transfer the exact final amount via Online Banking (CEFTS / SLIPS) or Cash Deposit Machine (CDM / ATM).',
    'Include your Phone Number or Order ID in the payment reference/remark field if possible.',
    'Take a clear screenshot or photo of the payment receipt or transaction confirmation.',
    'Upload the slip (JPG, PNG, or PDF up to 5 MB) using the upload field below.',
    'Our verification team reviews incoming transfers within 15 to 30 minutes and approves your V2Ray VPN account.',
  ],
};
