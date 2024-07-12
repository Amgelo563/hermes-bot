import type { MetadatableCustomIdBuilderOptions } from '@nyx-discord/core';
import { MetadatableCustomIdBuilder } from '@nyx-discord/core';
import type { z } from 'zod';

import type { ServiceObjectType } from '../../ServiceObject';
import { ServiceObject } from '../../ServiceObject';

interface ServiceActionCustomIdBuilderOptions<Action>
  extends MetadatableCustomIdBuilderOptions {
  action: Action;
  serviceObject: ServiceObjectType;
}

export class ServiceActionCustomIdBuilder<
  Actions extends [string, ...string[]],
> extends MetadatableCustomIdBuilder {
  protected static readonly ObjectIndex = 0;

  protected static readonly ActionIndex = 1;

  protected serviceObject: ServiceObjectType;

  protected action: Actions[number];

  constructor(options: ServiceActionCustomIdBuilderOptions<Actions[number]>) {
    super(options);

    this.serviceObject = options.serviceObject;
    this.setMetaAt(
      ServiceActionCustomIdBuilder.ObjectIndex,
      this.serviceObject,
    );
    this.action = options.action;
    this.setMetaAt(ServiceActionCustomIdBuilder.ActionIndex, this.action);
  }

  public static fromServiceCustomId<
    const Actions extends [string, ...string[]],
  >(
    customId: string,
    separator: string,
    dataSeparator: string,
    enumType: z.ZodEnum<Actions>,
    objectType: ServiceObjectType,
  ): ServiceActionCustomIdBuilder<Actions> | null {
    const builder = MetadatableCustomIdBuilder.fromMetadatableString(
      customId,
      separator,
      dataSeparator,
    );
    if (!builder) return null;

    const objectString: string | null = builder.getMetaAt(
      ServiceActionCustomIdBuilder.ObjectIndex,
    );
    const parse = ServiceObject.safeParse(objectString);

    const object = parse.success
      ? (parse.data as ServiceObjectType)
      : undefined;

    if (!object || objectType !== object) {
      return null;
    }

    const actionString: string | null = builder.getMetaAt(
      ServiceActionCustomIdBuilder.ActionIndex,
    );

    const action = enumType.safeParse(actionString).success
      ? (actionString as Actions[number])
      : undefined;

    if (!action) {
      return null;
    }

    return new ServiceActionCustomIdBuilder({
      namespace: builder.getNamespace(),
      objectId: builder.getObjectId(),
      metadataSeparator: dataSeparator,
      separator,
      action: action,
      serviceObject: object,
    });
  }

  public getAction(): Actions[number] {
    return this.action;
  }

  public setAction(action: Actions[number]): this {
    this.setMetaAt(ServiceActionCustomIdBuilder.ActionIndex, action);
    this.action = action;

    return this;
  }

  public getServiceObject(): ServiceObjectType {
    return this.serviceObject;
  }

  public setServiceObject(serviceObject: ServiceObjectType): this {
    this.setMetaAt(ServiceActionCustomIdBuilder.ObjectIndex, serviceObject);
    this.serviceObject = serviceObject;

    return this;
  }

  public clone(): ServiceActionCustomIdBuilder<Actions> {
    return new ServiceActionCustomIdBuilder({
      namespace: this.namespace,
      action: this.action,
      objectId: this.objectId,
      metadataSeparator: this.metaSeparator,
      separator: this.separator,
      serviceObject: this.serviceObject,
    });
  }
}
