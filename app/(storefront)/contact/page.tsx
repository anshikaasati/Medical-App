import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us — MargPharmacy',
  description:
    'Get in touch with MargPharmacy. Reach our pharmacist support team via phone, email, or our contact form.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
          Have a question or need help with an order? Our licensed pharmacist team is here for you.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Get in Touch</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We aim to respond to all queries within 2 business hours. For urgent prescription
              queries, please call us directly.
            </p>

            {[
              {
                icon: '📞',
                label: 'Phone Support',
                value: '+91 98765 43210',
                sub: 'Mon–Sat, 9 AM – 9 PM',
              },
              {
                icon: '📧',
                label: 'Email',
                value: 'support@margpharmacy.in',
                sub: 'Response within 2 hours',
              },
              {
                icon: '📍',
                label: 'Store Address',
                value: 'MargPharmacy, Shop No. 14, Medical Complex, Indore, MP 452001',
                sub: 'Walk-in Mon–Sun, 8 AM – 10 PM',
              },
              {
                icon: '🤝',
                label: 'Business Enquiries',
                value: 'partner@margpharmacy.in',
                sub: 'Distributor and B2B partnerships',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Send a Message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Anshika"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Asati"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subject
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors">
                  <option>Order Issue</option>
                  <option>Prescription Query</option>
                  <option>Medicine Availability</option>
                  <option>Delivery Problem</option>
                  <option>Return / Refund</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
              >
                Send Message →
              </button>
              <p className="text-xs text-center text-slate-400">
                By submitting, you agree to our{' '}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
