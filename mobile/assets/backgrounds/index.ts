export type BackgroundImageKey =
  | 'category_granth_open_scripture'
  | 'category_stotram_hymn_scroll'
  | 'category_chalisa_booklet_mala'
  | 'category_japam_mala'
  | 'category_aarti_diya'
  | 'deity_rama_darbar'
  | 'deity_krishna_bansuri'
  | 'deity_durga_lion'
  | 'deity_ganesha_modak'
  | 'deity_lakshmi_lotus_coins'
  | 'deity_shani_crow'
  | 'deity_surya_chariot'
  | 'deity_santoshi_mata_lotus'
  | 'deity_ganga_makara'
  | 'deity_tulsi_vrindavan'
  | 'source_vishnu_narayana'
  | 'source_gayatri_savitri_sun'
  | 'deity_saraswati_veena'
  | 'panchang_celestial_almanac';

export const backgroundImages: Record<BackgroundImageKey, number> = {
  category_granth_open_scripture: require('./category-granth-open-scripture.png'),
  category_stotram_hymn_scroll: require('./category-stotram-hymn-scroll.png'),
  category_chalisa_booklet_mala: require('./category-chalisa-booklet-mala.png'),
  category_japam_mala: require('./category-japam-mala.png'),
  category_aarti_diya: require('./category-aarti-diya.png'),
  deity_rama_darbar: require('./deity-rama-darbar.png'),
  deity_krishna_bansuri: require('./deity-krishna-bansuri.png'),
  deity_durga_lion: require('./deity-durga-lion.png'),
  deity_ganesha_modak: require('./deity-ganesha-modak.png'),
  deity_lakshmi_lotus_coins: require('./deity-lakshmi-lotus-coins.png'),
  deity_shani_crow: require('./deity-shani-crow.png'),
  deity_surya_chariot: require('./deity-surya-chariot.png'),
  deity_santoshi_mata_lotus: require('./deity-santoshi-mata-lotus.png'),
  deity_ganga_makara: require('./deity-ganga-makara.png'),
  deity_tulsi_vrindavan: require('./deity-tulsi-vrindavan.png'),
  source_vishnu_narayana: require('./source-vishnu-narayana.png'),
  source_gayatri_savitri_sun: require('./source-gayatri-savitri-sun.png'),
  deity_saraswati_veena: require('./deity-saraswati-veena.png'),
  panchang_celestial_almanac: require('./panchang-celestial-almanac.png'),
};
