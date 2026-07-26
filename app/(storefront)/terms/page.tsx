import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — MargPharmacy',
  description:
    "Read the Terms & Conditions governing use of MargPharmacy's online pharmacy platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-3 text-slate-300 text-sm">Last updated: 27 July 2026</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10 text-slate-700 text-sm leading-relaxed">
        {[
          {
            title: '1. Acceptance of Terms',
            body: `By accessing or using MargPharmacy's website or services, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please discontinue use immediately.`,
          },
          {
            title: '2. Eligibility',
            body: `You must be at least 18 years of age to use our services. Prescription medicines may only be ordered with a valid prescription issued by a registered medical practitioner. We reserve the right to verify prescriptions before fulfilling orders.`,
          },
          {
            title: '3. Prescription Medicines',
            body: `Orders for Schedule H and H1 drugs require a valid prescription. By uploading a prescription, you confirm it is genuine and issued to you. Fraudulent prescriptions will result in immediate account termination and may be reported to regulatory authorities.`,
          },
          {
            title: '4. Pricing and Payments',
            body: `All prices are listed in Indian Rupees (INR) and include applicable GST. Prices are subject to change without notice. Payment is processed securely by Razorpay. MargPharmacy does not store payment card information.`,
          },
          {
            title: '5. Delivery',
            body: `We deliver within our serviceable areas. Delivery timelines are estimates and may vary due to unforeseen circumstances. Risk of loss transfers to you upon delivery. If your order arrives damaged, contact us within 24 hours.`,
          },
          {
            title: '6. Returns and Refunds',
            body: `Unopened, sealed non-prescription medicines may be returned within 7 days. Prescription medicines, refrigerated items, and opened packages are non-returnable as per CDSCO guidelines. Refunds are processed within 5–7 business days.`,
          },
          {
            title: '7. Intellectual Property',
            body: `All content on this platform including logos, text, images, and software is the intellectual property of MargPharmacy. Unauthorized reproduction, distribution, or commercial use is strictly prohibited.`,
          },
          {
            title: '8. Limitation of Liability',
            body: `MargPharmacy is not liable for any indirect, incidental, or consequential damages arising from use of our services. Our maximum liability is limited to the value of your last order. Medical advice on this platform is general in nature and does not substitute professional consultation.`,
          },
          {
            title: '9. Governing Law',
            body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Indore, Madhya Pradesh.`,
          },
          {
            title: '10. Contact',
            body: `For legal queries, contact us at legal@margpharmacy.in or MargPharmacy, Shop No. 14, Medical Complex, Indore, MP 452001.`,
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
