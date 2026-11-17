# ⛔ Blacklist Placeholders

The blacklist placeholders extract information about a specific blacklist and the blacklisted/blacklister users. They
start with `%blacklist_...%`.

| **Option**          | **Description**                                                                                                                                                                                                   | **Result example**      |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| **id**              | The blacklist's ID.                                                                                                                                                                                               | 1                       |
| **reason**          | The blacklist's reason.                                                                                                                                                                                           | Being a meanie.         |
| **createdAt_...**   | [Date placeholder type](../placeholder/types/date-placeholder-type.md) that displays the blacklist's creation date.                                                                                               | Depends on the options. |
| **expiresAt_...**   | [Date placeholder type](../placeholder/types/date-placeholder-type.md) that displays the blacklist's expiration date, or the value in the `permanent` setting in `blacklist.conf` message file if it's permanent. | Depends on the options. |
| **blacklister_...** | [Member placeholder type](../placeholder/types/member-placeholder-type.md) that displays the member that created the blacklist.                                                                                   | Depends on the options. |
| **blacklisted_...** | [Member placeholder type](../placeholder/types/member-placeholder-type.md) that displays the blacklisted member.                                                                                                  | Depends on the options. |
