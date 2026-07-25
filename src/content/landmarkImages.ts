import type { ImageSourcePropType } from 'react-native';
import type { LandmarkKind } from './dialectBackdrops';

/**
 * Real landmark photos, keyed by landmark kind. EMPTY BY DEFAULT — the app falls back to the
 * vector silhouettes in LandmarkSilhouette.tsx until photos are supplied.
 *
 * To use real images: drop files into assets/images/landmarks/ (see the README there) and
 * uncomment the matching lines below. Metro requires a *static* require() path, so every image
 * must be listed here literally — you can't build the path dynamically.
 *
 * Example once you've added assets/images/landmarks/cairo.jpg:
 *   cairo: require('../../assets/images/landmarks/cairo.jpg'),
 */
export const LANDMARK_IMAGES: Partial<Record<LandmarkKind, ImageSourcePropType>> = {
  // Every dialect uses the same treatment — its landmark silhouette on the country's own color
  // (the "El Oued look"). Register a photo here only if you want to override that for one dialect.
  // martyrs_memorial: require('../../assets/images/landmarks/martyrs_memorial.jpg'),
  // domes: require('../../assets/images/landmarks/domes.jpg'),
  // minaret: require('../../assets/images/landmarks/minaret.jpg'),
  // koutoubia: require('../../assets/images/landmarks/koutoubia.jpg'),
  // sidibou: require('../../assets/images/landmarks/sidibou.jpg'),
  // roman_arch: require('../../assets/images/landmarks/roman_arch.jpg'),
  // cairo: require('../../assets/images/landmarks/cairo.jpg'),
  // umayyad: require('../../assets/images/landmarks/umayyad.jpg'),
  // dome_of_rock: require('../../assets/images/landmarks/dome_of_rock.jpg'),
  // cedar: require('../../assets/images/landmarks/cedar.jpg'),
  // petra: require('../../assets/images/landmarks/petra.jpg'),
  // kaaba_tower: require('../../assets/images/landmarks/kaaba_tower.jpg'),
  // burj: require('../../assets/images/landmarks/burj.jpg'),
  // malwiya: require('../../assets/images/landmarks/malwiya.jpg'),
  // meroe: require('../../assets/images/landmarks/meroe.jpg'),
  // sanaa: require('../../assets/images/landmarks/sanaa.jpg'),
};

export function getLandmarkImage(kind: LandmarkKind): ImageSourcePropType | null {
  return LANDMARK_IMAGES[kind] ?? null;
}
