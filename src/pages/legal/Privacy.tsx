import PageLayout from "@/components/layout/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-playfair font-semibold mb-8">
          Privacy Policy
        </h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <p>We collect information that you provide directly to us, including name, contact information, and appointment history.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, communicate with you about appointments, and send relevant updates.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.</p>
        </section>
      </div>
    </PageLayout>
  );
}