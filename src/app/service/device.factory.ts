import { SearchParams, DeviceType, DevId } from '../model';
import { UnsupportedKeyError, Log }        from '../utils';
import { Device, DeviceMixin }             from './device';
import { IPhoneDevice }                    from './iphone.device';
import { TVDevice }                        from './tv.device';
import { AndroidDevice }                   from './android.device';

/**
 *
 * mapping type to constructors.
 *
 * @type {{'[DeviceType.Tv]': TVDevice, '[DeviceType.Android]': AndroidDevice, '[DeviceType.Iphone]': IPhoneDevice}}
 */
export const DeviceCtors = {
  [DeviceType.Iphone]: IPhoneDevice,
  [DeviceType.Android]: AndroidDevice,
  [DeviceType.Tv]: TVDevice,
};

// dynamically generate the keys.
// move that into the build step. In an actual framework we can drive the generation of the all
// different typings from a few base ones. The more you automate the less room for error.
/**
 * enum {
 *   Android: AND
 *   IPhone: IPH
 *   Tv: TV
 * }
 *
 */
  // @ts-ignore
const KeyFormatToType: { [key: string]: string } = {};
for (const k in DeviceType) {
  KeyFormatToType[DeviceType[k].slice(0, 3).toUpperCase()] = k;
}

/**
 * match anything that's char up to the '-'
 * @type {RegExp}
 */
  // generate the regex mapping ones. Regex is expensive.
const R = /.*(?=-)/;

/**
 * 1) you can search a device using it's properties --
 * 2) you can start the device using the returned device id -- this checks it out of the pool for you
 * 3) you can stop it using it's id -- checks it back into the pool
 * 4) you have the option to call the logs method at any point because those are the instruction
 * provided otherwise i would argue that we should add a cool down state for devices during which
 * a user can call to collect their logs
 *
 * todo: not to self-  consider it / offer it but disable the functionality.
 *
 * The device factory class implements the device interface
 *
 * it will exchange a callers Id for it's type, then proceed to initialize an instance of that class.
 *
 *
 *
 *
 */
@Log
export class DeviceFactory<T extends Device> /*implements Device*/ {
  private devices: { [k in keyof DeviceType]: T } | {} = {};

  constructor() {}

  init() {
    // where type meets object
    for (const k in DeviceType) {
      this.devices[k] = new DeviceCtors[DeviceType[k]];
    }
  }

  private instance<T extends Device>(id: DevId): T {
    /**
     * ok so we have 2 options.
     * 1) I can look up the type of a device using it's id and based on that call the correct factory.
     * 2) I can check the key format to detect the device type.
     *
     * in a realistic system both are possible. However, in the long run things tend to shift to the 2nd
     * option. Lookups turn slower, and more expensive.
     *
     *
     * we have 3 main models.
     * 1) iPhone - IPH
     * 2) TV - TV
     * 3) Android - AND
     *
     */
    const substrId = id.slice(0, 4);
    const destructed = substrId.match(R);

    // there will be some typing complaints because
    // I am dynamically generating the KeyFormatToType
    if (destructed) {
      const [ type ] = destructed;
      switch (DeviceType[KeyFormatToType[type]] as DeviceType) {
        // @ts-ignore
        case DeviceType.Tv: {
          return this.devices[KeyFormatToType[type]];
          break;
        }

        case DeviceType.Android: {
          // @ts-ignore
          return this.devices[KeyFormatToType[type]];
          break;
        }

        // @ts-ignore
        case DeviceType.Iphone: {
          // @ts-ignore
          return this.devices[KeyFormatToType[type]];
          break;
        }

        //
        default: {
          // typescript complains with some of the typing..
          // that's why the throw statement isn't in here.
          break;
        }
      }
    }

    throw new UnsupportedKeyError(400);
  }

  /**
   *
   * @param id
   * @param params
   * @returns {Promise<any>}
   */
  public async start(id: DevId, params: string | undefined = undefined): Promise<any> {
    return this.instance(id).start(id, params);
  }

  public async stop(id: DevId): Promise<any> {
    return this.instance(id).stop(id);
  }

  public async logs(id: DevId): Promise<any> {
    return this.instance(id).logs(id);
  }

  /**
   * This method applies checkin traps traps in addition to checkin
   *
   * @param id
   * @returns {Promise<void>}
   */
  public checkin(id: DevId) {
    const status = DeviceFactory.Checkin(id);
    const inst = this.instance(id);
    if ('checkinHook' in inst) {
      (inst as DeviceMixin).checkinHook(id);
    }
    return status;
  }

  public checkout<T>(id: DevId) {
    const device = DeviceFactory.Checkout<T>(id);
    const inst = this.instance(id);
    if ('checkoutHook' in inst) {
      (inst as DeviceMixin).checkoutHook(id);
    }
    return device;
  }

  public async find(searchProperties: Partial<SearchParams>) {
    return DeviceFactory.Find(searchProperties);
  }

  /**
   * Made it async to give it a more real feel..
   *
   * I feel it's appropriate to return an array with a single id
   * when a device is found, and an empty array when nothing is found
   *
   * @param {Partial<SearchParams>} searchProperties
   * @returns {Promise<string>}
   *
   */
  public static async Find(searchProperties: Partial<SearchParams>) {
    return Device.Find(searchProperties);
  }

  /**
   * Checkout a device from the pool
   *
   * @param id
   * @returns {Omit<T, "status">}
   * @constructor
   */
  public static Checkout<T>(id) {
    return Device.Checkout<T>(id);
  }

  /**
   * Check device back into the pool.
   *
   * @param id
   * @returns {true}
   * @constructor
   */
  public static Checkin(id) {
    return Device.Checkin(id);
  }
}
