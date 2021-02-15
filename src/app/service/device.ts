import config    from 'config';
import NodeFetch from 'node-fetch';

import { devicePool, DevId, Cache, SearchParams } from '../model';
import { Log, CustomError, NotFoundError }        from '../utils';

/**
 * The contract. You wanna be a device, you gotta comply with this
 */
export interface Device {
  start(devId: DevId, params?: string): Promise<void>;

  stop(devId: DevId): Promise<void>

  logs(devId: DevId): Promise<any>; // type streamable
}

/**
 * it's not a true mixing. But perhaps we can later expand on this
 * and turn into into a more solid mixing pattern
 */
export interface DeviceMixin {
  // cool stuff
  checkinHook(devId: DevId): void

  checkoutHook(devId: DevId): void
}

// some typing
type Method = 'POST' | 'GET';
type Headers = { [key: string]: string };
type JSON = null | undefined | number | string | object | JSON[];

/**
 * fetch config interface
 */
export interface FetchConfig {
  method: Method;
  headers: Headers;
  body?: string;
  json: boolean;
  timeout?: number;
}

/**
 * Let's go with a base abstract class.
 *
 * extend every implementation class with it, then combine them all with a factory class.
 *
 */
@Log
export abstract class Device {
  // this is a cache layer.
  protected cache = new Cache();
  // this is the device pool.
  // something like this would usually be dep injected
  protected pool = devicePool;

  protected get headers() {
    return {
      'client-id': config.get('apiKey')
    };
  }

  /**
   * Generate the configs of a fetch request
   *
   * @param {Method} method
   * @param {Headers} headers
   * @param body
   * @returns {FetchConfig}
   * @protected
   */
  protected fetchConfig(method: Method, headers: Headers, body?: JSON): FetchConfig {
    const configf: Partial<FetchConfig> = { method, headers, };
    if (body) {
      configf.body = JSON.stringify(body);
    }
    configf.json = !!config.body;
    configf.timeout = config.get('request').timeout;
    return <FetchConfig>configf;
  }

  /**
   * throw in a url and a config - Badabing Badaboom - you got a request going.
   *
   * if status code is not between 200-299 then we throw!
   *
   * @param {string} url
   * @param {FetchConfig} config
   * @returns {Promise<Response>}
   * @protected
   */
  protected async fetch(url: string, config: FetchConfig) {
    const response = await NodeFetch(url, config);
    if (response.ok) {
      return response;
    }

    throw new CustomError(response.status, response.statusText);
  }

  // implement
  public async start(devId: DevId, params?: string): Promise<void> {}

  // implement
  public async stop(devId: DevId): Promise<void> {}

  // implement
  public async logs(devId: DevId): Promise<any> {}

  /**
   * Checkout a device with devId
   *
   *
   * @param {string} devId
   * @returns {Omit<T, "status">}
   * @protected
   */
  public static Checkout<T>(devId: DevId): Omit<T, 'status'> {
    const device = devicePool.checkout<T>(devId);
    if (!device) {
      // bad news.
      throw new NotFoundError(404, 'Device No Longer Available');
    }

    return device;
  }

  /**
   * check in device with devId
   *
   * @param {string} devId
   * @returns {true}
   * @protected
   */
  public static Checkin(devId: DevId) {
    return devicePool.checkin(devId);
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
    const found = devicePool.find(searchProperties);
    if (found) {
      return [ found.devId ];
    }

    return [];
  }
}
