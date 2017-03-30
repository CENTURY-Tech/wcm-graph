import { IKeyValue, makeCaseInsensitive } from "../../../utilities/utilities";

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const relationsMap = new WeakMap<Object, IKeyValue<IKeyValue<any>>>();

export function getRelations(key: Object): IKeyValue<IKeyValue<any>> {
  return makeCaseInsensitive(relationsMap.get(key));
}

export function setRelations(key: Object, value: IKeyValue<IKeyValue<any>>): void {
  relationsMap.set(key, value);
}
