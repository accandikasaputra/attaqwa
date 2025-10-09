import DonationInfoSection from '../DonationInfoSection';

export default function DonationInfoSectionExample() {
  const mockBankAccounts = [
    {
      bank: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '7123456789',
      accountName: 'Masjid At-Taqwa',
    },
    {
      bank: 'Bank Mandiri Syariah',
      accountNumber: '1234567890',
      accountName: 'Yayasan Masjid At-Taqwa',
    },
  ];

  return <DonationInfoSection bankAccounts={mockBankAccounts} />;
}
