# 📅 Date Placeholder Type

The date placeholder type allows you to display a specific date using Discord's timestamp format.

> [!TIP]
> Given this uses Discord's native timestamps, the date will be formatted according to the user's locale.

| **Option** | **Description**                                                          | **Result example**           |
|------------|--------------------------------------------------------------------------|------------------------------|
| **t**      | Short time format, consisting of hours and minutes.                      | 16:20                        |
| **T**      | Long time format, consisting of hours, minutes, and seconds.             | 16:20:30                     |
| **d**      | Short date format, consisting of day, month, and year.                   | 20/04/2021                   |
| **D**      | Long date format, consisting of day, month, and year.                    | 20 April 2021                |
| **f**      | Short date-time format, consisting of short date and short time formats. | 20 April 2021 16:20          |
| **F**      | Long date-time format, consisting of long date and short time formats.   | Tuesday, 20 April 2021 16:20 |
| **R**      | Relative time format, consisting of a relative duration format.          | 2 months ago                 |

> [!WARNING]
> Options are case-sensitive, since a different case means a different format.
> Usually the lower case means short, and the upper case means long.

## 👀 Examples

- `%offer_createdAt_t%` - Displays an offer's creation date, in short time format
- `%request_lastPostedAt_D%` - Displays a request's last post date, in long time format
- `%blacklist_expiresAt_R%` - Displays a blacklist's expiration date, in relative time format
