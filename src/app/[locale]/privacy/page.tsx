import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { GA_ID } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

// A generic policy that matches what the site does today: GA only after consent, the contact form sent
// through Resend, the chatbot's use of OpenAI and Pinecone, YouTube and Google Maps embeds. Update it when any of those change, and have it reviewed.
export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How ChemLife Innovations handles personal data, cookies and analytics on this website.",
  path: "/privacy",
});

const LAST_UPDATED = "22 October 2026";
const EMAIL = "innovate@chemlifeinnovations.com";

const h2 = "font-heading text-2xl font-bold text-brand-navy mt-12 mb-4";
const h3 = "font-heading text-lg font-bold text-brand-navy mt-6 mb-2";
const list = "list-disc pl-6 space-y-2";
const link = "text-teal-600 underline hover:text-teal-700";

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
      {children}
    </a>
  );
}

// English only for now.
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  const sessionCookie = `_ga_${GA_ID.replace(/^G-/, "")}`;

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-brand-navy text-white">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white">Privacy Policy</h1>
            <p className="mt-4 text-white/75">Last updated {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-slate-600 leading-relaxed">
            <p>
              This policy explains what information ChemLife Innovations collects when you use
              chemlifeinnovations.com, why, and the choices you have. We collect as little as we need, and we
              don&apos;t sell personal data.
            </p>

            <h2 className={h2}>Who we are</h2>
            <p>
              ChemLife Innovations Pvt Ltd, Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli,
              Doddaballapura, Greater Bengaluru 561 203, Karnataka, India. For anything about your data, email{" "}
              <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a> or call +91 95358 62570.
            </p>

            <h2 className={h2}>What we collect</h2>

            <h3 className={h3}>Website analytics, only if you accept</h3>
            <p className="mb-3">
              If you click <strong>Accept</strong> on our cookie banner, we use Google Analytics to understand how
              the site is used and to improve it. It records:
            </p>
            <ul className={list}>
              <li>the pages you visit, how you arrived (for example from a search engine) and how far you scroll;</li>
              <li>the links and buttons you click, with their label and the product or article they belong to;</li>
              <li>your device type, browser, screen size and approximate location (country or city);</li>
              <li>how quickly pages load and respond for you, so we can find slow pages.</li>
            </ul>
            <p className="mt-3">
              Google Analytics doesn&apos;t record or store your IP address. We haven&apos;t turned on Google
              signals or any advertising features, and we don&apos;t use analytics data to identify you. If you
              click <strong>Decline</strong>, or don&apos;t choose, Google Analytics isn&apos;t loaded at all.
            </p>

            <h3 className={h3}>When you contact us</h3>
            <p>
              If you use our contact form, email or call us, we receive your name, contact details and whatever you
              tell us, and we use them only to reply and to follow up on your enquiry. Messages from the contact form
              are delivered to our inbox by Resend, an email delivery service.
            </p>

            <h3 className={h3}>Our AI chatbots, Dr. Kukku and Dr. Mikku</h3>
            <p>
              When you ask a chatbot a question, your message and the last few messages of the conversation are
              sent to our server and on to OpenAI, which generates the answer. To find relevant information, a
              numerical representation of your question (not its text) is searched against our knowledge base,
              hosted by Pinecone. We don&apos;t store your conversations; they stay in your browser tab and are gone
              when you close it. Please don&apos;t share sensitive personal information in the chat.
            </p>

            <h3 className={h3}>Technical information</h3>
            <p>
              Like any website, our hosting provider receives your IP address and browser details with each request
              and keeps short-term logs to run and protect the site. To prevent abuse, the chatbot and the contact
              form briefly count requests per IP address; these counts are held in memory and discarded within a
              day.
            </p>

            <h2 className={h2}>Cookies and browser storage</h2>
            <p className="mb-4">
              We only set analytics cookies after you accept them. Your choice itself is saved in your browser&apos;s
              local storage so we don&apos;t ask again on every page. If you pick a language in the header, a small
              cookie remembers it; it holds only the language code.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200">
                <thead className="bg-slate-50 text-brand-navy">
                  <tr>
                    <th className="text-left p-3 border-b border-slate-200">Name</th>
                    <th className="text-left p-3 border-b border-slate-200">Purpose</th>
                    <th className="text-left p-3 border-b border-slate-200">Kept for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-slate-200 font-mono">_ga</td>
                    <td className="p-3 border-b border-slate-200">Google Analytics: tells visits from the same browser apart. Only after you accept.</td>
                    <td className="p-3 border-b border-slate-200">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-200 font-mono">{sessionCookie}</td>
                    <td className="p-3 border-b border-slate-200">Google Analytics: keeps track of the current visit. Only after you accept.</td>
                    <td className="p-3 border-b border-slate-200">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-slate-200 font-mono">lang</td>
                    <td className="p-3 border-b border-slate-200">Remembers the language you picked (English, Kannada or Hindi), so we don&apos;t switch you to your browser&apos;s language. Only after you pick one.</td>
                    <td className="p-3 border-b border-slate-200">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono">chemlife-analytics-consent</td>
                    <td className="p-3">Local storage, not a cookie: remembers whether you accepted or declined analytics.</td>
                    <td className="p-3">Until you clear your browser data</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className={h2}>Your choices</h2>
            <ul className={list}>
              <li>
                Change your mind at any time with <strong>Cookie settings</strong> at the bottom of every page. If you
                withdraw consent, we delete the Google Analytics cookies and stop collecting analytics.
              </li>
              <li>
                Block Google Analytics on all websites with Google&apos;s{" "}
                <External href="https://tools.google.com/dlpage/gaoptout">opt-out browser add-on</External>.
              </li>
              <li>Clear or block cookies in your browser settings.</li>
            </ul>

            <h2 className={h2}>Services we use</h2>
            <p className="mb-3">
              These providers process data on our behalf or when you use their features on our site. Some may
              process it outside India.
            </p>
            <ul className={list}>
              <li>
                <strong>Google Analytics</strong> (Google LLC), with your consent:{" "}
                <External href="https://policies.google.com/technologies/partner-sites">how Google uses data from sites that use its services</External>.
              </li>
              <li>
                <strong>YouTube</strong> videos use YouTube&apos;s privacy-enhanced mode and only load when you press
                play. Google may then set cookies under its{" "}
                <External href="https://policies.google.com/privacy">privacy policy</External>.
              </li>
              <li>
                <strong>Google Maps</strong> shows our location on the Contact page. Google receives your IP address
                when the map loads.
              </li>
              <li>
                <strong>OpenAI</strong> and <strong>Pinecone</strong> power the chatbots:{" "}
                <External href="https://openai.com/policies/privacy-policy/">OpenAI privacy policy</External>,{" "}
                <External href="https://www.pinecone.io/privacy/">Pinecone privacy policy</External>.
              </li>
              <li>
                <strong>Resend</strong> delivers contact form messages to our inbox:{" "}
                <External href="https://resend.com/legal/privacy-policy">Resend privacy policy</External>.
              </li>
              <li>
                <strong>Hostinger</strong> hosts the website:{" "}
                <External href="https://www.hostinger.com/legal/privacy-policy">Hostinger privacy policy</External>.
              </li>
            </ul>
            <p className="mt-3">
              Links to other sites, such as LinkedIn, WordPress or Google Reviews, are covered by those sites&apos;
              own policies.
            </p>

            <h2 className={h2}>How long we keep data</h2>
            <p>
              Google Analytics data is kept for up to 14 months and then deleted automatically. Emails and enquiries
              are kept for as long as needed to respond and for our business records.
            </p>

            <h2 className={h2}>Your rights</h2>
            <p>
              Under India&apos;s Digital Personal Data Protection Act, 2023, and, if you are in the EU or UK, the
              GDPR, you can ask to see the personal data we hold about you, correct it, have it deleted, or withdraw
              your consent. Email <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a> and we&apos;ll respond
              within 30 days. If you&apos;re not satisfied, you can complain to the Data Protection Board of India or
              your local data protection authority.
            </p>

            <h2 className={h2}>Children</h2>
            <p>
              This website is meant for farmers, feed manufacturers and industry professionals, not children. We
              don&apos;t knowingly collect data from anyone under 18.
            </p>

            <h2 className={h2}>Changes to this policy</h2>
            <p>
              If we change how we use data, we&apos;ll update this page and the date at the top. Significant changes
              will be shown on the site.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </VariantProvider>
  );
}
