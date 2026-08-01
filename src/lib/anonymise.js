const NIGERIAN_UNIVERSITIES = [
  'University of Lagos', 'UNILAG',
  'Obafemi Awolowo University', 'OAU',
  'University of Nigeria Nsukka', 'UNN',
  'Ahmadu Bello University', 'ABU',
  'University of Ibadan', 'UI',
  'Lagos State University', 'LASU',
  'Covenant University', 'Landmark University',
  'Babcock University', 'Pan-Atlantic University',
  'American University of Nigeria', 'AUN',
  'University of Benin', 'UNIBEN',
  'Delta State University', 'DELSU',
  'Rivers State University', 'Caleb University',
  'Crawford University', 'Redeemers University',
  'Bowen University',
  'Federal University of Technology Akure', 'FUTA',
  'University of Port Harcourt', 'UNIPORT',
  'Nnamdi Azikiwe University', 'UNIZIK',
  'University of Ilorin', 'UNILORIN',
  'Bayero University Kano', 'BUK',
  'University of Maiduguri', 'UNIMAID',
]

const NIGERIAN_LOCATIONS = [
  'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt',
  'Enugu', 'Benin City', 'Kaduna', 'Jos', 'Ilorin',
  'Onitsha', 'Warri', 'Sokoto', 'Maiduguri', 'Owerri',
  'Abeokuta', 'Oyo', 'Ado-Ekiti', 'Calabar', 'Uyo',
  'Akure', 'Bauchi', 'Minna', 'Jalingo', 'Yola',
  'Nigeria', 'Nigerian',
  'Lagos State', 'Abuja FCT', 'Kano State', 'Oyo State',
  'Rivers State', 'Enugu State', 'Edo State', 'Kaduna State',
  'Plateau State', 'Kwara State', 'Anambra State', 'Delta State',
  'Imo State', 'Akwa Ibom State', 'Cross River State',
]

export function anonymiseCVText(cvText, firstName, lastName) {
  let anonymised = cvText

  if (firstName) {
    anonymised = anonymised.replace(
      new RegExp(firstName, 'gi'), '[Name]'
    )
  }
  if (lastName) {
    anonymised = anonymised.replace(
      new RegExp(lastName, 'gi'), '[Name]'
    )
  }
  if (firstName && lastName) {
    anonymised = anonymised.replace(
      new RegExp(
        `${firstName}\\s+${lastName}|${lastName}\\s+${firstName}`,
        'gi'
      ), '[Candidate]'
    )
  }

  // Remove emails
  anonymised = anonymised.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[email]'
  )

  // Remove phone numbers
  anonymised = anonymised.replace(
    /(\+?234|0)[789][01]\d{8}|\+?\d[\d\s\-().]{7,}/g,
    '[phone]'
  )

  // Remove age references
  anonymised = anonymised.replace(
    /\b(age[d]?:?\s*\d{1,2}|born\s+in\s+\d{4}|date\s+of\s+birth[:\s]+[\d\/\-]+|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/gi,
    '[age redacted]'
  )

  // Remove universities
  NIGERIAN_UNIVERSITIES.forEach(uni => {
    anonymised = anonymised.replace(new RegExp(uni, 'gi'), '[University]')
  })

  // Remove locations
  NIGERIAN_LOCATIONS.forEach(loc => {
    anonymised = anonymised.replace(
      new RegExp(`\\b${loc}\\b`, 'gi'), '[Location]'
    )
  })

  // Remove gender pronouns
  anonymised = anonymised.replace(
    /\b(he|she|his|her|him|himself|herself)\b/gi, '[they]'
  )

  return anonymised
}
