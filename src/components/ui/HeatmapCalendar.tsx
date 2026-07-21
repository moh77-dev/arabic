import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface HeatmapCalendarProps {
  data: Record<string, number>; // date "yyyy-mm-dd" -> minutes studied
  weeks?: number;
}

function intensityColor(minutes: number, primary: string, border: string) {
  if (minutes <= 0) return border;
  if (minutes < 5) return `${primary}44`;
  if (minutes < 15) return `${primary}88`;
  if (minutes < 30) return `${primary}cc`;
  return primary;
}

export function HeatmapCalendar({ data, weeks = 16 }: HeatmapCalendarProps) {
  const theme = useTheme();

  const columns = useMemo(() => {
    const today = new Date();
    const days: { date: string; minutes: number }[] = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, minutes: data[iso] ?? 0 });
    }
    const cols: { date: string; minutes: number }[][] = [];
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
    return cols;
  }, [data, weeks]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {columns.map((col, i) => (
          <View key={i} style={{ gap: 4 }}>
            {col.map((day) => (
              <View
                key={day.date}
                accessibilityLabel={`${day.minutes} minutes studied on ${day.date}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: intensityColor(day.minutes, theme.primary, theme.border),
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
