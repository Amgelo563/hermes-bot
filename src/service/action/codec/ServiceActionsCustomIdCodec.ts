import type { Identifiable } from '@nyx-discord/core';
import { BasicCustomIdCodec } from '@nyx-discord/framework';

import type { ServiceObjectType } from '../../ServiceObject';
import { ServiceActionCustomIdBuilder } from '../customId/ServiceActionCustomIdBuilder';

export class ServiceActionsCustomIdCodec<
  Data extends Identifiable<string>,
  Actions extends [string, ...string[]],
> extends BasicCustomIdCodec<Data> {
  public static readonly DefaultNamespace = 'SACT';

  protected readonly serviceObject: ServiceObjectType;

  constructor(
    namespace: string,
    separator: string,
    dataSeparator: string,
    serviceObject: ServiceObjectType,
  ) {
    super(namespace, separator, dataSeparator);
    this.serviceObject = serviceObject;
  }

  public static createActions<
    Data extends Identifiable<string>,
    Actions extends [string, ...string[]],
  >(
    serviceObject: ServiceObjectType,
  ): ServiceActionsCustomIdCodec<Data, Actions> {
    return new ServiceActionsCustomIdCodec(
      ServiceActionsCustomIdCodec.DefaultNamespace,
      BasicCustomIdCodec.DefaultSeparator,
      BasicCustomIdCodec.DefaultDataSeparator,
      serviceObject,
    );
  }

  public createActionBuilder(
    objectId: number,
    action: Actions[number],
  ): ServiceActionCustomIdBuilder<Actions> {
    return new ServiceActionCustomIdBuilder({
      action,
      serviceObject: this.serviceObject,
      objectId: objectId.toString(),
      namespace: this.namespace,
      separator: this.separator,
      dataSeparator: this.dataSeparator,
    });
  }

  public createActionCustomId(
    objectId: number,
    action: Actions[number],
  ): string {
    return this.createActionBuilder(objectId, action).build();
  }

  public getNamespace(): string {
    return this.namespace;
  }

  public getSeparator(): string {
    return this.separator;
  }

  public getDataSeparator(): string {
    return this.dataSeparator;
  }
}
