import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { pageMetadata } from "@/lib/seo";

// A generic draft written to match what the site does today: product information, the AI chatbots, the contact
// form, careers applications by email, YouTube and Google Maps embeds. Have it reviewed by a lawyer before it goes live.
export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms that apply when you use the ChemLife Innovations website, its product information and AI chatbots.",
  path: "/terms",
});

const LAST_UPDATED = "21 October 2026";
const EMAIL = "innovate@chemlifeinnovations.com";

const h2 = "font-heading text-2xl font-bold text-brand-navy mt-12 mb-4";
const list = "list-disc pl-6 space-y-2";
const link = "text-teal-aa underline hover:text-teal-700";

// English only for now.
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        <section className="pt-28 md:pt-36 pb-10 md:pb-16 lg:pt-44 lg:pb-20 bg-brand-navy text-white">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">Terms of Use</h1>
            <p className="mt-4 text-white/75">Last updated {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-slate-600 leading-relaxed [overflow-wrap:anywhere]">
            <p>
              These terms apply to your use of chemlifeinnovations.com, including its product information, articles
              and AI chatbots. By using the website you agree to them. If you don&apos;t agree, please don&apos;t use
              the website.
            </p>

            <h2 className={h2}>Who we are</h2>
            <p>
              The website is run by ChemLife Innovations Pvt Ltd (&ldquo;ChemLife&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;),
              Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru 561 203,
              Karnataka, India. You can reach us at <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a> or
              +91 95358 62570.
            </p>

            <h2 className={h2}>Who the website is for</h2>
            <p>
              The website is meant for farmers, feed manufacturers, veterinarians, nutritionists, distributors and
              other people in animal agriculture. You must be at least 18 to use it. If you use it on behalf of a
              business, you confirm you&apos;re allowed to accept these terms for that business.
            </p>

            <h2 className={h2}>Product and technical information</h2>
            <p className="mb-3">
              We describe our products, research and technologies to help you understand what we do. This information
              is general:
            </p>
            <ul className={list}>
              <li>
                It isn&apos;t veterinary, nutritional or regulatory advice for your animals, farm or feed. Feeding
                decisions depend on your animals, ration, conditions and local rules, so please talk to our
                nutritionists or a qualified professional before relying on it.
              </li>
              <li>
                Results described on the website, including trial results and customer experiences, come from
                particular conditions. Your results may differ.
              </li>
              <li>
                Always follow the product label, the technical data sheet and the dosage we or your supplier
                recommend.
              </li>
              <li>
                Products, specifications and registrations can change, and not every product is available or
                approved in every country. Check with us before ordering.
              </li>
              <li>
                Nothing on the website is an offer to sell. Orders and supply are governed by our quotations,
                invoices and any written agreement between us.
              </li>
            </ul>

            <h2 className={h2}>Our AI chatbots, Dr. Kukku and Dr. Mikku</h2>
            <p>
              The chatbots give automatic answers based on our knowledge base. They can be wrong, incomplete or out of
              date, and they aren&apos;t a substitute for advice from a veterinarian or our nutritionists. Check
              anything important with us before acting on it. Please don&apos;t enter sensitive personal information;
              our <Link href="/privacy" className={link}>Privacy Policy</Link> explains how chatbot messages are
              handled.
            </p>

            <h2 className={h2}>Contact form and job applications</h2>
            <p>
              When you contact us or apply for a role, please give accurate information. Don&apos;t send us
              confidential information or trade secrets through the website: we can&apos;t treat unsolicited ideas
              or suggestions as confidential, and we may use them without owing you anything. Applying for a role
              doesn&apos;t create an offer of employment or internship.
            </p>

            <h2 className={h2}>Our content and trademarks</h2>
            <p className="mb-3">
              The website and its content, including text, images, videos, illustrations, designs and research
              summaries, belong to ChemLife or the people who licensed them to us. ChemLife, ANBioT and our product
              names (such as GroGenie, EggGenie, MethioWiz and MaxDmold) are our trademarks. Partner and customer
              logos belong to their owners.
            </p>
            <p className="mb-3">You may:</p>
            <ul className={list}>
              <li>view, download and print pages for your own use or your business&apos;s internal use;</li>
              <li>share links to the website.</li>
            </ul>
            <p className="mt-3">
              You may not copy, change, republish, sell or use our content, names or logos in your own materials,
              products or marketing without our written permission.
            </p>

            <h2 className={h2}>Using the website properly</h2>
            <p className="mb-3">Please don&apos;t:</p>
            <ul className={list}>
              <li>use the website for anything unlawful, misleading or harmful;</li>
              <li>
                try to get around its security, overload it, or send automated or bulk requests to the contact form
                or chatbots;
              </li>
              <li>copy large parts of the website or its knowledge base by scraping or other automated means;</li>
              <li>upload or send viruses or other harmful code;</li>
              <li>pretend to be someone else, or to be connected with ChemLife when you aren&apos;t.</li>
            </ul>
            <p className="mt-3">We may block access to anyone who breaks these rules.</p>

            <h2 className={h2}>Other websites and embedded content</h2>
            <p>
              The website links to, and embeds content from, other services such as YouTube, Google Maps, LinkedIn,
              WordPress and Google Reviews. We don&apos;t control them and aren&apos;t responsible for their content
              or how they handle your data. Their own terms and policies apply.
            </p>

            <h2 className={h2}>Availability and changes</h2>
            <p>
              We work to keep the website accurate and available, but we provide it &ldquo;as is&rdquo; and
              can&apos;t promise it will always be complete, current, uninterrupted or free of errors. We may change,
              suspend or remove any part of it at any time.
            </p>

            <h2 className={h2}>Our liability</h2>
            <p>
              As far as the law allows, ChemLife isn&apos;t liable for any loss or damage, including loss of animals,
              production, profit or data, arising from your use of the website, its information or its chatbots, or
              from being unable to use it. This doesn&apos;t affect liability that can&apos;t be limited by law, or
              our obligations under any separate agreement for the supply of products.
            </p>

            <h2 className={h2}>Privacy</h2>
            <p>
              Our <Link href="/privacy" className={link}>Privacy Policy</Link> explains what information we collect
              through the website and how we use it.
            </p>

            <h2 className={h2}>Governing law</h2>
            <p>
              These terms are governed by the laws of India. Any dispute about them or the website will be decided by
              the courts in Bengaluru, Karnataka.
            </p>

            <h2 className={h2}>Changes to these terms</h2>
            <p>
              We may update these terms from time to time. The date at the top shows when they last changed. If you
              keep using the website after a change, the updated terms apply.
            </p>

            <h2 className={h2}>Contact</h2>
            <p>
              Questions about these terms? Email <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </VariantProvider>
  );
}
