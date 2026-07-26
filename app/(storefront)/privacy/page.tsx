import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MargPharmacy',
  description:
    'MargPharmacy Privacy Policy — how we collect, use, and protect your personal and medical data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-slate-300 text-sm">Last updated: 27 July 2026</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10 text-slate-700 text-sm leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            body: `We collect personal information you voluntarily provide when you register, place orders, or contact us. This includes your name, email address, phone number, delivery address, and prescription images. We also automatically collect technical data such as IP address, browser type, and pages visited to improve our services.`,
          },
          {
            title: '2. How We Use Your Information',
            body: `Your data is used exclusively to process orders, deliver medicines, provide customer support, send order confirmations and updates, and comply with Indian pharmacy regulations. We do not sell, rent, or share your personal data with third parties for marketing purposes.`,
          },
          {
            title: '3. Prescription Data',
            body: `Uploaded prescription images are stored securely in encrypted cloud storage (Supabase). OCR processing occurs entirely client-side using Tesseract.js — your prescription image is never sent to our servers for AI processing. Prescription data is retained for 2 years as required by Indian pharmacy regulations.`,
          },
          {
            title: '4. Data Security',
            body: `All data transmitted between your browser and our servers is encrypted using TLS 1.3. Database records are protected by Row Level Security (RLS) policies ensuring users can only access their own data. Payment transactions are processed by Razorpay, a PCI-DSS compliant payment gateway — we never store raw card details.`,
          },
          {
            title: '5. Cookies',
            body: `We use essential cookies for session management and authentication. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, though this may affect site functionality.`,
          },
          {
            title: '6. Your Rights',
            body: `Under applicable Indian data protection laws, you have the right to access your personal data, correct inaccurate data, request deletion of your account and associated data, and opt out of non-essential communications. To exercise these rights, email us at privacy@margpharmacy.in.`,
          },
          {
            title: '7. Third-Party Services',
            body: `We use Supabase (database and authentication), Razorpay (payments), and Mailtrap (transactional emails). Each third party operates under their own privacy policies and data processing agreements compliant with applicable law.`,
          },
          {
            title: '8. Changes to This Policy',
            body: `We may update this Privacy Policy periodically. We will notify you of material changes via email or a prominent notice on our website. Continued use of MargPharmacy after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '9. Contact',
            body: `For privacy-related queries, contact our Data Protection Officer at privacy@margpharmacy.in or write to MargPharmacy, Shop No. 14, Medical Complex, Indore, MP 452001.`,
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-slate-900 mb-2">{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
