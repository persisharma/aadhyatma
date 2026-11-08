/** Manually transcribed primary-source references, checked 2026-11-06.
 * All dates/clocks are New Delhi, Asia/Kolkata (not engine-generated answers).
 * +1 explicitly means the following civil date. Sources and audit limitations:
 * docs/reviews/festival-muhurat-audit.md. Clock tolerance is 3 minutes; dates exact.
 */
export type PublishedOccasion = { id: string; date: string; clocks: readonly (readonly [string, string])[]; source: string; guidanceOnly?: boolean };
const drik = 'https://www.drikpanchang.com';
const entry = (id: string, date: string, start: string, end: string, path: string): PublishedOccasion => ({ id, date, clocks: [[start, end]], source: `${drik}${path}?year=${date.slice(0, 4)}` });
const ekadashi = (id: string, date: string, start: string, end: string, slug = id.replace('-ekadashi', '')) => entry(id, date, start + '+1', end + '+1', `/ekadashis/${slug}/${slug}-ekadashi-date-time.html`);
const moon = (id: string, date: string, clock: string) => entry(id, date, clock, clock, '/vrats/sankashti-chaturthi-dates.html');
const vinayaka = (date: string, start: string, end: string) => entry('vinayaka-chaturthi-vrat', date, start, end, '/vrats/vinayaka-chaturthi-dates.html');
const shiva = (date: string, start: string, end: string) => entry('masik-shivaratri', date, start, end, '/vrats/masik-shivaratri-dates.html');
const pradosh = (paksha: string, date: string, start: string, end: string) => entry(`pradosh-vrat-${paksha}`, date, start, end, '/vrats/pradoshdates.html');
const ghata = (id: string, date: string, start: string, end: string, path: string): PublishedOccasion => ({ ...entry(id, date, start, end, path), guidanceOnly: true });

