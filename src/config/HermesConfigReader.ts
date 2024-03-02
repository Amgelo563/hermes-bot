import { FileReader } from '../file/FileReader';
import { HermesConfigSchema } from './HermesConfigSchema';
import { HermesConfigWrapper } from './HermesConfigWrapper';

export class HermesConfigReader extends FileReader<typeof HermesConfigSchema> {
  constructor() {
    super('config', HermesConfigSchema);
  }

  public async readAndWrap(): Promise<HermesConfigWrapper> {
    const read = await this.read();

    return new HermesConfigWrapper(read);
  }
}
