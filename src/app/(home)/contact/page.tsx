import { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Kick Back team. We&apos;re here to help with any questions or support you need.",
};

export default function ContactPage() {
  return (
    <div className="relative pt-20 sm:pt-24 pb-12 sm:pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question or need help? We&apos;re here to assist you. Send us
            a message and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
          <ContactForm />
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            We typically respond within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
}
