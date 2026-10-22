import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { GA_ID } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

// Privacy notice written for India's Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025.
// It describes what the site does today: GA only after consent, the contact form sent through Resend to our
// Google Workspace inbox, the chatbot's use of OpenAI and Pinecone, job applications by email, YouTube and
// Google Maps embeds, the language cookie. Update it when any of those change, and have it legally reviewed.
export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ChemLife Innovations collects, uses and protects personal data on this website, and your rights under India's Digital Personal Data Protection Act, 2023.",
  path: "/privacy",
});

const LAST_UPDATED = "22 October 2026";
const EMAIL = "innovate@chemlifeinnovations.com";
const PHONE = "+91 95358 62570";

const h2 = "font-heading text-2xl font-bold text-brand-navy mt-12 mb-4 scroll-mt-24";
const list = "list-disc pl-6 space-y-2";
const link = "text-teal-600 underline hover:text-teal-700";
const th = "text-left p-3 border-b border-slate-200";
const td = "p-3 border-b border-slate-200 align-top";

const SECTIONS = [
  ["who-we-are", "Who we are"],
  ["words", "Words we use"],
  ["what-we-collect", "What we collect and why"],
  ["consent", "Consent and how to withdraw it"],
  ["cookies", "Cookies and browser storage"],
  ["sharing", "Who we share data with"],
  ["outside-india", "Data processed outside India"],
  ["retention", "How long we keep data"],
  ["security", "How we protect data"],
  ["breach", "If there is a data breach"],
  ["rights", "Your rights"],
  ["requests", "Requests, complaints and our Grievance Officer"],
  ["duties", "Your duties"],
  ["children", "Children and people with disabilities"],
  ["language", "Other languages"],
  ["outside", "Visitors from outside India"],
  ["changes", "Changes to this policy"],
] as const;

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
      {children}
    </a>
  );
}

function Mail() {
  return <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>;
}

/** One processing activity: what we collect, why, on what basis, and for how long. */
function Activity({ title, data, purpose, basis, kept }: { title: string; data: React.ReactNode; purpose: React.ReactNode; basis: React.ReactNode; kept: React.ReactNode }) {
  const row = "grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4 py-3 border-t border-slate-200 first:border-t-0";
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-2">
      <h3 className="font-heading text-lg font-bold text-brand-navy pt-3 pb-1">{title}</h3>
      <dl>
        <div className={row}><dt className="font-semibold text-brand-navy">What we collect</dt><dd>{data}</dd></div>
        <div className={row}><dt className="font-semibold text-brand-navy">Why</dt><dd>{purpose}</dd></div>
        <div className={row}><dt className="font-semibold text-brand-navy">Basis</dt><dd>{basis}</dd></div>
        <div className={row}><dt className="font-semibold text-brand-navy">How long</dt><dd>{kept}</dd></div>
      </dl>
    </div>
  );
}

