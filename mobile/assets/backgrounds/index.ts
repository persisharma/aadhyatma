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
  | 'source_vishnu_narayana'
  | 'source_gayatri_savitri_sun';

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
  source_vishnu_narayana: require('./source-vishnu-narayana.png'),
  source_gayatri_savitri_sun: require('./source-gayatri-savitri-sun.png'),
};
