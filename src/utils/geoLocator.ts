export interface GeoPlace {
  id: string;
  nameEn: string;
  nameAm: string;
  region: string;
  lat: number;
  lng: number;
  type: 'hub' | 'checkpoint' | 'street' | 'city' | 'corridor';
  imageUrl: string;
  description: string;
}

export const ETHIOPIA_PLACES: GeoPlace[] = [
  // Addis Ababa Detailed Locations & Streets
  {
    id: 'addis_meskel',
    nameEn: 'Addis Ababa - Meskel Square Hub',
    nameAm: 'አዲስ አበባ (መስቀል አደባባይ)',
    region: 'አዲስ አበባ',
    lat: 9.0108,
    lng: 38.7613,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    description: 'የአዲስ አበባ ማዕከላዊ ትራንስፖርት መገናኛ እና የመስቀል አደባባይ ኮሪደር',
  },
  {
    id: 'addis_merkato',
    nameEn: 'Addis Ababa - Merkato Autobis Tera',
    nameAm: 'መርካቶ አውቶቡስ ተራ (ዋና መናኸሪያ)',
    region: 'አዲስ አበባ',
    lat: 9.0315,
    lng: 38.7372,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    description: 'የሰሜን እና ምዕራብ ኢትዮጵያ የረጅም ርቀት አውቶቡሶች ዋና መነሻ',
  },
  {
    id: 'addis_piassa',
    nameEn: 'Addis Ababa - Piassa / Arat Kilo',
    nameAm: 'ፒያሳ / አራት ኪሎ አካባቢ',
    region: 'አዲስ አበባ',
    lat: 9.0338,
    lng: 38.7525,
    type: 'street',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'የከተማ ባጃጅ፣ ሚኒባስ እና አንበሳ አውቶቡስ መስመር',
  },
  {
    id: 'addis_kality',
    nameEn: 'Addis Ababa - Kality Terminal & Gate',
    nameAm: 'ቃሊቲ መናኸሪያ እና የፍተሻ ኬላ',
    region: 'አዲስ አበባ',
    lat: 8.9265,
    lng: 38.7735,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    description: 'የደቡብ እና የአዳማ ፈጣን መንገድ ዋና መውጫና መቆጣጠሪያ ኬላ',
  },
  {
    id: 'addis_lambert',
    nameEn: 'Addis Ababa - Lamberet Terminal',
    nameAm: 'ላምበርት መናኸሪያ (ምስራቅ መውጫ)',
    region: 'አዲስ አበባ',
    lat: 9.0205,
    lng: 38.8215,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የድሬዳዋ፣ ሀረር፣ ጅግጅጋ እና ደሴ መስመር መናኸሪያ',
  },
  {
    id: 'addis_asko',
    nameEn: 'Addis Ababa - Asko Terminal',
    nameAm: 'አስኮ መናኸሪያ (ምዕራብ መውጫ)',
    region: 'አዲስ አበባ',
    lat: 9.0510,
    lng: 38.6850,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'የአምቦ፣ ነቀምቴ፣ ወለጋ እና አሶሳ መስመር መነሻ',
  },

  // Addis - Adama - Hawassa Expressway & Southern Corridor
  {
    id: 'dukem',
    nameEn: 'Dukem Expressway Toll',
    nameAm: 'ዱከም (የፈጣን መንገድ መቆጣጠሪያ)',
    region: 'ኦሮሚያ',
    lat: 8.7950,
    lng: 38.9020,
    type: 'corridor',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'አዲስ አበባ - አዳማ ፈጣን መንገድ ኪ.ሜ 35',
  },
  {
    id: 'bishoftu',
    nameEn: 'Bishoftu / Debre Zeit',
    nameAm: 'ቢሾፍቱ (ደብረ ዘይት)',
    region: 'ኦሮሚያ',
    lat: 8.7523,
    lng: 38.9785,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'የቢሾፍቱ ከተማ ዋና አውራ ጎዳና እና የሐይቆች አካባቢ',
  },
  {
    id: 'mojo_checkpoint',
    nameEn: 'Mojo Dry Port & Junction Checkpoint',
    nameAm: 'ሞጆ ደረቅ ወደብ እና የትራፊክ ኬላ',
    region: 'ኦሮሚያ',
    lat: 8.5868,
    lng: 39.1211,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    description: 'የአዳማ፣ የጅቡቲ እና የሀዋሳ መስመሮች ዋና መገናኛ ኬላ',
  },
  {
    id: 'adama',
    nameEn: 'Adama / Nazareth City',
    nameAm: 'አዳማ / ናዝሬት (ዋና መናኸሪያ)',
    region: 'ኦሮሚያ',
    lat: 8.5400,
    lng: 39.2700,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'የአዳማ ከተማ ፖስታ ቤትና የፈጣን መንገድ ማብቂያ',
  },
  {
    id: 'koka_checkpoint',
    nameEn: 'Koka Bridge Checkpoint',
    nameAm: 'ቆቃ ድልድይ ፍተሻ ኬላ',
    region: 'ኦሮሚያ',
    lat: 8.4310,
    lng: 39.0420,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    description: 'የቆቃ ሐይቅና የሀዋሳ አውራ ጎዳና የፍጥነት ቁጥጥር ኬላ',
  },
  {
    id: 'ziway_batu',
    nameEn: 'Batu / Ziway City',
    nameAm: 'ባቱ (ዝዋይ ከተማ)',
    region: 'ኦሮሚያ',
    lat: 7.9347,
    lng: 38.7161,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'ዝዋይ ሐይቅ አጠገብ የሚገኝ የትራንስፖርት ማረፊያ',
  },
  {
    id: 'shashemene',
    nameEn: 'Shashemene Junction',
    nameAm: 'ሻሸመኔ (መስቀለኛ መናኸሪያ)',
    region: 'ኦሮሚያ',
    lat: 7.2000,
    lng: 38.6000,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የሀዋሳ፣ አርባ ምንጭ፣ ባሌ እና ሞያሌ መስመር መገናኛ',
  },
  {
    id: 'hawassa',
    nameEn: 'Hawassa City Terminal',
    nameAm: 'ሀዋሳ ከተማ (ዋና መናኸሪያ)',
    region: 'ሲዳማ',
    lat: 7.0504,
    lng: 38.4674,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    description: 'የሲዳማ ክልልና የደቡብ ኢትዮጵያ ዋና የትራንስፖርት ማዕከል',
  },

  // Eastern Corridor (Adama -> Awash -> Dire Dawa -> Djibouti -> Jigjiga)
  {
    id: 'metehara',
    nameEn: 'Metehara / Beseka',
    nameAm: 'መተሃራ (በሰቃ ሐይቅ አካባቢ)',
    region: 'ኦሮሚያ',
    lat: 8.9000,
    lng: 39.9167,
    type: 'corridor',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    description: 'የምስራቅ ኢትዮጵያ የከባድ ጭነትና አውቶቡስ ዋና መስመር',
  },
  {
    id: 'awash_checkpoint',
    nameEn: 'Awash 7 Kilo Checkpoint',
    nameAm: 'አዋሽ 7 ኪሎ የፍተሻ ኬላ',
    region: 'አፋር',
    lat: 8.9936,
    lng: 40.1667,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    description: 'የጅቡቲ፣ የሰመራ እና የድሬዳዋ ዋና የፍተሻና ክብደት ሚዛን ኬላ',
  },
  {
    id: 'chiro',
    nameEn: 'Chiro / Asebe Teferi',
    nameAm: 'ጭሮ (አሰበ ተፈሪ)',
    region: 'ኦሮሚያ',
    lat: 9.0715,
    lng: 40.8650,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የምዕራብ ሐረርጌ ዋና ከተማ እና የጭሮ ኮሪደር',
  },
  {
    id: 'dire_dawa',
    nameEn: 'Dire Dawa City Terminal',
    nameAm: 'ድሬዳዋ ከተማ (ሰባተኛ መናኸሪያ)',
    region: 'ድሬዳዋ',
    lat: 9.5931,
    lng: 41.8661,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    description: 'የምስራቅ ኢትዮጵያ የንግድና የባቡር ኮሪደር መገናኛ',
  },
  {
    id: 'harar',
    nameEn: 'Harar Jugol City',
    nameAm: 'ሐረር ከተማ',
    region: 'ሐረሪ',
    lat: 9.3139,
    lng: 42.1182,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    description: 'ታሪካዊቷ የሐረር ከተማ መናኸሪያ',
  },
  {
    id: 'jigjiga',
    nameEn: 'Jigjiga Regional Hub',
    nameAm: 'ጅግጅጋ ከተማ (ሶማሌ ክልል)',
    region: 'ሶማሌ',
    lat: 9.3500,
    lng: 42.8000,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'የሶማሌ ክልል ዋና የትራንስፖርት ማዕከል',
  },

  // Northern / Gojjam Corridor (Addis -> Gohatsion -> Dejen -> Debre Markos -> Bahir Dar -> Gondar)
  {
    id: 'chancho',
    nameEn: 'Chancho / Sululta',
    nameAm: 'ሱሉልታ / ጫንጮ',
    region: 'ኦሮሚያ',
    lat: 9.3050,
    lng: 38.7500,
    type: 'corridor',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'የሰሜን ኢትዮጵያ (ጎጃም) ዋና አውራ ጎዳና',
  },
  {
    id: 'fiche',
    nameEn: 'Fiche / Gebre Guracha',
    nameAm: 'ፍቼ / ገብረ ጉራቻ',
    region: 'ኦሮሚያ',
    lat: 9.7833,
    lng: 38.7333,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የሰሜን ሸዋ መስመር ኪ.ሜ 114',
  },
  {
    id: 'dejen_checkpoint',
    nameEn: 'Abay Gorge / Dejen Checkpoint',
    nameAm: 'ዓባይ በረሃ እና ደጀን ኬላ',
    region: 'አማራ',
    lat: 10.1667,
    lng: 38.1333,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    description: 'የዓባይ ሸለቆ ቁልቁለት ከፍተኛ የደህንነት እና የፍጥነት መቆጣጠሪያ ኬላ',
  },
  {
    id: 'debre_markos',
    nameEn: 'Debre Markos City',
    nameAm: 'ደብረ ማርቆስ ከተማ',
    region: 'አማራ',
    lat: 10.3333,
    lng: 37.7333,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'የምስራቅ ጎጃም ዋና የትራንስፖርት መገናኛ',
  },
  {
    id: 'bahir_dar',
    nameEn: 'Bahir Dar / Lake Tana Hub',
    nameAm: 'ባህር ዳር ከተማ (ጣና)',
    region: 'አማራ',
    lat: 11.5940,
    lng: 37.3900,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'የጣና ሐይቅና ዳግማዊ ሚኒሊክ መናኸሪያ',
  },
  {
    id: 'gondar',
    nameEn: 'Gondar / Azezo Hub',
    nameAm: 'ጎንደር ከተማ (አዘዞ)',
    region: 'አማራ',
    lat: 12.6030,
    lng: 37.4521,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    description: 'የሰሜን ምዕራብ ኢትዮጵያና የሱዳን ድንበር ኮሪደር',
  },

  // North-Eastern Corridor (Debre Birhan -> Dessie -> Kombolcha -> Mekelle)
  {
    id: 'debre_birhan',
    nameEn: 'Debre Birhan Checkpoint',
    nameAm: 'ደብረ ብርሃን ከተማ እና ኬላ',
    region: 'አማራ',
    lat: 9.6795,
    lng: 39.5326,
    type: 'checkpoint',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የደሴ፣ ኮምቦልቻና መቀሌ መስመር የፍተሻ ኬላ',
  },
  {
    id: 'kombolcha_dessie',
    nameEn: 'Kombolcha & Dessie Hub',
    nameAm: 'ደሴ / ኮምቦልቻ መናኸሪያ',
    region: 'አማራ',
    lat: 11.0849,
    lng: 39.7367,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    description: 'የደቡብ ወሎ እና የወልዲያ / ሰመራ መገናኛ',
  },
  {
    id: 'mekelle',
    nameEn: 'Mekelle Romanat Terminal',
    nameAm: 'መቀሌ ከተማ (ሮማናት መናኸሪያ)',
    region: 'ትግራይ',
    lat: 13.4967,
    lng: 39.4753,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    description: 'የትግራይ ክልል ዋና የትራንስፖርት ማዕከል',
  },

  // South-Western Corridor (Woliso -> Welkite -> Jimma)
  {
    id: 'woliso',
    nameEn: 'Woliso City',
    nameAm: 'ወሊሶ ከተማ',
    region: 'ኦሮሚያ',
    lat: 8.5333,
    lng: 37.9667,
    type: 'city',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'የጅማ ኮሪደር ኪ.ሜ 114',
  },
  {
    id: 'jimma',
    nameEn: 'Jimma Aba Jifar Terminal',
    nameAm: 'ጅማ ከተማ (አባ ጅፋር መናኸሪያ)',
    region: 'ኦሮሚያ',
    lat: 7.6734,
    lng: 36.8344,
    type: 'hub',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: 'የደቡብ ምዕራብ ኢትዮጵያ የቡናና ንግድ ትራንስፖርት ማዕከል',
  },
];

