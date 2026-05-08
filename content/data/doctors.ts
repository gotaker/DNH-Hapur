import type { Doctor } from './types';

/**
 * Doctors are seeded from the public roster on dnhhapur.com. Bilingual
 * names are transliterated; final spellings should be reviewed by the
 * institution before launch.
 */
export const doctors: Doctor[] = [
  {
    slug: 'vimlesh-sharma',
    name: { en: 'Dr. Vimlesh Sharma', hi: 'डॉ. विमलेश शर्मा' },
    qualifications: 'MBBS, MD (Obs & Gyn), FOGSI-accredited',
    specialty: { en: 'IVF and Reproductive Medicine', hi: 'आईवीएफ और प्रजनन चिकित्सा' },
    departments: ['ivf', 'obstetrics-gynecology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Mon–Sat, 10:00–14:00', hi: 'सोम–शनि, 10:00–14:00' },
    bio: {
      en: 'Dr. Vimlesh Sharma leads the FOGSI-recognised infertility centre at Dev Nandini Hospital and supervises the institution\u2019s infertility training course.',
      hi: 'डॉ. विमलेश शर्मा देव नंदिनी अस्पताल के FOGSI-मान्यता प्राप्त बाँझपन केंद्र का नेतृत्व करती हैं और संस्थान के बाँझपन प्रशिक्षण पाठ्यक्रम का पर्यवेक्षण करती हैं।',
    },
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'sanjay-rai',
    name: { en: 'Dr. Sanjay Rai', hi: 'डॉ. संजय राय' },
    qualifications: 'MBBS, MS, MCh (Neurosurgery)',
    specialty: { en: 'Neurosurgery', hi: 'न्यूरोसर्जरी' },
    departments: ['neurosurgery'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Tue, Thu, Sat — 11:00–14:00', hi: 'मंगल, गुरु, शनि — 11:00–14:00' },
    bio: {
      en: 'Dr. Sanjay Rai performs cranial and spinal neurosurgery and leads the institution\u2019s acute stroke pathway.',
      hi: 'डॉ. संजय राय क्रेनियल और स्पाइनल न्यूरोसर्जरी करते हैं और संस्थान के तीव्र स्ट्रोक मार्ग का नेतृत्व करते हैं।',
    },
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'pramod-teotia',
    name: { en: 'Dr. Pramod Teotia', hi: 'डॉ. प्रमोद तेवतिया' },
    qualifications: 'MBBS, MD (Cardiology)',
    specialty: { en: 'Cardiology', hi: 'हृदय रोग' },
    departments: ['cardiology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Mon–Fri, 09:30–13:30', hi: 'सोम–शुक्र, 09:30–13:30' },
    bio: {
      en: 'Consultant cardiologist with a focus on coronary intervention and heart-failure management.',
      hi: 'कोरोनरी हस्तक्षेप और हृदय विफलता प्रबंधन पर ध्यान केंद्रित करने वाले परामर्शदाता हृदय रोग विशेषज्ञ।',
    },
  },
  {
    slug: 'shuchi-taneja',
    name: { en: 'Dr. Shuchi Taneja', hi: 'डॉ. शुचि तनेजा' },
    qualifications: 'MBBS, MD (Paediatrics), Fellowship in Neonatology',
    specialty: { en: 'Neonatology and Paediatrics', hi: 'नवजात विज्ञान और बाल रोग' },
    departments: ['nicu'],
    languages: { en: ['Hindi', 'English', 'Punjabi'], hi: ['हिन्दी', 'अंग्रेज़ी', 'पंजाबी'] },
    opdDays: { en: 'Mon–Sat, 10:30–13:00', hi: 'सोम–शनि, 10:30–13:00' },
    bio: {
      en: 'Heads the Level-III neonatal intensive care unit and the developmental follow-up clinic.',
      hi: 'लेवल-III नवजात गहन देखभाल इकाई और विकासात्मक अनुवर्ती क्लीनिक का नेतृत्व करती हैं।',
    },
  },
  {
    slug: 'sp-singh',
    name: { en: 'Dr. S. P. Singh', hi: 'डॉ. एस. पी. सिंह' },
    qualifications: 'MBBS, MS (Orthopaedics)',
    specialty: { en: 'Joint Replacement and Trauma', hi: 'जोड़ प्रत्यारोपण और आघात' },
    departments: ['joint-replacement', 'orthopaedics'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Tue, Wed, Fri — 11:00–14:00', hi: 'मंगल, बुध, शुक्र — 11:00–14:00' },
    bio: {
      en: 'Senior orthopaedic surgeon focused on knee and hip replacement and trauma reconstruction.',
      hi: 'घुटने और कूल्हे के प्रत्यारोपण और आघात पुनर्निर्माण पर केंद्रित वरिष्ठ आर्थोपेडिक सर्जन।',
    },
  },
  {
    slug: 'jeevotam-narang',
    name: { en: 'Dr. Jeevotam Narang', hi: 'डॉ. जीवोत्तम नारंग' },
    qualifications: 'MBBS, MS (General Surgery)',
    specialty: { en: 'General and Laparoscopic Surgery', hi: 'सामान्य और लेप्रोस्कोपिक शल्य चिकित्सा' },
    departments: ['general-surgery'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Mon, Wed, Fri — 10:00–14:00', hi: 'सोम, बुध, शुक्र — 10:00–14:00' },
    bio: {
      en: 'General and laparoscopic surgeon with high-volume experience in cholecystectomy and hernia repair.',
      hi: 'पित्ताशय शल्य चिकित्सा और हर्निया मरम्मत में उच्च-मात्रा के अनुभव के साथ सामान्य और लेप्रोस्कोपिक सर्जन।',
    },
  },
  {
    slug: 'hariom-singh',
    name: { en: 'Dr. Hariom Singh', hi: 'डॉ. हरिओम सिंह' },
    qualifications: 'MBBS, MD (Internal Medicine)',
    specialty: { en: 'Internal Medicine', hi: 'आंतरिक चिकित्सा' },
    departments: ['general-surgery'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Daily, 09:00–13:00', hi: 'दैनिक, 09:00–13:00' },
    bio: {
      en: 'Internist with primary interests in diabetes, hypertension, and elderly care.',
      hi: 'मधुमेह, उच्च रक्तचाप और वृद्धावस्था देखभाल में मुख्य रुचि वाले आंतरिक चिकित्सक।',
    },
  },
  {
    slug: 'praveen-kumar',
    name: { en: 'Dr. Praveen Kumar', hi: 'डॉ. प्रवीण कुमार' },
    qualifications: 'MBBS, MS (Ophthalmology)',
    specialty: { en: 'Ophthalmology', hi: 'नेत्र रोग' },
    departments: ['ophthalmology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Mon–Sat, 11:00–13:30', hi: 'सोम–शनि, 11:00–13:30' },
    bio: {
      en: 'Performs phacoemulsification cataract surgery and runs the diabetic retinopathy screening clinic.',
      hi: 'फेकोइमल्सीफिकेशन मोतियाबिंद शल्य चिकित्सा करते हैं और मधुमेह रेटिनोपैथी जाँच क्लीनिक चलाते हैं।',
    },
  },
  {
    slug: 'shiv-kumar',
    name: { en: 'Dr. Shiv Kumar', hi: 'डॉ. शिव कुमार' },
    qualifications: 'MBBS, MD (Dermatology)',
    specialty: { en: 'Dermatology', hi: 'त्वचा रोग' },
    departments: ['dermatology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Tue, Thu — 14:30–17:30', hi: 'मंगल, गुरु — 14:30–17:30' },
    bio: {
      en: 'Treats common and chronic skin conditions including eczema, psoriasis, and pigmentation.',
      hi: 'एक्जिमा, सोरायसिस और रंजकता सहित सामान्य और दीर्घकालिक त्वचा स्थितियों का उपचार करते हैं।',
    },
  },
  {
    slug: 'shyam-kumar',
    name: { en: 'Dr. Shyam Kumar', hi: 'डॉ. श्याम कुमार' },
    qualifications: 'MBBS, MD (Gastroenterology)',
    specialty: { en: 'Gastroenterology', hi: 'जठर रोग' },
    departments: ['gastroenterology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Mon, Wed, Fri — 10:30–13:30', hi: 'सोम, बुध, शुक्र — 10:30–13:30' },
    bio: {
      en: 'Performs diagnostic and therapeutic upper GI endoscopy, colonoscopy, and ERCP.',
      hi: 'निदान और उपचारात्मक अपर जीआई एंडोस्कोपी, कोलोनोस्कोपी और ERCP करते हैं।',
    },
  },
  {
    slug: 'saroo-singh',
    name: { en: 'Dr. Saroo Singh', hi: 'डॉ. सरू सिंह' },
    qualifications: 'MBBS, MD (Obs & Gyn)',
    specialty: { en: 'Obstetrics and Gynaecology', hi: 'प्रसूति और स्त्री रोग' },
    departments: ['obstetrics-gynecology'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'Daily, 11:00–14:00', hi: 'दैनिक, 11:00–14:00' },
    bio: {
      en: 'High-risk pregnancy specialist with a focus on painless delivery and adolescent gynaecology.',
      hi: 'दर्द-रहित प्रसव और किशोर स्त्री रोग पर ध्यान केंद्रित करने वाली उच्च-जोखिम गर्भावस्था विशेषज्ञ।',
    },
  },
  {
    slug: 'anubhav-kirtikar',
    name: { en: 'Dr. Anubhav Kirtikar', hi: 'डॉ. अनुभव कीर्तिकर' },
    qualifications: 'MBBS, MD (Anaesthesiology), IDCC (Critical Care)',
    specialty: { en: 'Critical Care and Anaesthesia', hi: 'गहन देखभाल और एनेस्थीसिया' },
    departments: ['general-surgery'],
    languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
    opdDays: { en: 'On-call, 24x7 ICU', hi: 'ऑन-कॉल, 24x7 आईसीयू' },
    bio: {
      en: 'Heads the multi-disciplinary intensive care unit and the institutional sepsis pathway.',
      hi: 'बहु-विषयक गहन देखभाल इकाई और संस्थागत सेप्सिस मार्ग का नेतृत्व करते हैं।',
    },
  },
];

export function getDoctor(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug);
}

export function getDoctorsByDepartment(departmentEnSlug: string): Doctor[] {
  return doctors.filter((d) => d.departments.includes(departmentEnSlug));
}
