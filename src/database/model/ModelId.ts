export type ModelId<Model> = Model extends { id: infer Id } ? Id : never;
