import { redirect } from 'next/navigation';

// /prescriptions → redirect to the OCR scanner
export default function PrescriptionsPage() {
  redirect('/shop/prescriptions');
}
