import { BlacklistMessagesSchema } from '../../../src/blacklist/message/read/BlacklistMessagesSchema';
import { testMessageFile } from './helpers/testMessageFile';

testMessageFile('blacklist', BlacklistMessagesSchema);
