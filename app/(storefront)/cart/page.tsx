import { redirect } from 'next/navigation';

// /cart → redirect to /shop/cart
export default function CartPage() {
  redirect('/shop/cart');
}
