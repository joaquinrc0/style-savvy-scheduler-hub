import PageLayout from "@/components/layout/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-playfair font-semibold mb-8">
          Terms & Conditions
        </h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
          <p>By accessing and using Belle Salon's services, you agree to be bound by these Terms & Conditions.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Appointments</h2>
          <p>We require 24-hour notice for cancellations. Late cancellations may incur a fee of 50% of the service price.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Payment Terms</h2>
          <p>Payment is required at the time of service. We accept cash, credit cards, and approved digital payment methods.</p>
        </section>
      </div>
    </PageLayout>
  );
}