import { BankDetails } from '@/types';

/**
 * Bank Transfer Instructions and Account Configuration.
 * Configured for official V2Nexus payments.
 */
export const adminBankDetails: BankDetails = {
  bankName: 'Bank of Ceylon (BOC)',
  accountName: 'MR A D D M U NANAYAKKARA',
  accountNumber: '0094574296',
  branch: 'Uragasmanhandiya Branch (748)',
  instructions: [
    'Transfer the exact package price via Online Banking (CEFTS / SLIPS / BOC App) or CDM Cash Deposit Machine.',
    'Mention your Phone Number or Order ID in the payment reference/remark field if possible.',
    'Take a clear screenshot or photo of the payment receipt or transaction confirmation slip.',
    'Upload the slip (JPG, PNG, or PDF) using the upload field below.',
    'Our verification system verifies incoming payments and provisions your V2Ray VPN account.',
  ],
};
