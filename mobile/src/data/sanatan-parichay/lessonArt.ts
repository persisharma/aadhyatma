import manifest from './lessonArtManifest.json';
import {assetBaseUrl,remoteAssetRequest} from '@/data/assetManifest';
export type SanatanLessonArt={kind:'sanatan-lesson-art';stem:string};
export const lessonArtByTopic:Readonly<Record<string,string>>={deity:'ganesha-attributes',plants:'tulasi-objects'};
export function lessonArtSource(topicId:string):SanatanLessonArt|null{
 const stem=lessonArtByTopic[topicId];
 return stem&&Object.prototype.hasOwnProperty.call(manifest.assets,stem)?{kind:'sanatan-lesson-art',stem}:null;
}
export function lessonArtRequest(source:SanatanLessonArt){return remoteAssetRequest(manifest,source.stem,assetBaseUrl());}