export const PUBLISHED_OCCASIONS: readonly PublishedOccasion[] = [
  entry('diwali', '2026-11-08', '17:54', '19:50', '/festivals/lakshmipuja/festivals-lakshmipuja-timings.html'),
  entry('dhanteras', '2026-11-06', '18:02', '19:57', '/festivals/dhanteras/festivals-dhanteras-puja-timings.html'),
  entry('ganesh-chaturthi', '2026-09-14', '11:02', '13:31', '/hindu-festivals/ganesha-chaturthi/ganesha-chaturthi.html'),
  entry('ganesh-jayanti', '2026-01-22', '11:29', '13:37', '/hindu-gods/ganesha/ganesha-jayanti/ganesha-jayanti-date-time.html'),
  entry('ram-navami', '2026-03-26', '11:13', '13:41', '/dashavatara/rama-navami/rama-navami-date-time.html'),
  { ...entry('maha-shivaratri', '2026-02-15', '00:09+1', '01:01+1', '/festivals/maha-shivaratri/maha-shivaratri-date-time.html'), clocks: [['00:09+1', '01:01+1'], ['18:11', '21:23'], ['21:23', '00:35+1'], ['00:35+1', '03:47+1'], ['03:47+1', '06:59+1']] },
  entry('dussehra', '2026-10-20', '13:59', '14:45', '/festivals/vijayadashami/vijayadashami-date-time.html'),
  entry('maha-navami', '2026-10-20', '13:59', '14:45', '/navratri/durga-puja/ayudha-puja-date-time.html'),
  entry('holi', '2026-03-03', '18:22', '20:50', '/festivals/holi/festivals-holika-dahan-timings.html'),
  entry('raksha-bandhan', '2026-08-28', '05:57', '09:48', '/festivals/raksha-bandhan/raksha-bandhan-date-time.html'),
  entry('raksha-bandhan', '2025-08-09', '05:47', '13:24', '/festivals/raksha-bandhan/raksha-bandhan-date-time.html'),
  entry('janmashtami', '2026-09-04', '23:57', '00:43+1', '/dashavatara/lord-krishna/krishna-janmashtami-date-time.html'),
  entry('janmashtami', '2025-08-15', '00:04+1', '00:47+1', '/dashavatara/lord-krishna/krishna-janmashtami-date-time.html'),
  entry('janmashtami-vaishnava', '2025-08-16', '00:04+1', '00:47+1', '/dashavatara/lord-krishna/krishna-janmashtami-date-time.html'),
  { ...entry('karwa-chauth', '2026-10-29', '17:38', '18:56', '/festivals/karwa-chauth/karwa-chauth-date-time.html'), clocks: [['17:38', '18:56'], ['20:17', '20:17']] },
  moon('sakat-chauth', '2026-01-06', '20:59'),
  moon('bahula-chaturthi', '2026-08-31', '20:29'),
  // Bhadwa is the regional moonrise sibling; only the astronomical event is certified.
  moon('bhadwa-chauth', '2026-08-31', '20:29'),
  { ...entry('chhath-puja', '2026-11-15', '17:28', '17:28', '/chhath/chhath-puja-calendar.html'), clocks: [['17:28', '17:28'], ['06:44+1', '06:44+1']] },
  // Chaiti Shashthi date and sky events: Drik daily Panchang, 24/25 March.
  { ...entry('chaiti-chhath', '2026-03-24', '18:34', '18:34', '/panchang/day-panchang.html'), source: `${drik}/panchang/day-panchang.html?date=24/03/2026`, clocks: [['18:34', '18:34'], ['06:20+1', '06:20+1']] },
  entry('bhai-dooj', '2026-11-11', '13:10', '15:20', '/festivals/bhai-dooj/bhai-dooj-date-time.html'),
  entry('akshaya-tritiya', '2026-04-19', '10:49', '12:20', '/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html'),
  entry('govardhan-puja', '2026-11-10', '06:40', '08:50', '/festivals/govardhan-puja/govardhan-puja-date-time.html'),

  // Reviewed dates, but exact preferred-clock selection is NOT enabled.
  ghata('chaitra-navratri-start', '2025-03-30', '06:13', '10:22', '/navratri/chaitra-navratri-ghatasthapana.html'),
  ghata('chaitra-navratri-start', '2026-03-19', '06:52', '07:43', '/navratri/chaitra-navratri-ghatasthapana.html'),
  ghata('chaitra-navratri-start', '2027-04-07', '06:05', '07:26', '/navratri/chaitra-navratri-ghatasthapana.html'),
  ghata('navratri-start', '2026-10-11', '06:19', '10:12', '/navratri/shardiya-navratri-ghatasthapana.html'),
  ghata('ashadha-gupt-navratri', '2026-07-15', '05:33', '10:09', '/navratri/ashadha/ashadha-gupta-navratri-ghatasthapana.html'),
  ghata('magha-gupt-navratri', '2026-01-19', '07:14', '10:46', '/navratri/magha/magha-gupta-navratri-ghatasthapana.html'),

  ekadashi('shattila-ekadashi', '2026-01-14', '07:15', '09:21'),
  ekadashi('jaya-ekadashi', '2026-01-29', '07:10', '09:20'),
  ekadashi('vijaya-ekadashi', '2026-02-13', '07:00', '09:14'),
  ekadashi('amalaki-ekadashi', '2026-02-27', '06:47', '09:06'),
  ekadashi('papmochani-ekadashi', '2026-03-15', '06:30', '08:54'),
  ekadashi('kamada-ekadashi', '2026-03-29', '06:14', '07:09'),
  ekadashi('varuthini-ekadashi', '2026-04-13', '06:54', '08:31'),
  ekadashi('mohini-ekadashi', '2026-04-27', '05:43', '08:21'),
  ekadashi('apara-ekadashi', '2026-05-13', '05:31', '08:14'),
  ekadashi('nirjala-ekadashi', '2026-06-25', '05:25', '08:13'),
  ekadashi('yogini-ekadashi', '2026-07-10', '13:50', '16:36'),
  ekadashi('devshayani-ekadashi', '2026-07-25', '05:39', '08:22'),
  ekadashi('kamika-ekadashi', '2026-08-09', '05:47', '08:00'),
  entry('putrada-ekadashi', '2026-08-23', '13:41+1', '16:16+1', '/ekadashis/putrada/shravana-putrada-ekadashi-date-time.html'),
  entry('putrada-ekadashi', '2027-01-18', '13:35+1', '15:42+1', '/ekadashis/putrada/pausha-putrada-ekadashi-date-time.html'),
  ekadashi('aja-ekadashi', '2026-09-07', '06:02', '08:33'),
  ekadashi('parivartini-ekadashi', '2026-09-22', '06:10', '08:35'),
  ekadashi('indira-ekadashi', '2026-10-06', '06:17', '08:38'),
  ekadashi('papankusha-ekadashi', '2026-10-22', '06:27', '08:42'),
  ekadashi('rama-ekadashi', '2026-11-05', '06:37', '08:48'),
  ekadashi('dev-uthani-ekadashi', '2026-11-20', '13:11', '15:18', 'prabodhini'),
  ekadashi('utpanna-ekadashi', '2026-12-04', '06:59', '09:04'),
  ekadashi('mokshada-ekadashi', '2026-12-20', '07:10', '09:13'),
  ekadashi('saphala-ekadashi', '2027-01-03', '07:15', '09:19'),

  vinayaka('2026-01-22', '11:29', '13:37'), vinayaka('2026-02-21', '11:27', '13:00'),
  vinayaka('2026-03-22', '11:15', '13:41'), vinayaka('2026-04-20', '11:02', '13:38'),
  vinayaka('2026-05-20', '10:56', '11:06'), vinayaka('2026-06-18', '10:58', '13:46'),
  vinayaka('2026-07-17', '11:05', '13:50'), vinayaka('2026-08-16', '11:06', '13:44'),
  vinayaka('2026-09-14', '11:02', '13:31'), vinayaka('2026-10-14', '10:58', '13:16'),
  vinayaka('2026-11-13', '11:01', '13:10'), vinayaka('2026-12-13', '11:13', '13:17'),

  shiva('2026-01-16', '00:04+1', '00:58+1'), shiva('2026-02-15', '00:09+1', '01:01+1'),
  shiva('2026-03-17', '00:05+1', '00:53+1'), shiva('2026-04-15', '23:59', '00:43+1'),
  shiva('2026-05-15', '23:57', '00:38+1'), shiva('2026-06-13', '00:01+1', '00:41+1'),
  shiva('2026-07-12', '00:07+1', '00:47+1'), shiva('2026-08-11', '00:05+1', '00:48+1'),
  shiva('2026-09-09', '23:55', '00:41+1'), shiva('2026-10-08', '23:44', '00:33+1'),
  shiva('2026-11-07', '23:39', '00:31+1'), shiva('2026-12-07', '23:46', '00:40+1'),

  ...[
    ['2026-01-06', '20:59'], ['2026-02-05', '21:39'], ['2026-03-06', '21:18'],
    ['2026-04-05', '21:58'], ['2026-05-05', '22:35'], ['2026-06-03', '22:04'],
    ['2026-07-03', '21:53'], ['2026-08-02', '21:24'], ['2026-08-31', '20:29'],
    ['2026-09-29', '19:44'], ['2026-10-29', '20:17'], ['2026-11-27', '20:18'], ['2026-12-26', '20:19'],
  ].map(([date, clock]) => moon('sankashti-chaturthi-vrat', date, clock)),

  pradosh('shukla', '2026-01-01', '17:35', '20:19'), pradosh('krishna', '2026-01-16', '17:47', '20:29'),
  pradosh('shukla', '2026-01-30', '17:59', '20:37'), pradosh('krishna', '2026-02-14', '18:10', '20:44'),
  pradosh('shukla', '2026-03-01', '18:21', '19:09'), pradosh('krishna', '2026-03-16', '18:30', '20:54'),
  pradosh('shukla', '2026-03-30', '18:38', '20:57'), pradosh('krishna', '2026-04-15', '18:47', '21:00'),
  pradosh('shukla', '2026-04-28', '18:54', '21:04'), pradosh('krishna', '2026-05-14', '19:04', '21:09'),
  pradosh('shukla', '2026-05-28', '19:12', '21:15'), pradosh('krishna', '2026-06-12', '19:36', '21:20'),
  pradosh('shukla', '2026-06-27', '19:23', '21:23'), pradosh('krishna', '2026-07-12', '19:22', '21:24'),
  pradosh('shukla', '2026-07-26', '19:16', '21:21'), pradosh('krishna', '2026-08-10', '19:05', '21:14'),
  pradosh('shukla', '2026-08-25', '18:51', '21:04'), pradosh('krishna', '2026-09-08', '18:35', '20:52'),
  pradosh('shukla', '2026-09-24', '18:16', '20:39'), pradosh('krishna', '2026-10-08', '17:59', '20:27'),
  pradosh('shukla', '2026-10-23', '17:44', '20:16'), pradosh('krishna', '2026-11-06', '17:33', '20:09'),
  pradosh('shukla', '2026-11-22', '17:25', '20:06'), pradosh('krishna', '2026-12-06', '17:24', '20:07'),
  pradosh('shukla', '2026-12-21', '17:36', '20:13'),
];
