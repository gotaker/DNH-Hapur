import type { Department } from './types';

export const departments: Department[] = [
  {
    slug: { en: 'cardiology', hi: 'hridya-rog-vibhag' },
    name: { en: 'Cardiology', hi: 'हृदय रोग विभाग' },
    summary: {
      en: 'Round-the-clock cardiac care from outpatient consultation to interventional procedures and emergency cardiac care.',
      hi: 'बाह्य रोगी परामर्श से लेकर हस्तक्षेपकारी प्रक्रियाओं और आपातकालीन हृदय देखभाल तक चौबीसों घंटे हृदय देखभाल।',
    },
    services: {
      en: [
        'Echocardiography and stress test',
        'Holter and ABPM monitoring',
        'Coronary angiography',
        'Pacemaker implantation',
        '24x7 cardiac emergency',
      ],
      hi: [
        'इकोकार्डियोग्राफी और स्ट्रेस टेस्ट',
        'होल्टर और ABPM मॉनिटरिंग',
        'कोरोनरी एंजियोग्राफी',
        'पेसमेकर प्रत्यारोपण',
        '24x7 हृदय आपातकाल',
      ],
    },
    isCenter: true,
    image:
      'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1400&q=80',
  },
  {
    slug: { en: 'neurosurgery', hi: 'nyuro-sarjari' },
    name: { en: 'Neurosurgery', hi: 'न्यूरोसर्जरी' },
    summary: {
      en: 'A super-specialty unit for surgical management of brain, spine, and peripheral nerve disorders, with in-house critical care.',
      hi: 'मस्तिष्क, रीढ़ और परिधीय तंत्रिका विकारों के शल्य प्रबंधन के लिए एक सुपर-स्पेशियलिटी इकाई, इन-हाउस गहन देखभाल के साथ।',
    },
    services: {
      en: [
        'Cranial trauma management',
        'Brain tumor surgery',
        'Spine surgery, including minimally invasive',
        'Hydrocephalus and shunt procedures',
        'Stroke care pathway',
      ],
      hi: [
        'क्रेनियल आघात प्रबंधन',
        'ब्रेन ट्यूमर सर्जरी',
        'रीढ़ की सर्जरी, न्यूनतम आक्रामक सहित',
        'हाइड्रोसिफ़लस और शंट प्रक्रियाएँ',
        'स्ट्रोक देखभाल मार्ग',
      ],
    },
    isCenter: true,
    image:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1400&q=80',
  },
  {
    slug: { en: 'ivf', hi: 'ivf-aur-prajanan-chikitsa' },
    name: { en: 'IVF & Reproductive Medicine', hi: 'आईवीएफ और प्रजनन चिकित्सा' },
    summary: {
      en: 'A FOGSI-recognised infertility centre offering the full continuum from diagnosis to assisted reproduction, led by Dr. Vimlesh Sharma.',
      hi: 'FOGSI-मान्यता प्राप्त बाँझपन केंद्र, निदान से लेकर सहायक प्रजनन तक की संपूर्ण देखभाल, डॉ. विमलेश शर्मा के नेतृत्व में।',
    },
    services: {
      en: [
        'In-vitro fertilization (IVF) and ICSI',
        'Intrauterine insemination (IUI)',
        'Ovulation induction',
        'Hysteroscopy and laparoscopy',
        'Andrology and semen analysis',
      ],
      hi: [
        'आईवीएफ और आईसीएसआई',
        'अंतर्गर्भाशय वीर्यसेचन (आईयूआई)',
        'ओव्यूलेशन इंडक्शन',
        'हिस्टेरोस्कोपी और लेप्रोस्कोपी',
        'एंड्रोलॉजी और वीर्य विश्लेषण',
      ],
    },
    isCenter: true,
    image:
      'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    slug: { en: 'nicu', hi: 'navjat-shishu-icu' },
    name: { en: 'NICU', hi: 'नवजात शिशु आईसीयू' },
    summary: {
      en: 'A Level-III neonatal intensive care unit caring for premature, low-birth-weight, and critically ill newborns with dedicated neonatology cover.',
      hi: 'समय से पहले जन्मे, कम वजन वाले और गंभीर रूप से बीमार नवजात शिशुओं की देखभाल के लिए लेवल-III नवजात गहन देखभाल इकाई।',
    },
    services: {
      en: [
        'Mechanical ventilation and CPAP',
        'Phototherapy and exchange transfusion',
        'Kangaroo mother care',
        'Developmental follow-up clinic',
        'Hearing and ROP screening',
      ],
      hi: [
        'यांत्रिक वेंटीलेशन और CPAP',
        'फोटोथेरेपी और एक्सचेंज ट्रांसफ्यूजन',
        'कंगारू मदर केयर',
        'विकासात्मक अनुवर्ती क्लीनिक',
        'श्रवण और ROP जाँच',
      ],
    },
    isCenter: true,
    image:
      'https://images.unsplash.com/photo-1518085250887-2f903c200fee?auto=format&fit=crop&w=1400&q=80',
  },
  {
    slug: { en: 'joint-replacement', hi: 'jod-pratyaropan' },
    name: { en: 'Joint Replacement', hi: 'जोड़ प्रत्यारोपण' },
    summary: {
      en: 'A high-volume joint replacement service for hip, knee, and shoulder, supported by laminar-flow theatres and an in-house rehabilitation studio.',
      hi: 'कूल्हे, घुटने और कंधे के लिए उच्च-मात्रा जोड़ प्रत्यारोपण सेवा, लैमिनार-फ्लो ओटी और इन-हाउस पुनर्वास के साथ।',
    },
    services: {
      en: [
        'Total knee replacement',
        'Total hip replacement',
        'Revision arthroplasty',
        'Sports injury and arthroscopy',
        'Post-surgical physiotherapy',
      ],
      hi: [
        'टोटल नी रिप्लेसमेंट',
        'टोटल हिप रिप्लेसमेंट',
        'पुनरीक्षण आर्थ्रोप्लास्टी',
        'स्पोर्ट्स इंजरी और आर्थ्रोस्कोपी',
        'सर्जरी के बाद फिजियोथेरेपी',
      ],
    },
    isCenter: true,
    image:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1400&q=80',
  },
  {
    slug: { en: 'gastroenterology', hi: 'jathar-rog-vibhag' },
    name: { en: 'Gastroenterology', hi: 'जठर रोग विभाग' },
    summary: {
      en: 'Diagnostic and therapeutic endoscopy alongside medical and surgical management of liver, pancreas, and bowel disorders.',
      hi: 'यकृत, अग्न्याशय और आँतों के विकारों के चिकित्सकीय और शल्य प्रबंधन के साथ निदान और उपचारात्मक एंडोस्कोपी।',
    },
    services: {
      en: [
        'Upper GI endoscopy and colonoscopy',
        'ERCP',
        'Hepatology clinic',
        'IBD clinic',
        'Capsule endoscopy',
      ],
      hi: [
        'अपर जीआई एंडोस्कोपी और कोलोनोस्कोपी',
        'ERCP',
        'हेपेटोलॉजी क्लीनिक',
        'IBD क्लीनिक',
        'कैप्सूल एंडोस्कोपी',
      ],
    },
  },
  {
    slug: { en: 'obstetrics-gynecology', hi: 'prasuti-evam-stri-rog' },
    name: { en: 'Obstetrics & Gynaecology', hi: 'प्रसूति एवं स्त्री रोग' },
    summary: {
      en: 'A complete maternal, foetal, and gynaecologic service. High-risk pregnancy care, painless delivery, and adolescent gynaecology.',
      hi: 'पूर्ण मातृ, गर्भस्थ और स्त्री रोग सेवा। उच्च-जोखिम गर्भावस्था देखभाल, दर्द-रहित प्रसव और किशोर स्त्री रोग।',
    },
    services: {
      en: [
        'Antenatal and postnatal care',
        'Painless (epidural) delivery',
        'High-risk pregnancy clinic',
        'Laparoscopic gynaecology',
        'Adolescent gynaecology clinic',
      ],
      hi: [
        'प्रसवपूर्व और प्रसवोत्तर देखभाल',
        'दर्द-रहित (एपिड्यूरल) प्रसव',
        'उच्च-जोखिम गर्भावस्था क्लीनिक',
        'लेप्रोस्कोपिक स्त्री रोग',
        'किशोर स्त्री रोग क्लीनिक',
      ],
    },
  },
  {
    slug: { en: 'general-surgery', hi: 'samanya-shalya-chikitsa' },
    name: { en: 'General & Laparoscopic Surgery', hi: 'सामान्य और लेप्रोस्कोपिक शल्य चिकित्सा' },
    summary: {
      en: 'Open and minimally invasive surgery across the abdomen, breast, thyroid, and hernia, supported by 24x7 emergency theatres.',
      hi: 'पेट, स्तन, थायरॉइड और हर्निया की खुली और न्यूनतम आक्रामक शल्य चिकित्सा, 24x7 आपातकालीन ओटी के साथ।',
    },
    services: {
      en: [
        'Laparoscopic cholecystectomy',
        'Hernia repair',
        'Appendicectomy and intestinal surgery',
        'Breast surgery',
        'Thyroid surgery',
      ],
      hi: [
        'लेप्रोस्कोपिक पित्ताशय शल्य चिकित्सा',
        'हर्निया मरम्मत',
        'अपेंडेक्टॉमी और आँत शल्य चिकित्सा',
        'स्तन शल्य चिकित्सा',
        'थायरॉइड शल्य चिकित्सा',
      ],
    },
  },
  {
    slug: { en: 'orthopaedics', hi: 'asthi-rog-vibhag' },
    name: { en: 'Orthopaedics', hi: 'अस्थि रोग विभाग' },
    summary: {
      en: 'Trauma, fracture care, and elective orthopaedics with a dedicated joint replacement and arthroscopy practice.',
      hi: 'आघात, फ्रैक्चर देखभाल और वैकल्पिक हड्डी रोग, समर्पित जोड़ प्रत्यारोपण और आर्थ्रोस्कोपी के साथ।',
    },
    services: {
      en: [
        'Fracture and trauma management',
        'Spine surgery',
        'Sports medicine',
        'Paediatric orthopaedics',
        'Geriatric fragility fractures',
      ],
      hi: [
        'फ्रैक्चर और आघात प्रबंधन',
        'रीढ़ की सर्जरी',
        'खेल चिकित्सा',
        'बाल हड्डी रोग',
        'वृद्धावस्था नाजुकता फ्रैक्चर',
      ],
    },
  },
  {
    slug: { en: 'ophthalmology', hi: 'netra-rog-vibhag' },
    name: { en: 'Ophthalmology', hi: 'नेत्र रोग विभाग' },
    summary: {
      en: 'Cataract surgery, glaucoma management, retina services, and refractive correction in a dedicated eye-care wing.',
      hi: 'समर्पित नेत्र देखभाल विंग में मोतियाबिंद शल्य चिकित्सा, ग्लूकोमा प्रबंधन, रेटिना सेवाएँ और अपवर्तन सुधार।',
    },
    services: {
      en: [
        'Phaco cataract surgery',
        'Glaucoma OPD and surgery',
        'Diabetic retinopathy screening',
        'Squint and paediatric ophthalmology',
        'Refraction and contact lens',
      ],
      hi: [
        'फेको मोतियाबिंद शल्य चिकित्सा',
        'ग्लूकोमा OPD और सर्जरी',
        'मधुमेह रेटिनोपैथी जाँच',
        'भेंगापन और बाल नेत्र रोग',
        'अपवर्तन और कॉन्टैक्ट लेंस',
      ],
    },
  },
  {
    slug: { en: 'dermatology', hi: 'tvacha-rog-vibhag' },
    name: { en: 'Dermatology', hi: 'त्वचा रोग विभाग' },
    summary: {
      en: 'Medical and surgical dermatology for common and chronic skin conditions, plus dermatosurgery and aesthetic care.',
      hi: 'सामान्य और दीर्घकालिक त्वचा स्थितियों के लिए चिकित्सकीय और शल्य त्वचा विज्ञान, साथ ही डर्मेटोसर्जरी।',
    },
    services: {
      en: [
        'Eczema and psoriasis clinic',
        'Acne and pigmentation',
        'Skin biopsies',
        'Cryotherapy',
        'Paediatric dermatology',
      ],
      hi: [
        'एक्जिमा और सोरायसिस क्लीनिक',
        'मुँहासे और रंजकता',
        'त्वचा बायोप्सी',
        'क्रायोथेरेपी',
        'बाल त्वचा रोग',
      ],
    },
  },
  {
    slug: { en: 'pathology-blood-bank', hi: 'patholoji-evam-rakt-bank' },
    name: { en: 'Pathology & Blood Bank', hi: 'पैथोलॉजी और रक्त बैंक' },
    summary: {
      en: 'A NABL-bound diagnostic lab and a 24x7 licensed blood bank with whole blood, packed cells, platelets, and plasma.',
      hi: 'NABL-समर्थित नैदानिक प्रयोगशाला और 24x7 लाइसेंस प्राप्त रक्त बैंक: पूर्ण रक्त, पैक्ड कोशिकाएँ, प्लेटलेट्स और प्लाज़्मा।',
    },
    services: {
      en: [
        'Whole blood and component therapy',
        'Apheresis platelets',
        'Cryoprecipitate',
        'Routine and special pathology',
        'Histopathology and cytology',
      ],
      hi: [
        'पूर्ण रक्त और घटक चिकित्सा',
        'एफेरेसिस प्लेटलेट्स',
        'क्रायोप्रेसिपिटेट',
        'सामान्य और विशेष पैथोलॉजी',
        'हिस्टोपैथोलॉजी और साइटोलॉजी',
      ],
    },
  },
];

export function getDepartment(enSlug: string): Department | undefined {
  return departments.find((d) => d.slug.en === enSlug);
}

export function getDepartmentBySlug(slug: string): Department | undefined {
  return departments.find((d) => d.slug.en === slug || d.slug.hi === slug);
}
