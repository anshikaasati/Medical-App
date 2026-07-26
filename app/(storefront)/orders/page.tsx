import { redirect } from 'next/navigation';

// /orders → redirect to account orders page
export default function OrdersPage() {
  redirect('/account/orders');
}
