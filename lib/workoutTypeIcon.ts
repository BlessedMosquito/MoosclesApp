import {
  Icon,
  IconActivity,
  IconBallBaseball,
  IconBallBasketball,
  IconBallBowling,
  IconBallFootball,
  IconBallTennis,
  IconBallVolleyball,
  IconBarbell,
  IconBike,
  IconDumbbell,
  IconFlame,
  IconGolf,
  IconHeartbeat,
  IconHorse,
  IconJumpRope,
  IconKarate,
  IconKayak,
  IconMountain,
  IconPingPong,
  IconRollerSkating,
  IconRoute,
  IconRun,
  IconSailboat,
  IconScubaMask,
  IconSkateboard,
  IconSkiJumping,
  IconStairs,
  IconStopwatch,
  IconStretching,
  IconSwimming,
  IconSwords,
  IconTreadmill,
  IconTrekking,
  IconWalk,
  IconYoga,
} from '@tabler/icons-react';
import { WorkoutTypeGroup } from '@/services/workoutTypes';

const KEYWORD_ICONS: [string[], Icon][] = [
  [['treadmill', 'bieżni'], IconTreadmill],
  [
    [
      'run',
      'jog',
      'sprint',
      'marathon',
      'endurance',
      'bieg',
      'maraton',
      'wytrzym',
    ],
    IconRun,
  ],
  [['bike', 'cycl', 'spin', 'rower', 'kolarst'], IconBike],
  [['swim', 'water', 'aqua', 'pływ', 'basen', 'wodn'], IconSwimming],
  [
    ['hik', 'trek', 'nordic', 'outdoor', 'nature', 'wędrów', 'teren', 'plener'],
    IconTrekking,
  ],
  [['walk', 'spacer', 'marsz', 'chód'], IconWalk],
  [['climb', 'boulder', 'mountain', 'wspin', 'górsk'], IconMountain],
  [['yoga', 'mind', 'balance', 'joga', 'równowag'], IconYoga],
  [
    ['stretch', 'mobility', 'flex', 'pilates', 'rozciąg', 'mobilnoś', 'gibk'],
    IconStretching,
  ],
  [['row', 'kayak', 'canoe', 'paddl', 'wiosł', 'kajak'], IconKayak],
  [['jump rope', 'skipping', 'skakank'], IconJumpRope],
  [['ski', 'snowboard', 'winter', 'snow', 'nart', 'zimow'], IconSkiJumping],
  [['skateboard', 'deskorolk'], IconSkateboard],
  [['skat', 'rolk', 'łyżw'], IconRollerSkating],
  [['ping', 'table tennis', 'tenis stołow'], IconPingPong],
  [['tennis', 'squash', 'padel', 'badminton', 'tenis'], IconBallTennis],
  [['volleyball', 'siatk'], IconBallVolleyball],
  [['basketball', 'koszyk'], IconBallBasketball],
  [['football', 'soccer', 'piłka nożna', 'piłk'], IconBallFootball],
  [['baseball'], IconBallBaseball],
  [['bowling', 'kręgl'], IconBallBowling],
  [['golf'], IconGolf],
  [['horse', 'riding', 'jeździect', 'konn'], IconHorse],
  [['fenc', 'szerm'], IconSwords],
  [['sail', 'żegl'], IconSailboat],
  [['div', 'nurk'], IconScubaMask],
  [
    [
      'box',
      'kick',
      'karate',
      'judo',
      'martial',
      'mma',
      'bjj',
      'combat',
      'fight',
      'sztuk walk',
      'sporty walk',
    ],
    IconKarate,
  ],
  [['stair', 'step', 'schod'], IconStairs],
  [['hiit', 'tabata', 'crossfit', 'circuit', 'obwod'], IconFlame],
  [['cardio', 'aerob', 'kardio'], IconHeartbeat],
  [['dumbbell', 'hantl'], IconDumbbell],
  [
    [
      'strength',
      'gym',
      'weight',
      'lift',
      'power',
      'bodybuild',
      'push',
      'pull',
      'leg',
      'chest',
      'shoulder',
      'siłow',
      'siłown',
      'trening siłowy',
    ],
    IconBarbell,
  ],
  [
    ['sport', 'team', 'ball', 'game', 'gry', 'zespoł', 'drużyn'],
    IconBallFootball,
  ],
];

const GROUP_ICONS: Record<WorkoutTypeGroup, Icon> = {
  DistanceDuration: IconRoute,
  DurationOnly: IconStopwatch,
  RepetitionBased: IconBarbell,
};

const KEYWORD_PATTERNS: [RegExp, Icon][] = KEYWORD_ICONS.map(
  ([keywords, icon]) => [
    new RegExp(`(^|[^\\p{L}])(${keywords.join('|')})`, 'iu'),
    icon,
  ]
);

export function getWorkoutTypeIcon(name: string, group?: string | null): Icon {
  const match = KEYWORD_PATTERNS.find(([pattern]) => pattern.test(name));
  if (match) return match[1];

  return GROUP_ICONS[group as WorkoutTypeGroup] ?? IconActivity;
}