// English only for now; section 15 offers a Kannada or Hindi copy on request.
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  const sessionCookie = `_ga_${GA_ID.replace(/^G-/, "")}`;

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        <section className="pt-28 pb-16 lg:pt-32 lg:pb-20 bg-brand-navy text-white">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white">Privacy Policy</h1>
            <p className="mt-4 text-white/75">Last updated {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-slate-600 leading-relaxed">
            <p>
              This policy is our notice to you under India&apos;s Digital Personal Data Protection Act, 2023 (the
              &ldquo;DPDP Act&rdquo;) and the Digital Personal Data Protection Rules, 2025. It explains what personal
              data ChemLife Innovations collects through chemlifeinnovations.com, why, how long we keep it, who we
              share it with, and how you can exercise your rights or complain.
            </p>

            <div className="mt-8 rounded-xl border-l-4 border-teal-500 bg-teal-50/60 p-5">
              <p className="font-heading font-bold text-brand-navy mb-2">In short</p>
              <ul className={list}>
                <li>You can browse the whole website without giving us any personal data.</li>
                <li>We only use analytics cookies if you click <strong>Accept</strong>, and you can withdraw that at any time.</li>
                <li>What you send us through the contact form, by email or in the chatbot is used only to answer you.</li>
                <li>We don&apos;t sell personal data, and we don&apos;t use it for advertising.</li>
                <li>
                  You can ask to see, correct or erase your data, or complain, by writing to <Mail />.
                </li>
              </ul>
            </div>

            <nav aria-label="Contents" className="mt-10">
              <p className="font-heading font-bold text-brand-navy mb-2">Contents</p>
              <ol className="list-decimal pl-6 space-y-1 columns-1 sm:columns-2 gap-8">
                {SECTIONS.map(([id, title]) => (
                  <li key={id}><a href={`#${id}`} className={link}>{title}</a></li>
                ))}
              </ol>
            </nav>

            <h2 id="who-we-are" className={h2}>1. Who we are</h2>
            <p>
              ChemLife Innovations Pvt Ltd (&ldquo;ChemLife&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), Plot no 18,
              KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru 561 203, Karnataka,
              India, runs this website. For the personal data described here, we are the Data Fiduciary: we decide
              why and how it is processed.
            </p>
            <p className="mt-3">
              Questions about this policy or your data go to our Grievance Officer at <Mail /> or {PHONE} (see{" "}
              <a href="#requests" className={link}>section 12</a>).
            </p>

            <h2 id="words" className={h2}>2. Words we use</h2>
            <ul className={list}>
              <li><strong>Personal data</strong>: any data about an individual who can be identified by or from it, such as your name, email address or IP address.</li>
              <li><strong>You</strong> or <strong>Data Principal</strong>: the person the personal data is about. For a child or a person with a disability, this includes their parent or lawful guardian.</li>
              <li><strong>Processing</strong>: anything done with personal data, such as collecting, storing, using, sharing or erasing it.</li>
              <li><strong>Data Processor</strong>: a company that processes personal data for us, on our instructions.</li>
              <li><strong>Board</strong>: the Data Protection Board of India, set up under the DPDP Act.</li>
            </ul>

            <h2 id="what-we-collect" className={h2}>3. What we collect and why</h2>
            <p>
              We collect only what each activity below needs. If you don&apos;t use a feature, we don&apos;t collect
              the data for it.
            </p>

            <Activity
              title="a. Enquiries: the contact form, email and phone"
              data={<>Your name, email address, phone number (optional), the type of enquiry, the subject and your message, and anything else you choose to tell us.</>}
              purpose={<>To reply to you and follow up on your enquiry, for example to share product information, a quotation, or to discuss a distribution or research partnership.</>}
              basis={<>You give us this data yourself so that we can respond (section 7(a) of the DPDP Act). You can ask us to stop using it at any time.</>}
              kept={<>Up to 3 years after our last exchange with you. If the enquiry leads to an order or a contract, the related records are kept for as long as Indian accounting and tax laws require.</>}
            />

            <Activity
              title="b. Job and internship applications"
              data={<>What you send us by email when you apply: usually your name, contact details, CV, education, work experience and any documents you attach. The Careers page only opens your own email app; the website itself doesn&apos;t receive or store your application.</>}
              purpose={<>To assess your application, contact you about it, and arrange interviews.</>}
              basis={<>You send this data to us yourself to apply for a role (section 7(a) of the DPDP Act).</>}
              kept={<>Up to 12 months after the role is filled, so we can contact you about similar openings, unless you ask us to erase it sooner. If you join us, it becomes part of your employment records.</>}
            />

            <Activity
              title="c. Our AI chatbots, Dr. Kukku and Dr. Mikku"
              data={<>The question you type and the last few messages of the conversation. We don&apos;t ask for your name or contact details in the chat. Please don&apos;t share personal or sensitive information there.</>}
              purpose={<>To generate an answer. Your question is sent to OpenAI, which writes the reply. To find relevant information, a numerical representation of your question (not its text) is searched against our knowledge base, hosted by Pinecone.</>}
              basis={<>You send your question yourself to get an answer (section 7(a) of the DPDP Act).</>}
              kept={<>We don&apos;t store conversations. They stay in your browser tab and are gone when you close it. OpenAI may keep messages it receives through its API for up to 30 days to detect abuse, and then deletes them; it doesn&apos;t use them to train its models.</>}
            />

            <Activity
              title="d. Website analytics, only with your consent"
              data={
                <>
                  If you click <strong>Accept</strong> on our cookie banner, Google Analytics records the pages you
                  visit and how you arrived, how far you scroll, the links and buttons you click, your device type,
                  browser and screen size, your approximate location (country or city), and how quickly pages load for
                  you. It doesn&apos;t store your IP address. We haven&apos;t turned on Google signals or any
                  advertising features.
                </>
              }
              purpose={<>To understand how the website is used, which content is useful, and which pages are slow, so we can improve it. We don&apos;t use analytics to identify you.</>}
              basis={<>Your consent. If you click <strong>Decline</strong>, or don&apos;t choose, Google Analytics isn&apos;t loaded at all.</>}
              kept={<>14 months, after which Google deletes it automatically. If you withdraw consent, collection stops straight away.</>}
            />

            <Activity
              title="e. Technical data needed to run the website"
              data={<>Your IP address, browser and device details, the page requested and the time, which your browser sends with every visit to any website. To prevent abuse, the contact form and the chatbot also count requests per IP address.</>}
              purpose={<>To show you the website, keep it secure, prevent misuse (such as spam or automated attacks), investigate problems, and meet our legal obligations.</>}
              basis={<>Processing that is necessary to provide the website you asked for, to protect it, and to comply with Indian law, including the security requirements of the DPDP Rules and directions of CERT-In (section 7 of the DPDP Act).</>}
              kept={<>The request counters are held in memory and discarded within a day. Server and security logs are kept by our hosting provider for up to one year, or longer only where the law requires it, and then deleted.</>}
            />

            <Activity
              title="f. Your preferences"
              data={<>Whether you accepted or declined analytics, and the language you picked in the header.</>}
              purpose={<>So we don&apos;t ask about cookies on every page, and show the website in the language you chose.</>}
              basis={<>Necessary to respect the choices you make on the website.</>}
              kept={<>See the table in <a href="#cookies" className={link}>section 5</a>.</>}
            />

            <Activity
              title="g. Videos and maps from Google"
              data={<>When a YouTube video plays, or the map on the Contact page loads, your browser connects to Google, which receives your IP address and browser details.</>}
              purpose={<>To show our videos and our location.</>}
              basis={<>YouTube videos use YouTube&apos;s privacy-enhanced mode and only load when you press play. Google handles this data under its own <External href="https://policies.google.com/privacy">privacy policy</External>.</>}
              kept={<>We don&apos;t receive or keep this data.</>}
            />

            <p className="mt-6">
              We don&apos;t make decisions about you based solely on automated processing, and we don&apos;t sell,
              rent or trade personal data.
            </p>

            <h2 id="consent" className={h2}>4. Consent and how to withdraw it</h2>
            <p>
              Where we rely on your consent (today, only for analytics), we ask for it clearly and separately, with a
              link to this policy, before any data is collected. Consent is never a condition for using the website.
            </p>
            <p className="mt-3">
              You can withdraw consent as easily as you gave it: click <strong>Cookie settings</strong> at the bottom
              of any page and choose <strong>Decline</strong>. We then delete the Google Analytics cookies and stop
              collecting analytics. Withdrawing doesn&apos;t affect processing that happened before, and it doesn&apos;t
              change how the rest of the website works for you. You may also manage consent through a Consent Manager
              registered with the Board, once such services are available.
            </p>

            <h2 id="cookies" className={h2}>5. Cookies and browser storage</h2>
            <p className="mb-4">
              Cookies are small files a website stores in your browser. We use as few as possible:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200">
                <thead className="bg-slate-50 text-brand-navy">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Purpose</th>
                    <th className={th}>Kept for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${td} font-mono`}>_ga</td>
                    <td className={td}>Google Analytics: tells visits from the same browser apart. Only after you accept.</td>
                    <td className={td}>2 years</td>
                  </tr>
                  <tr>
                    <td className={`${td} font-mono`}>{sessionCookie}</td>
                    <td className={td}>Google Analytics: keeps track of the current visit. Only after you accept.</td>
                    <td className={td}>2 years</td>
                  </tr>
                  <tr>
                    <td className={`${td} font-mono`}>lang</td>
                    <td className={td}>Remembers the language you picked (English, Kannada or Hindi), so we don&apos;t switch you to your browser&apos;s language. Only after you pick one.</td>
                    <td className={td}>1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 align-top font-mono">chemlife-analytics-consent</td>
                    <td className="p-3 align-top">Local storage, not a cookie: remembers whether you accepted or declined analytics.</td>
                    <td className="p-3 align-top">Until you clear your browser data</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              You can also block Google Analytics on all websites with Google&apos;s{" "}
              <External href="https://tools.google.com/dlpage/gaoptout">opt-out browser add-on</External>, or clear
              and block cookies in your browser settings.
            </p>

            <h2 id="sharing" className={h2}>6. Who we share data with</h2>
            <p className="mb-3">
              We share personal data only with the service providers below, each for the purpose stated, and under
              terms that require them to protect it:
            </p>
            <ul className={list}>
              <li>
                <strong>Hostinger</strong> hosts the website and keeps its server logs:{" "}
                <External href="https://www.hostinger.com/legal/privacy-policy">privacy policy</External>.
              </li>
              <li>
                <strong>Resend</strong> delivers contact form messages to our inbox:{" "}
                <External href="https://resend.com/legal/privacy-policy">privacy policy</External>.
              </li>
              <li>
                <strong>Google Workspace</strong> hosts our email, where enquiries and applications are received:{" "}
                <External href="https://policies.google.com/privacy">privacy policy</External>.
              </li>
              <li>
                <strong>OpenAI</strong> and <strong>Pinecone</strong> power the chatbots:{" "}
                <External href="https://openai.com/policies/privacy-policy/">OpenAI privacy policy</External>,{" "}
                <External href="https://www.pinecone.io/privacy/">Pinecone privacy policy</External>.
              </li>
              <li>
                <strong>Google Analytics</strong> (Google LLC), only with your consent:{" "}
                <External href="https://policies.google.com/technologies/partner-sites">how Google uses data from sites that use its services</External>.
              </li>
            </ul>
            <p className="mt-3">We may also disclose personal data:</p>
            <ul className={`${list} mt-2`}>
              <li>to our professional advisers, such as lawyers and auditors, under a duty of confidentiality;</li>
              <li>when the law requires it, for example to a court, the Board, or a government authority acting lawfully;</li>
              <li>to protect the rights, property or safety of ChemLife, our users or others, as the law allows;</li>
              <li>to a buyer or successor if our business is merged, sold or restructured, who must then protect it as this policy describes.</li>
            </ul>
            <p className="mt-3">
              Links to other websites, such as LinkedIn, WordPress or Google Reviews, take you to services that have
              their own privacy policies.
            </p>

            <h2 id="outside-india" className={h2}>7. Data processed outside India</h2>
            <p>
              Some of our service providers store or process data outside India, mainly in the United States. The DPDP
              Act allows this, except to countries the Government of India restricts by notification. We don&apos;t
              transfer personal data to any restricted country, and we follow any conditions the Government sets for
              such transfers.
            </p>

            <h2 id="retention" className={h2}>8. How long we keep data</h2>
            <p>
              We keep personal data only for as long as the purpose it was collected for needs it, using the periods
              in <a href="#what-we-collect" className={link}>section 3</a>. We then erase it, and ask our Data
              Processors to erase it, unless a law requires us to keep it longer. If you withdraw consent or ask us to
              erase your data, we do so unless the law requires us to keep it.
            </p>

            <h2 id="security" className={h2}>9. How we protect data</h2>
            <p className="mb-3">We take reasonable security safeguards to prevent personal data breaches, including:</p>
            <ul className={list}>
              <li>encrypting all traffic to and from the website with HTTPS;</li>
              <li>limiting access to personal data to the people at ChemLife who need it to do their work;</li>
              <li>using reputable service providers bound by contract to protect the data they process for us;</li>
              <li>keeping logs that let us detect, investigate and fix unauthorised access;</li>
              <li>rate limits and other protections against spam and automated attacks.</li>
            </ul>
            <p className="mt-3">No system is completely secure, but we review these measures and improve them over time.</p>

            <h2 id="breach" className={h2}>10. If there is a data breach</h2>
            <p>
              If a breach affects your personal data, we will tell you without delay, in plain language: what happened,
              the likely consequences for you, what we are doing about it, what you can do to protect yourself, and who
              to contact. We will also report it to the Board, as the DPDP Act and Rules require.
            </p>

            <h2 id="rights" className={h2}>11. Your rights</h2>
            <p className="mb-3">Under the DPDP Act, you have the right to:</p>
            <ul className={list}>
              <li>
                <strong>Access information</strong>: a summary of the personal data we hold about you and how we
                process it, and the identities of the other Data Fiduciaries and Data Processors we have shared it
                with, along with a description of what was shared.
              </li>
              <li>
                <strong>Correction, completion, updating and erasure</strong>: have inaccurate or incomplete data
                corrected or completed, have it updated, and have data erased when it&apos;s no longer needed, unless
                the law requires us to keep it.
              </li>
              <li>
                <strong>Withdraw consent</strong> at any time, where we rely on it (see{" "}
                <a href="#consent" className={link}>section 4</a>).
              </li>
              <li>
                <strong>Grievance redressal</strong>: complain to us about anything we do with your data, and get an
                answer (see <a href="#requests" className={link}>section 12</a>).
              </li>
              <li>
                <strong>Nominate</strong> someone to exercise these rights for you if you die or become unable to do
                so.
              </li>
            </ul>
            <p className="mt-3">Exercising your rights is free.</p>

            <h2 id="requests" className={h2}>12. Requests, complaints and our Grievance Officer</h2>
            <p>
              To exercise any of your rights, or to raise a concern or complaint, contact our Grievance Officer:
            </p>
            <address className="not-italic mt-3 rounded-xl border border-slate-200 p-5">
              <strong className="text-brand-navy">Grievance Officer, ChemLife Innovations Pvt Ltd</strong>
              <br />
              Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru 561 203,
              Karnataka, India
              <br />
              Email: <Mail />
              <br />
              Phone: {PHONE}
            </address>
            <ul className={`${list} mt-4`}>
              <li>
                Please tell us what you&apos;d like us to do, and give enough detail for us to find your data, such as
                the email address you used. Writing &ldquo;Data request&rdquo; in the subject line helps it reach the
                right person.
              </li>
              <li>
                We may ask you to confirm your identity before acting on a request, so we don&apos;t disclose or erase
                someone else&apos;s data. If someone else makes a request for you, we may ask for proof they&apos;re
                allowed to.
              </li>
              <li>
                We will acknowledge your request promptly, aim to resolve it within 30 days, and in any case respond
                within 90 days, as the DPDP Rules require.
              </li>
              <li>
                If you aren&apos;t satisfied with our response, you can complain to the Data Protection Board of India,
                after first raising it with us.
              </li>
            </ul>

            <h2 id="duties" className={h2}>13. Your duties</h2>
            <p>
              The DPDP Act also asks you to give us accurate information, not to impersonate anyone else, not to
              suppress material information when giving us your data, and not to make false or frivolous complaints to
              us or the Board.
            </p>

            <h2 id="children" className={h2}>14. Children and people with disabilities</h2>
            <p>
              This website is meant for farmers, feed manufacturers and professionals in animal agriculture, and is
              not directed at children (anyone under 18). We don&apos;t knowingly collect personal data from children,
              and we don&apos;t track, monitor the behaviour of, or target advertising at children. If you are under
              18, please don&apos;t send us personal data without your parent or guardian. If you believe a child has
              given us personal data, contact us and we will erase it.
            </p>
            <p className="mt-3">
              A lawful guardian of a person with a disability may exercise that person&apos;s rights under this
              policy on their behalf.
            </p>

            <h2 id="language" className={h2}>15. Other languages</h2>
            <p>
              You may ask for this policy in Kannada, Hindi or any other language listed in the Eighth Schedule to the
              Constitution of India by writing to <Mail />, and we will provide it.
            </p>

            <h2 id="outside" className={h2}>16. Visitors from outside India</h2>
            <p>
              We are based in India and this policy follows Indian law. If you are in the European Union or the United
              Kingdom, you may also have rights under the GDPR, including to object to processing and to complain to
              your local data protection authority. Contact us and we will help.
            </p>

            <h2 id="changes" className={h2}>17. Changes to this policy</h2>
            <p>
              If we change how we use personal data, we will update this page and the date at the top. If a change
              affects processing that relies on your consent, we will ask for your consent again before it applies.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </VariantProvider>
  );
}
