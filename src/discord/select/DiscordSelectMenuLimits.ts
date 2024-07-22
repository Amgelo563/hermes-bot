// https://discord.com/developers/docs/interactions/message-components#select-menus
export const DiscordSelectMenuLimits = {
  Placeholder: 100,
  Option: {
    Max: 25,
    Label: 100,
    Description: 100,
  },
} as const;
