type Key = string

/**
 * Cache -- just some class to use an a cache in different layers of the application
 *
 * -- for example i will be using it in the controller
 * -- for example i will be using it in the device
 */
export class Cache<T> extends Map<Key, T> {
  constructor() {super();}
}
