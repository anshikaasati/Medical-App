import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQs — MargPharmacy',
  description:
    'Frequently asked questions about MargPharmacy — orders, prescriptions, delivery, and more.',
};

const faqs = [
  {
    q: 'How do I order medicines online?',
    a: "Browse our medicine catalog at /shop, add items to your cart, and complete checkout securely via Razorpay. You'll receive an order confirmation instantly.",
  },
  {
    q: 'Can I upload my prescription?',
    a: 'Yes! Visit the Prescriptions page, upload a photo of your prescription, and our AI-powered OCR scanner will extract the medicine names for you automatically.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards, net banking, and EMI options — all securely handled by Razorpay.',
  },
  {
    q: 'How do I track my order?',
    a: 'Log in to your account and visit "My Orders" to see real-time order status, invoice details, and estimated delivery dates.',
  },
  {
    q: 'Are the medicines genuine and licensed?',
    a: 'Absolutely. MargPharmacy is a registered pharmacy. All medicines are sourced directly from licensed distributors and manufacturers with batch verification.',
  },
  {
    q: 'Can I return or exchange medicines?',
    a: 'Returns are accepted within 7 days for unopened, sealed medicines with valid receipts. Prescription medicines have restricted return policies per government regulations.',
  },
  {
    q: 'Do you offer home delivery?',
    a: 'Yes, we offer home delivery within our serviceable pincodes. Delivery times vary between 2–4 hours for express and next-day for standard orders.',
  },
  {
    q: 'How is my personal data protected?',
    a: 'All data is encrypted in transit (TLS) and at rest. We use Supabase with Row Level Security to ensure your data is only accessible by you. See our Privacy Policy for more.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-emerald-100 max-w-xl mx-auto">
          Everything you need to know about MargPharmacy. Can&apos;t find your answer?{' '}
          <Link href="/contact" className="underline hover:text-white font-semibold">
            Contact our support team.
          </Link>
        </p>
      </div>

      {/* FAQ List */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:shadow-md transition-shadow"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-slate-800 list-none">
                {item.q}
                <span className="shrink-0 text-emerald-600 transition-transform group-open:rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-emerald-50 border border-emerald-100 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">Still have questions?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Our pharmacist support team is available 9 AM – 9 PM, Mon–Sat.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
