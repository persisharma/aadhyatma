import manifest from './lessonArtManifest.json';
import {assetBaseUrl,remoteAssetRequest} from '@/data/assetManifest';
export type SanatanLessonArt={kind:'sanatan-lesson-art';stem:string};
/** Hindi and Gujarati share the Devanagari plate; English and Kannada share the Roman plate. */
export function lessonArtLang(lang:string):'hi'|'en'{return lang==='hi'||lang==='gu'?'hi':'en';}
/** The painted teaching illustration for a lesson, in the reader's language, or null until published. */
export function lessonArtSource(topicId:string,lang:string):SanatanLessonArt|null{
 const stem=`${topicId}-${lessonArtLang(lang)}`;
 return Object.prototype.hasOwnProperty.call(manifest.assets,stem)?{kind:'sanatan-lesson-art',stem}:null;
}
export function lessonArtRequest(source:SanatanLessonArt){return remoteAssetRequest(manifest,source.stem,assetBaseUrl());}
