import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

/**
 * Line-icon system. The design brief is explicit: NO emoji for UI icons — use a consistent
 * line-icon set so the app reads as premium, not "AI-generated". National flags stay as emoji
 * (they're meaningful), but everything structural goes through here.
 *
 * Semantic names map to Material Community Icons glyphs so screens don't hard-code glyph names.
 */
export type IconName =
  | 'home'
  | 'learn'
  | 'streak'
  | 'profile'
  | 'settings'
  | 'chat'
  | 'freetalk'
  | 'review'
  | 'souk'
  | 'goal'
  | 'reminder'
  | 'notifications'
  | 'darkmode'
  | 'accessibility'
  | 'trophy'
  | 'diamond'
  | 'coins'
  | 'speak'
  | 'swap'
  | 'copy'
  | 'save'
  | 'play'
  | 'lock'
  | 'mic'
  | 'check'
  | 'chevronRight'
  | 'chevronLeft'
  | 'close'
  | 'plus'
  | 'send'
  | 'flag'
  | 'grammar'
  | 'lesson'
  | 'clock'
  | 'edit'
  | 'sound'
  | 'translate'
  | 'menu'
  | 'star';

const GLYPHS: Record<IconName, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  home: 'home-variant',
  learn: 'book-open-variant',
  streak: 'fire',
  profile: 'account',
  settings: 'cog-outline',
  chat: 'forum-outline',
  freetalk: 'headphones',
  review: 'cached',
  souk: 'storefront-outline',
  goal: 'flag-outline',
  reminder: 'alarm',
  notifications: 'bell-outline',
  darkmode: 'weather-night',
  accessibility: 'human',
  trophy: 'trophy-outline',
  diamond: 'diamond-stone',
  coins: 'cash',
  speak: 'volume-high',
  swap: 'swap-horizontal',
  copy: 'content-copy',
  save: 'bookmark-outline',
  play: 'play',
  lock: 'lock-outline',
  mic: 'microphone',
  check: 'check',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  close: 'close',
  plus: 'plus',
  send: 'arrow-up',
  flag: 'flag-variant-outline',
  grammar: 'help-circle-outline',
  lesson: 'clock-outline',
  clock: 'clock-outline',
  edit: 'pencil-outline',
  sound: 'volume-high',
  translate: 'translate',
  menu: 'dots-horizontal',
  star: 'star-outline',
};

interface Props {
  name: IconName;
  size?: number;
  color: string;
}

export function Icon({ name, size = 22, color }: Props) {
  return <MaterialCommunityIcons name={GLYPHS[name]} size={size} color={color} />;
}
