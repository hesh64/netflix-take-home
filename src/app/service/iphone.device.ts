import config from 'config';

import { Device }                  from './device';
import { DevId, UsbAddressDevice } from '../model';
import { NotFoundError, Log }      from '../utils';

@Log
export class IPhoneDevice extends Device {
  async start(devId: DevId, params?: string): Promise<void> {
    if (!this.pool.has(devId)) {
      throw new NotFoundError(404);
    }
    // let's grab the config mappings for an iphone Device
    const { baseurl, start } = config.get('urls.iphone');
    // let's destruct the method, and uri out
    const { method, uri } = start;
    const { usbAddr } = this.pool.get(devId) as UsbAddressDevice;
    // todo: note to self - ask about this -- perhaps it's because it's a dummy system?
    const url = [
      [ baseurl, uri ].join(''), encodeURI([ `id=${ usbAddr }`, params && `params=${ params }` ]
        .filter(Boolean).join('&'))
    ].join('?');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers);
    const result = await this.fetch(url, fetchConfig);
    await result.text();
  }

  async stop(devId: DevId): Promise<void> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }
    const { usbAddr } = device as UsbAddressDevice;
    // let's grab the config mappings for an iphone Device
    const { baseurl, stop } = config.get('urls.iphone');
    // let's destruct the method, and uri out
    const { method, uri } = stop;
    // todo: note to self - ask about this -- perhaps it's because it's a dummy system?
    const url = [ [ baseurl, uri ].join(''), encodeURI([ `id=${ usbAddr }` ].join('&')) ].join('?');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers);
    const result = await this.fetch(url, fetchConfig);
    await result.text();
  }

  async logs(devId: DevId): Promise<any> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }
    const { usbAddr } = device as UsbAddressDevice;
    // let's grab the config mappings for an iphone Device
    const { baseurl, logs } = config.get('urls.iphone');
    // let's destruct the method, and uri out
    const { method, uri } = logs;
    // todo: note to self - ask about this -- perhaps it's because it's a dummy system?
    const url = [ [ baseurl, uri ].join(''), encodeURI([ `id=${ usbAddr }` ].join('&')) ].join('?');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers);
    const result = await this.fetch(url, fetchConfig);
    return result.body;
  }
}
