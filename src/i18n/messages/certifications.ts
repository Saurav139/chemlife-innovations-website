// Text of the Certificates section (home.certifications), shared by every language file for now: it is English
// only until the section goes on the homepage, when each language gets its own translation.
//
// Every number, date, name and scope below is copied from the certificates themselves (the pictures in
// public/images/certifications). Check them against a new certificate whenever one is renewed.
// Items are in the order of the cards (certificateCards in components/Certifications.tsx).
export const certifications = {
  kicker: "Quality & Compliance",
  title: "Our Certificates",
  intro: "Our Doddaballapura plant is independently audited. Here is what each certificate covers, with the certificate itself to read.",
  view: "View certificate",
  close: "Close",
  items: [
    {
      name: "FAMI-QS Certified",
      issuer: "Certified by Swiss Cert Pvt. Ltd.",
      summary:
        "A Feed Safety and Quality Management System, including Good Manufacturing Practice (GMP), for the specialty feed ingredients we make.",
      facts: [
        { label: "Scope", value: "Production of Specialty Feed Ingredients from Chemical & Mixing Processes. Feed chain Category K." },
        { label: "Standard", value: "FAMI-QS Code (Version 6, 2018-10-02), with the FAMI-QS Feed Fraud Prevention and Defense Module Version 1." },
        { label: "Certificate number", value: "510047 (Rev. No: 00)" },
        { label: "FAMI-QS registration number", value: "FAM-1980" },
        { label: "Valid", value: "10 October 2025 to 9 October 2028" },
        { label: "First certified", value: "10 October 2022" },
        { label: "Site", value: "Plot No 18, 3rd Phase, KIADB Industrial Area, Obadenahalli, Doddaballapur, Bangalore Rural Dist. - 561 203, Karnataka, India" },
      ],
      note: "Valid subject to satisfactory completion of surveillance audits. Its validity can be checked at www.fami-qs.org.",
      listTitle: "Ingredients and mixtures covered",
      list: [
        "Chromium Chelate of Hydroxy Amino Acid",
        "Cobalt Chelate of Hydroxy Amino Acid",
        "Ferrous Chelate of Hydroxy & Amino Acids",
        "Chromium Chelate of Nicotinic Acid",
        "Copper Chelate of Hydroxy & Amino Acids",
        "Copper Chelate of Protein Hydrolysate",
        "Ferrous Chelate of Protein Hydrolysate",
        "Manganese Chelate of Hydroxy & Amino Acids",
        "Manganese Chelate of Protein Hydrolysate",
        "Oxine Copper",
        "Selenium Complex of Hydroxyl Amino Acid",
        "Selenium Complex of Protein Hydrolysate",
        "Zinc Chelate of Hydroxy & Amino Acids",
        "Zinc Chelate of Protein Hydrolysate",
        "Mixtures (Functionality: Technological, Nutritional, Zootechnical)",
      ],
      marksLabel: "Certification body",
      marks: ["Swiss Cert"],
      imageAlt: "FAMI-QS certificate issued to ChemLife Innovations Pvt. Ltd. by Swiss Cert Pvt. Ltd., certificate number 510047",
    },
    {
      name: "Halal Registration Certificate",
      issuer: "Issued by Jamiat Ulama-i-Hind Halal Trust, New Delhi",
      summary:
        "Our plant was inspected and assessed by Jamiat Ulama-i-Hind Halal Trust and found to comply with Halal requirements.",
      facts: [
        { label: "Scope", value: "Category-K: Feed Genie Forte & Feed Genie." },
        { label: "Standard", value: "JUHT Scheme SCH-I, as per GSO/UAE.S 2055-1-2015, MS 1500-2019 and HAS-23000-1 Halal Standards." },
        { label: "Registration number", value: "2798" },
        { label: "Reference number", value: "JUHHT/2025/08/2798" },
        { label: "Valid", value: "12 August 2025 to 11 August 2028" },
        { label: "Issued", value: "12 August 2025" },
        { label: "Plant", value: "Plot No. 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Bengaluru Rural District - 561203, Karnataka, India" },
      ],
      note: "Subject to annual audits and importing countries' approval.",
      listTitle: "",
      list: [] as string[],
      marksLabel: "Accreditation marks on the certificate",
      marks: [
        "Emirates International Accreditation Centre (EIAC), HBN-016",
        "GCC Accreditation Center (GAC), Halal, GSO 2055-2:2021, HPC 0051",
        "Saudi Halal Center",
      ],
      imageAlt: "Halal Registration Certificate issued to Chemlife Innovations Pvt. Ltd. by Jamiat Ulama-i-Hind Halal Trust, registration number 2798",
    },
  ],
};
