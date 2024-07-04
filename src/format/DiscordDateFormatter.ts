import { time, TimestampStyles } from 'discord.js';

export class DiscordDateFormatter {
  public static format(date: Date, format: string): string | null {
    const style = format
      ? Object.values(TimestampStyles).find((style) => format === style)
      : TimestampStyles.ShortDateTime;

    if (!style) {
      return null;
    }

    return time(date, style);
  }
}
