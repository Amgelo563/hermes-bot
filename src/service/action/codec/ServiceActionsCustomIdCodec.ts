import type { Identifiable } from '@nyx-discord/core';
import { IdentifiableCustomIdCodec } from '@nyx-discord/framework';

import type { ServiceObjectType } from '../../ServiceObject';
import { ServiceActionCustomIdBuilder } from '../customId/ServiceActionCustomIdBuilder';

export class ServiceActionsCustomIdCodec<
  Data extends Identifiable<string>,
  Actions extends [string, ...string[]],
> extends IdentifiableCustomIdCodec<Data> {
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
      IdentifiableCustomIdCodec.DefaultSeparator,
      IdentifiableCustomIdCodec.DefaultMetadataSeparator,
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
      metadataSeparator: this.metadataSeparator,
    });
  }

  public createActionCustomId(
    objectId: number,
    action: Actions[number],
  ): string {
    return this.createActionBuilder(objectId, action).build();
  }

  public getSeparator(): string {
    return this.separator;
  }

  public getMetadataSeparator(): string {
    return this.metadataSeparator;
  }
}
