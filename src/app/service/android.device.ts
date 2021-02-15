import config                     from 'config';
import { DevId, IpAddressDevice } from '../model';
import { NotFoundError, Log }     from '../utils';
import { Device }                 from './device';

@Log
export class AndroidDevice extends Device {
  public async start(devId: DevId, params?: string): Promise<void> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }
    // let's grab the config mappings for an android Device
    const { baseurl, start } = config.get('urls.android');
    // let's destruct the method, and uri out
    const { method, uri } = start;
    // let's try to checkout the device.
    const { ipAddr } = device as IpAddressDevice;
    // interesting, i thought encodeURI wasn't safe..
    // todo: not to self- ask about this -- perhaps it's because it's a dummy system?
    const url = [ baseurl, uri, `/${ encodeURI(ipAddr) }` ].join('');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers, params && { params });
    // let's start that device
    const result = await this.fetch(url, fetchConfig);
    // serialize the response
    await result.text();
  }

  public async stop(devId: DevId): Promise<void> {
    const device = this.pool.get(devId);
    // if not device then throw.
    if (!device) {
      throw new NotFoundError(404);
    }
    const { ipAddr } = device as IpAddressDevice;
    // let's grab the config mappings for an android Device
    const { baseurl, stop } = config.get('urls.android');
    // let's destruct the method, and uri out
    const { method, uri } = stop;
    // interesting, i thought encodeURI wasn't safe..
    // todo: not to self- ask about this -- perhaps it's because it's a dummy system?
    const url = [ baseurl, uri, `/${ encodeURI(ipAddr) }` ].join('');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers);
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
    const { ipAddr } = device as IpAddressDevice;
    // let's grab the config mappings for an android Device
    const { baseurl, logs } = config.get('urls.android');
    // let's destruct the method, and uri out
    const { method, uri } = logs;
    // interesting, i thought encodeURI wasn't safe..
    // todo: not to self- ask about this -- perhaps it's because it's a dummy system?
    const url = [ baseurl, uri, `/${ encodeURI(ipAddr) }` ].join('');
    // get the request configs.
    const fetchConfig = this.fetchConfig(method, this.headers);
    // let's start that device
    const result = await this.fetch(url, fetchConfig);
    // we wanna pipe the data back to the user.
    return result.body;
  }
}
