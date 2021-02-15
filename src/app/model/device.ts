import _       from 'lodash';
import { Log } from '../utils';

// todo pull this all together later.
const deviceList = require('../../../devices.json');

/**
 *
 * This is obviously not a real pool, or a complete pool implementation.
 *
 * The reason I chose to go with a pool implementation was because we don't
 * really a have a data source, so it seemed reasonable to pretend like this is
 * a set of devices that we loaded from some remote source. We could even expand
 * this to support growing and shrinking the pool depending on the count of
 * checked out /checked in devices.
 *
 * It also seemed to work nicely with the use case because it offers a nice way to
 * limit a device usage
 *
 *
 *
 */

export enum DeviceStatus {
  CheckedIn = 'checkedIn',
  CheckedOut = 'checkedOut'
}

export enum DeviceType {
  Iphone = 'iphone',
  Android = 'android',
  Tv = 'tv'
}

interface Device {
  devId: string,
  type: DeviceType,
  location: string,
}

export interface DeviceCheckinStatus {
  status: DeviceStatus
}

export interface IpAddressDevice extends Device {
  ipAddr: string
}

export interface UsbAddressDevice extends Device {
  usbAddr: string
}

export type SearchParams = {
  [k in keyof UsbAddressDevice]: UsbAddressDevice[k]
} | {
  [k in keyof IpAddressDevice]: IpAddressDevice[k]
}

export type DevId = string;
type InternalSearchParams = { status: DeviceStatus }

type MappedDevice = ([ DevId, (IpAddressDevice & DeviceCheckinStatus) | (UsbAddressDevice & DeviceCheckinStatus) ]);

/**
 * some thoughts -- Maybe worth making this more generic
 */
@Log
export class DevicePool extends Map<string, (IpAddressDevice & DeviceCheckinStatus | UsbAddressDevice & DeviceCheckinStatus)> {
  /**
   * compare two objects.
   *
   * @param device
   * @param searchParams
   * @returns {boolean}
   * @protected
   */
  protected match(device, searchParams): boolean {
    // get the keeeeeeeyssssss
    // important to grab the keys of the search params not the object
    const keys = Object.keys(searchParams);
    // if no keys we passed
    // either you have keys you wanna compare or please don't call this method
    if (!keys.length) {
      throw new Error('Invalid Search Params');
    }

    // check for every key in the search params.
    for (let i = 0; i < keys.length; i++) {
      //
      if (device[keys[i]] !== searchParams[keys[i]]) {
        return false;
      }
    }

    // all good return true.
    return true;
  }

  /**
   * just a nice way to share some logic between the find and the checkout method.
   *
   * This will return a device that's checkout or in - anything goes
   */
  protected _find(searchParams: Partial<SearchParams & InternalSearchParams>): [ string, IpAddressDevice | UsbAddressDevice ] | null {
    for (const [ id, device ] of this) {
      if (this.match(device, searchParams)) {
        return [ id, device ];
      }
    }

    // didn't find anything sorry bud.
    return null;
  }

  constructor(iterable: (UsbAddressDevice & { devId: DevId } | IpAddressDevice & { devId: DevId }) []) {
    const mappedDeviceList: MappedDevice[] = iterable.map(device => ([
      device.devId, {
        ...device,
        status: DeviceStatus.CheckedIn,
      }
    ]));

    // pass that to the parent constructor
    super(mappedDeviceList);
  }

  /**
   * find a device available to checkout that matches the search category
   * @param searchParams
   * @returns {any}
   */
  public find(searchParams: Partial<SearchParams>): (UsbAddressDevice | IpAddressDevice) & { devId: DevId } | null {
    // add a useful filter for just checked in items
    const params = { ...searchParams, status: DeviceStatus.CheckedIn };
    const result = this._find(params);
    if (result) {
      const [ devId, device ] = result;
      // you never wanna return a reference to an internal object.
      // this is enough for us because the object is flat. Otherwise
      // we'd probably want a more thought out method.
      return { ...device, devId };
    }

    return null;
  }

  /**
   * when you have found the device you'd like to checkout check it out. -- when it feels right you gotta do it.
   * @param devId
   */
  public checkout<T>(devId: DevId): false | Omit<T, 'status'> | null {
    // You either find nothing (get null) or find an item
    // that item can either be checked in or checked out
    const device = this.get(devId);
    // yay we found something
    if (device) {
      // is it checkout tho?
      if (device.status == DeviceStatus.CheckedOut) {
        return false;
      }

      // well now it is.
      device.status = DeviceStatus.CheckedOut;
      return _.omit(device, [ 'status' ]) as Omit<T, 'status'>;
    }

    // I found nothing
    return null;
  }

  /**
   * Check back a device:
   * 1) look up the devId,
   * 2) if the device exists, set the status to checked in
   * 3) return true
   *
   * @returns {Boolean}
   * @param devId
   */
  // the return type is 'true' because the method will never return anything else
  public checkin(devId: DevId): true {
    const device = this.get(devId);
    if (device) {
      device.status = DeviceStatus.CheckedIn;
    }

    return true;
  }
}


// return a singleton instance
export const devicePool = new DevicePool(deviceList);
