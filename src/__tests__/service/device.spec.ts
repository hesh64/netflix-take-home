import { Cache, devicePool, DeviceType, IpAddressDevice, DeviceCheckinStatus, DeviceStatus } from '../../app/model';
import { Device }                                                                            from '../../app/service/device';
import { NotFoundError }                                                                     from '../../app/utils';

describe('Device', () => {
  class TestDevice extends Device {

  }

  it('should instantiate', () => {
    const testDevice = new TestDevice();

    expect(testDevice instanceof Device).toBeTruthy();
    expect(!!testDevice).toBeTruthy();
    expect(Reflect.get(testDevice, 'pool')).toEqual(devicePool);
    expect(Reflect.get(testDevice, 'cache') instanceof Cache).toBeTruthy();
  });

  describe('Checkout', () => {
    it(`Checkout(validId)`, async () => {
      const result = Device.Checkout<IpAddressDevice>('TV-SG-0000002');
      expect(result).toBeTruthy();
      expect(result.type).toEqual(DeviceType.Tv);
    });

    it(`Checkout(invalid)`, async () => {
      let threw;
      let _error;
      try {
        Device.Checkout<IpAddressDevice>('TV-SG-invalid');
      }
      catch (error) {
        threw = true;
        _error = error;
      }
      expect(threw).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it(`Checkout(validId) 2 times`, async () => {
      const result = Device.Checkout<IpAddressDevice>('TV-LG-0000001');
      expect(result).toBeTruthy();

      let threw;
      let _error;
      try {
        Device.Checkout<IpAddressDevice>('TV-LG-0000001');
      }
      catch (error) {
        threw = true;
        _error = error;
      }
      expect(threw).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });
  });

  describe('Checkin', () => {
    it(`Checkout(validId) then Checkin(validId)`, async () => {
      const result = Device.Checkout<IpAddressDevice>('AND-0000001');
      expect(result).toBeTruthy();
      expect(result.type).toEqual(DeviceType.Android);
      Device.Checkin(result.devId);
      const { status } = devicePool.get('AND-0000001') as DeviceCheckinStatus;
      expect(status).toEqual(DeviceStatus.CheckedIn);
    });

    it(`Checkin(invalidId)`, async () => {
      const result = Device.Checkin('some id that is not real');
      expect(result).toBeTruthy();
    });
  });

  describe(`Find(validId)`, () => {
    it('should return 1 id when searching using 1 param', async () => {
      const ids = await Device.Find({ type: DeviceType.Iphone });
      expect(ids.length).toEqual(1);
    });

    it('should return 1 id when searching using 2 params', async () => {
      const ids = await Device.Find({ type: DeviceType.Iphone, location: 'lab_e4' });
      expect(ids.length).toEqual(1);
    });

    it('should return nothing when searching with invalid param', async () => {
      //@ts-ignore
      const ids = await Device.Find({ dot: true });
      expect(ids.length).toEqual(0);
    });
    it('should return nothing when no device is found', async () => {
      const ids = await Device.Find({ devId: 'idofnothing' });
      expect(ids.length).toEqual(0);
    });
  });
});
