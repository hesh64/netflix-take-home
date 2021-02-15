import config from 'config';

import { Device, DeviceMixin }    from './device';
import { DevId, IpAddressDevice } from '../model';
import { NotFoundError, Log }     from '../utils';

type CacheEntry = {
  stopUrl: string;
  logUrl: string;
}

@Log
export class TVDevice extends Device implements DeviceMixin {
  public async start(devId: DevId, params?: string): Promise<void> {
    if (!this.pool.has(devId)) {
      throw new NotFoundError(404);
    }
    // let's grab the config mapings for an tv Device
    const { baseurl, start } = config.get('urls.tv');
    // let's destruct the method, and uri out
    const { method, uri } = start;
    // let's try to checkout the device.
    const { ipAddr } = this.pool.get(devId) as IpAddressDevice;
    // interesting, i thought encodeURI wasn't safe..
    // todo: not to self- ask about this -- perhaps it's because it's a dummy system?
    const url = [ baseurl, uri ].join('');
    const body: { ipAddr: string, params?: string } = { ipAddr };
    if (params) {
      body.params = params;
    }
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, {
      ...this.headers, 'Content-Type': 'application/json'
    }, body);
    // let's start that device
    const result = await this.fetch(url, fetchConfig);
    // serialize the response
    const json = await result.json();
    this.cache.set(devId, { ...json } as CacheEntry);
  }

  public async stop(devId: DevId): Promise<void> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }

    if (!this.cache.has(devId)) {
      throw new NotFoundError(500, 'Missing Cache Entry');
    }
    // get the url from the cache entry.
    const entry: CacheEntry = this.cache.get(devId) as CacheEntry;
    const { stopUrl: url } = entry;
    // get the request configs.
    const fetchConfig = this.fetchConfig('POST', this.headers);
    // let's start that device
    const result = await this.fetch(url, fetchConfig);
    // serialize the response
    await result.text();
  }

  public async logs(devId: DevId): Promise<any> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }
    // if the id is not in the cache.
    if (!this.cache.has(devId)) {
      throw new NotFoundError(500, 'Missing Cache Entry');
    }
    // get the rul from teh cache entry.
    const { logUrl: url } = this.cache.get(devId) as CacheEntry;
    // get the request configs.
    const fetchConfig = this.fetchConfig('GET', this.headers);
    // let's start that device
    const result = await this.fetch(url, fetchConfig);
    // we wanna pipe the data back to the user.
    return result.body;
  }

  public checkinHook(devId: DevId): void {
    this.cache.delete(devId);
  }

  public checkoutHook(devId: DevId) {}
}
