import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-playfair font-semibold mb-8">Contact Us</h1>
        
        <div className="grid gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Get in Touch</h2>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
          </div>

          <form className="space-y-4">
            <div className="grid gap-4">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Email Address" />
              <Textarea placeholder="Your Message" rows={4} />
            </div>
            <Button className="w-full">Send Message</Button>
          </form>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold">Visit Us</h3>
            <address className="not-italic text-muted-foreground">
              123 Salon Street<br />
              Beauty City, BC 12345<br />
              info@bellesalon.com<br />
              (555) 123-4567
            </address>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}