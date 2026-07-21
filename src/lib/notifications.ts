import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lahja reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 100, 150],
      lightColor: '#0f9a56',
    });
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

const MOTIVATIONAL_QUOTES = [
  "Ma tensa-ch, l-luğa katbani b-l-mumarasa — practice makes it stick.",
  "5 minutes today keeps your streak — and your Arabic — alive.",
  "Your grandmother would love to hear that new phrase you learned!",
  "Champions review yesterday's words before learning new ones.",
  "One lesson closer to sounding like a local.",
];

export async function scheduleDailyReminder(hour: number, minute: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for your Lahja lesson 🔥',
      body: quote,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleStreakDangerReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your streak is about to break! 😱',
      body: "Do one quick lesson before midnight to keep it alive.",
      data: { type: 'streak_danger' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 3,
      repeats: false,
    },
  });
}

export async function scheduleQuestReminder(questTitle: string, hoursFromNow: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Quest reminder',
      body: `Don't forget: "${questTitle}" is still waiting for you.`,
      data: { type: 'quest_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: hoursFromNow * 60 * 60,
      repeats: false,
    },
  });
}
