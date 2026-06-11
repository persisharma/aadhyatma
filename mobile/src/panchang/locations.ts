// Bundled city list for location-aware panchang. Deliberately coarse: sunrise shifts
// ~4 min per degree of longitude, so major cities + pilgrimage centres are all the
// granularity that meaningfully changes the computed panchang. GPS fixes are snapped
// to the nearest entry so every location the engine ever sees has a stable cityId
// (finite cache keys) and an offline Hindi/English label (no reverse geocoding).
// India-only for v1: the engine and the precomputed observance tables assume the
// device-local day boundary ≈ IST.
import { UJJAIN_CITY_ID, UJJAIN_GEO } from './engine';
import type { LocationSource, PanchangLocation } from './types';

export type City = {
  id: string;
  nameHi: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  elevation: number;
};

export const CITIES: City[] = [
  { id: UJJAIN_CITY_ID, nameHi: 'उज्जैन', nameEn: 'Ujjain', latitude: UJJAIN_GEO.latitude, longitude: UJJAIN_GEO.longitude, elevation: UJJAIN_GEO.elevation },
  { id: 'agra', nameHi: 'आगरा', nameEn: 'Agra', latitude: 27.1767, longitude: 78.0081, elevation: 171 },
  { id: 'ahmedabad', nameHi: 'अहमदाबाद', nameEn: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, elevation: 53 },
  { id: 'amritsar', nameHi: 'अमृतसर', nameEn: 'Amritsar', latitude: 31.634, longitude: 74.8723, elevation: 234 },
  { id: 'ayodhya', nameHi: 'अयोध्या', nameEn: 'Ayodhya', latitude: 26.7922, longitude: 82.1998, elevation: 93 },
  { id: 'bengaluru', nameHi: 'बेंगलुरु', nameEn: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, elevation: 920 },
  { id: 'bhopal', nameHi: 'भोपाल', nameEn: 'Bhopal', latitude: 23.2599, longitude: 77.4126, elevation: 527 },
  { id: 'bhubaneswar', nameHi: 'भुवनेश्वर', nameEn: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, elevation: 45 },
  { id: 'chandigarh', nameHi: 'चंडीगढ़', nameEn: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, elevation: 321 },
  { id: 'chennai', nameHi: 'चेन्नई', nameEn: 'Chennai', latitude: 13.0827, longitude: 80.2707, elevation: 6 },
  { id: 'coimbatore', nameHi: 'कोयंबटूर', nameEn: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, elevation: 411 },
  { id: 'dehradun', nameHi: 'देहरादून', nameEn: 'Dehradun', latitude: 30.3165, longitude: 78.0322, elevation: 640 },
  { id: 'delhi', nameHi: 'दिल्ली', nameEn: 'Delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 },
  { id: 'dwarka', nameHi: 'द्वारका', nameEn: 'Dwarka', latitude: 22.2442, longitude: 68.9685, elevation: 9 },
  { id: 'gaya', nameHi: 'गया', nameEn: 'Gaya', latitude: 24.7955, longitude: 85.0002, elevation: 111 },
  { id: 'guwahati', nameHi: 'गुवाहाटी', nameEn: 'Guwahati', latitude: 26.1445, longitude: 91.7362, elevation: 55 },
  { id: 'haridwar', nameHi: 'हरिद्वार', nameEn: 'Haridwar', latitude: 29.9457, longitude: 78.1642, elevation: 314 },
  { id: 'hyderabad', nameHi: 'हैदराबाद', nameEn: 'Hyderabad', latitude: 17.385, longitude: 78.4867, elevation: 542 },
  { id: 'indore', nameHi: 'इंदौर', nameEn: 'Indore', latitude: 22.7196, longitude: 75.8577, elevation: 553 },
  { id: 'jaipur', nameHi: 'जयपुर', nameEn: 'Jaipur', latitude: 26.9124, longitude: 75.7873, elevation: 431 },
  { id: 'jammu', nameHi: 'जम्मू', nameEn: 'Jammu', latitude: 32.7266, longitude: 74.857, elevation: 327 },
  { id: 'kanpur', nameHi: 'कानपुर', nameEn: 'Kanpur', latitude: 26.4499, longitude: 80.3319, elevation: 126 },
  { id: 'kochi', nameHi: 'कोच्चि', nameEn: 'Kochi', latitude: 9.9312, longitude: 76.2673, elevation: 7 },
  { id: 'kolkata', nameHi: 'कोलकाता', nameEn: 'Kolkata', latitude: 22.5726, longitude: 88.3639, elevation: 9 },
  { id: 'lucknow', nameHi: 'लखनऊ', nameEn: 'Lucknow', latitude: 26.8467, longitude: 80.9462, elevation: 123 },
  { id: 'madurai', nameHi: 'मदुरै', nameEn: 'Madurai', latitude: 9.9252, longitude: 78.1198, elevation: 101 },
  { id: 'mangaluru', nameHi: 'मंगलुरु', nameEn: 'Mangaluru', latitude: 12.9141, longitude: 74.856, elevation: 22 },
  { id: 'mathura', nameHi: 'मथुरा', nameEn: 'Mathura', latitude: 27.4924, longitude: 77.6737, elevation: 174 },
  { id: 'mumbai', nameHi: 'मुंबई', nameEn: 'Mumbai', latitude: 19.076, longitude: 72.8777, elevation: 14 },
  { id: 'nagpur', nameHi: 'नागपुर', nameEn: 'Nagpur', latitude: 21.1458, longitude: 79.0882, elevation: 310 },
  { id: 'nashik', nameHi: 'नासिक', nameEn: 'Nashik', latitude: 19.9975, longitude: 73.7898, elevation: 584 },
  { id: 'panaji', nameHi: 'पणजी', nameEn: 'Panaji (Goa)', latitude: 15.4909, longitude: 73.8278, elevation: 7 },
  { id: 'patna', nameHi: 'पटना', nameEn: 'Patna', latitude: 25.5941, longitude: 85.1376, elevation: 53 },
  { id: 'prayagraj', nameHi: 'प्रयागराज', nameEn: 'Prayagraj', latitude: 25.4358, longitude: 81.8463, elevation: 98 },
  { id: 'pune', nameHi: 'पुणे', nameEn: 'Pune', latitude: 18.5204, longitude: 73.8567, elevation: 560 },
  { id: 'puri', nameHi: 'पुरी', nameEn: 'Puri', latitude: 19.8135, longitude: 85.8312, elevation: 0 },
  { id: 'raipur', nameHi: 'रायपुर', nameEn: 'Raipur', latitude: 21.2514, longitude: 81.6296, elevation: 298 },
  { id: 'rajkot', nameHi: 'राजकोट', nameEn: 'Rajkot', latitude: 22.3039, longitude: 70.8022, elevation: 128 },
  { id: 'rameswaram', nameHi: 'रामेश्वरम', nameEn: 'Rameswaram', latitude: 9.2876, longitude: 79.3129, elevation: 2 },
  { id: 'ranchi', nameHi: 'रांची', nameEn: 'Ranchi', latitude: 23.3441, longitude: 85.3096, elevation: 651 },
  { id: 'rishikesh', nameHi: 'ऋषिकेश', nameEn: 'Rishikesh', latitude: 30.0869, longitude: 78.2676, elevation: 372 },
  { id: 'shimla', nameHi: 'शिमला', nameEn: 'Shimla', latitude: 31.1048, longitude: 77.1734, elevation: 2206 },
  { id: 'shirdi', nameHi: 'शिरडी', nameEn: 'Shirdi', latitude: 19.7645, longitude: 74.4762, elevation: 504 },
  { id: 'somnath', nameHi: 'सोमनाथ', nameEn: 'Somnath', latitude: 20.888, longitude: 70.4012, elevation: 12 },
  { id: 'srinagar', nameHi: 'श्रीनगर', nameEn: 'Srinagar', latitude: 34.0837, longitude: 74.7973, elevation: 1585 },
  { id: 'surat', nameHi: 'सूरत', nameEn: 'Surat', latitude: 21.1702, longitude: 72.8311, elevation: 13 },
  { id: 'thiruvananthapuram', nameHi: 'तिरुवनंतपुरम', nameEn: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, elevation: 10 },
  { id: 'tirupati', nameHi: 'तिरुपति', nameEn: 'Tirupati', latitude: 13.6288, longitude: 79.4192, elevation: 161 },
  { id: 'vadodara', nameHi: 'वडोदरा', nameEn: 'Vadodara', latitude: 22.3072, longitude: 73.1812, elevation: 39 },
  { id: 'varanasi', nameHi: 'वाराणसी', nameEn: 'Varanasi', latitude: 25.3176, longitude: 82.9739, elevation: 81 },
  { id: 'vijayawada', nameHi: 'विजयवाड़ा', nameEn: 'Vijayawada', latitude: 16.5062, longitude: 80.648, elevation: 23 },
  { id: 'visakhapatnam', nameHi: 'विशाखापत्तनम', nameEn: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, elevation: 45 },
];

const cityById = new Map(CITIES.map((city) => [city.id, city] as const));

export function getCityById(id: string): City | undefined {
  return cityById.get(id);
}

export function toPanchangLocation(city: City, source: LocationSource): PanchangLocation {
  return {
    cityId: city.id,
    labelHi: city.nameHi,
    labelEn: city.nameEn,
    latitude: city.latitude,
    longitude: city.longitude,
    elevation: city.elevation,
    source,
  };
}

export const DEFAULT_LOCATION: PanchangLocation = toPanchangLocation(CITIES[0], 'default');

// Nearest bundled city by equirectangular distance — accurate to well under a
// kilometre of error at this list's spacing, no haversine needed.
export function nearestCity(latitude: number, longitude: number): City {
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  let best = CITIES[0];
  let bestDist = Infinity;
  for (const city of CITIES) {
    const dLat = city.latitude - latitude;
    const dLng = (city.longitude - longitude) * cosLat;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}
