import type { Program } from './types';

export const programs: Program[] = [
  {
    slug: { en: 'mbbs', hi: 'mbbs' },
    title: { en: 'MBBS', hi: 'एमबीबीएस' },
    level: 'undergraduate',
    duration: { en: '5.5 years (incl. internship)', hi: '5.5 वर्ष (इंटर्नशिप सहित)' },
    intake: 100,
    eligibility: {
      en: [
        'NEET-UG qualified',
        'Class 12 with Physics, Chemistry, Biology and English (50%)',
        'Minimum age 17 by 31 December of the admission year',
      ],
      hi: [
        'NEET-UG उत्तीर्ण',
        'भौतिकी, रसायन, जीवविज्ञान, अंग्रेज़ी के साथ कक्षा 12 (50%)',
        'प्रवेश वर्ष की 31 दिसंबर तक न्यूनतम 17 वर्ष की आयु',
      ],
    },
    feeIndicative: {
      en: 'Fee structure published by the State Counselling Authority',
      hi: 'राज्य परामर्श प्राधिकरण द्वारा प्रकाशित शुल्क संरचना',
    },
    accreditation: 'NMC',
    summary: {
      en: 'A five-and-a-half-year undergraduate medical degree, including a one-year compulsory rotating internship across our clinical departments.',
      hi: 'साढ़े पाँच वर्ष का स्नातक चिकित्सा कोर्स, जिसमें हमारे नैदानिक विभागों में एक वर्ष की अनिवार्य रोटेटिंग इंटर्नशिप शामिल है।',
    },
  },
  {
    slug: { en: 'pg-obstetrics-gynecology', hi: 'pg-prasuti-evam-stri-rog' },
    title: { en: 'MD / MS — Obstetrics & Gynaecology', hi: 'एमडी / एमएस — प्रसूति और स्त्री रोग' },
    level: 'postgraduate',
    duration: { en: '3 years', hi: '3 वर्ष' },
    intake: 6,
    eligibility: {
      en: ['MBBS from a recognised institution', 'NEET-PG qualified', 'Internship completed'],
      hi: [
        'मान्यता प्राप्त संस्थान से एमबीबीएस',
        'NEET-PG उत्तीर्ण',
        'इंटर्नशिप पूर्ण',
      ],
    },
    feeIndicative: { en: 'As per state counselling', hi: 'राज्य परामर्श के अनुसार' },
    accreditation: 'NMC',
    summary: {
      en: 'A three-year postgraduate residency at our high-volume obstetrics, gynaecology, and IVF service.',
      hi: 'हमारी उच्च-मात्रा प्रसूति, स्त्री रोग और आईवीएफ सेवा में तीन वर्ष की स्नातकोत्तर रेज़िडेंसी।',
    },
  },
  {
    slug: { en: 'fellowship-fogsi-infertility', hi: 'fellowship-fogsi-banjhpan' },
    title: { en: 'FOGSI Fellowship in Infertility', hi: 'FOGSI बाँझपन फ़ेलोशिप' },
    level: 'fellowship',
    duration: { en: '4 weeks (didactic + hands-on)', hi: '4 सप्ताह (व्याख्यान + हस्त-प्रयोग)' },
    intake: 4,
    eligibility: {
      en: ['MD / DGO / DNB in Obstetrics & Gynaecology', 'Active practice in reproductive medicine'],
      hi: [
        'प्रसूति और स्त्री रोग में एमडी / डीजीओ / डीएनबी',
        'प्रजनन चिकित्सा में सक्रिय अभ्यास',
      ],
    },
    feeIndicative: {
      en: 'Published per cohort; tuition includes course materials',
      hi: 'प्रति बैच प्रकाशित; शुल्क में पाठ्य सामग्री शामिल है',
    },
    accreditation: 'FOGSI',
    summary: {
      en: 'A FOGSI-recognised hands-on fellowship in IUI, IVF, ICSI, ovulation induction, hysteroscopy, and ovarian reserve assessment, supervised by Dr. Vimlesh Sharma.',
      hi: 'IUI, IVF, ICSI, ओव्यूलेशन इंडक्शन, हिस्टेरोस्कोपी और डिम्बग्रंथि रिज़र्व मूल्यांकन में FOGSI-मान्यता प्राप्त हस्त-प्रयोग फ़ेलोशिप, डॉ. विमलेश शर्मा के पर्यवेक्षण में।',
    },
  },
  {
    slug: { en: 'gnm-nursing', hi: 'gnm-nursing' },
    title: { en: 'GNM — General Nursing & Midwifery', hi: 'जीएनएम — सामान्य नर्सिंग और मिडवाइफ़री' },
    level: 'paramedical',
    duration: { en: '3 years + internship', hi: '3 वर्ष + इंटर्नशिप' },
    intake: 60,
    eligibility: {
      en: [
        'Class 12 with English (40%)',
        'Female and male candidates eligible',
        'Age 17–35 at the time of admission',
      ],
      hi: [
        'अंग्रेज़ी के साथ कक्षा 12 (40%)',
        'महिला और पुरुष दोनों पात्र',
        'प्रवेश के समय आयु 17–35',
      ],
    },
    feeIndicative: { en: 'Published in the prospectus', hi: 'प्रॉस्पेक्टस में प्रकाशित' },
    accreditation: 'INC',
    summary: {
      en: 'A three-year nursing diploma with a one-year clinical internship across the hospital, recognised by the Indian Nursing Council.',
      hi: 'अस्पताल में एक वर्ष की नैदानिक इंटर्नशिप के साथ तीन वर्ष का नर्सिंग डिप्लोमा, भारतीय नर्सिंग परिषद द्वारा मान्यता प्राप्त।',
    },
  },
];

export function getProgram(enSlug: string): Program | undefined {
  return programs.find((p) => p.slug.en === enSlug);
}
