import type { HermesMember } from '../service/member/HermesMember';

export class HermesMemberFormatter {
  public static format(member: HermesMember, option: string): string | null {
    switch (option.toLowerCase()) {
      case 'name':
      case 'username':
        return member.username;
      case 'discriminator':
        return member.discriminator;
      case 'globalname':
        return member.globalName;
      case 'id':
        return member.id;
      case 'tag':
        return member.tag;
      case 'avatarurl':
      case 'avatar':
        return member.avatar;
      case 'mention':
        return `<@${member.id}>`;
      default:
        return null;
    }
  }
}