/**
 * Haversine distance in kilometers
 */
export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolve exact nearest known place name, distance, and real photo offline in <1ms
 */
export function resolveExactLocation(lat: number, lng: number): {
  place: GeoPlace;
  distanceKm: number;
  formattedLabel: string;
  imageUrl: string;
} {
  let closest = ETHIOPIA_PLACES[0];
  let minDist = Infinity;

  for (const p of ETHIOPIA_PLACES) {
    const d = calculateDistanceKm(lat, lng, p.lat, p.lng);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }

  const formattedLabel =
    minDist < 2.5
      ? `${closest.nameAm} (ውስጥ)`
      : `${closest.nameAm} አካባቢ (${minDist.toFixed(1)} ኪ.ሜ ርቀት)`;

  return {
    place: closest,
    distanceKm: Number(minDist.toFixed(2)),
    formattedLabel,
    imageUrl: closest.imageUrl,
  };
}

/**
 * Bearing degrees (0-360) and Amharic compass direction
 */
export function calculateBearingAndCompass(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): { degrees: number; compassAm: string; compassEn: string } {
  const y = Math.sin(((lng2 - lng1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lng2 - lng1) * Math.PI) / 180);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  const directionsAm = ['ሰሜን', 'ሰሜን ምስራቅ', 'ምስራቅ', 'ደቡብ ምስራቅ', 'ደቡብ', 'ደቡብ ምዕራብ', 'ምዕራብ', 'ሰሜን ምዕራብ'];
  const directionsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(brng / 45) % 8;

  return {
    degrees: Math.round(brng),
    compassAm: directionsAm[idx],
    compassEn: directionsEn[idx],
  };
}

/**
 * Find destination coordinates for corridor routing & ETA calculation
 */
export function findDestinationCoords(destinationText?: string): GeoPlace {
  if (!destinationText) return ETHIOPIA_PLACES[0];
  const q = destinationText.toLowerCase();
  const match = ETHIOPIA_PLACES.find(
    (p) =>
      p.nameAm.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      q.includes(p.nameEn.split(' ')[0].toLowerCase()) ||
      q.includes(p.nameAm.split(' ')[0])
  );
  return match || ETHIOPIA_PLACES[0];
}
