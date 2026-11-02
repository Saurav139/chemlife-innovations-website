import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { pageMetadata } from "@/lib/seo";

// The company privacy policy, effective 02 November 2026, as supplied by ChemLife. Have changes legally reviewed.
export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Chemlife Innovations collects, uses, protects and retains personal data, in line with India's Digital Personal Data Protection Act, 2023.",
  path: "/privacy",
});

const EFFECTIVE = "02 November 2026";
const EMAIL = "innovate@chemlifeinnovations.com";

const h2 = "font-heading text-2xl font-bold text-brand-navy mt-12 mb-4";
const list = "list-disc pl-6 space-y-2";
const link = "text-teal-aa underline hover:text-teal-700";

// English only for now.
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        <section className="pt-26 md:pt-32 pb-10 md:pb-16 lg:pt-36 lg:pb-20 bg-brand-navy text-white">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">Privacy Policy</h1>
            <p className="mt-4 text-white/75">Effective {EFFECTIVE}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-slate-600 leading-relaxed [overflow-wrap:anywhere]">
            <p>
              Chemlife Innovations (&ldquo;Chemlife&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a science-led animal
              nutrition and feed additives company. This policy explains how we collect, use, protect, and retain
              personal data, in line with applicable Indian data protection law, including the Digital Personal Data
              Protection Act, 2023.
            </p>

            <h2 className={h2}>1. Personal data we collect</h2>
            <ul className={list}>
              <li>
                Employees and job applicants: identity, contact, and employment information needed for hiring and
                administration.
              </li>
              <li>
                Customers, distributors, and business contacts: name, organisation, role, contact details, and records
                of our communication with you.
              </li>
              <li>
                Website visitors and leads: information you submit through enquiry forms, and information collected
                through our digital marketing activity, including LinkedIn and other platforms.
              </li>
            </ul>

            <h2 className={h2}>2. How we use personal data</h2>
            <p>
              We collect personal data only for defined, legitimate business purposes, such as employment
              administration, responding to enquiries, managing customer and distributor relationships, and business
              development. We do not use it for unrelated purposes without an appropriate basis.
            </p>
            <p className="mt-3">
              Where we collect contact details through LinkedIn or other digital marketing activity, including through
              automation tools, we handle them in line with the platform&apos;s terms and applicable law, and use them
              only for the stated business development purpose.
            </p>

            <h2 className={h2}>3. How we protect personal data</h2>
            <p>
              We protect personal data with access controls, encryption where appropriate, and internal information
              security policies. Access is limited to people with a legitimate business need.
            </p>

            <h2 className={h2}>4. Sharing with third parties</h2>
            <p>
              We do not share personal data with third parties, including vendors and marketing platforms, without an
              appropriate contractual basis and, where required, consent.
            </p>

            <h2 className={h2}>5. Retention</h2>
            <p>
              We keep personal data only as long as necessary for the purpose for which it was collected, and dispose
              of it securely at the end of its retention period.
            </p>

            <h2 className={h2}>6. Your rights</h2>
            <p>
              You may ask to access or correct your personal data, or raise a concern about how it is handled. Requests
              are handled in accordance with applicable law.
            </p>

            <h2 className={h2}>7. Personal data breaches</h2>
            <p>
              We have an incident management process to report and handle suspected breaches, including assessing any
              notification obligations under applicable law.
            </p>

            <h2 className={h2}>8. Contact us</h2>
            <p>
              To make a request or raise a concern, please contact Chemlife Management at{" "}
              <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>, or using the details on the Contact page of our
              website.
            </p>

            <h2 className={h2}>9. Updates</h2>
            <p>
              We may update this policy from time to time. The current version and its effective date are shown at the
              top of this page.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </VariantProvider>
  );
}
