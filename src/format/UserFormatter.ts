import type { User } from 'discord.js';

export class UserFormatter {
  public static format(user: User, option: string): string | null {
    switch (option.toLowerCase()) {
      case 'name':
      case 'username':
        return user.username;
      case 'discriminator':
        return user.discriminator;
      case 'globalname':
        return user.globalName;
      case 'id':
        return user.id;
      case 'tag':
        return user.tag;
      case 'avatarurl':
      case 'avatar':
        return user.displayAvatarURL();
      case 'mention':
        return `<@${user.id}>`;
      default:
        return null;
    }
  }
}
