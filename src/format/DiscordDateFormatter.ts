import { time, TimestampStyles } from 'discord.js';

export class DiscordDateFormatter {
  public static format(date: Date, format: string): string | null {
    const style = Object.values(TimestampStyles).find(
      (style) => format === style,
    );

    if (!style) {
      return null;
    }

    return time(date, style);
  }
}
