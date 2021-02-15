import sinon                                                                          from 'sinon';
import { DeviceCheckinStatus, devicePool, DeviceStatus, DeviceType, IpAddressDevice } from '../../app/model';
import { DeviceFactory as DF }                                                        from '../../app/service';
import { Device }                                                                     from '../../app/service/device';
import { NotFoundError, UnsupportedKeyError }                                         from '../../app/utils';

const { DeviceFactory } = DF;

describe('DeviceFactory', () => {
  let sandbox = sinon.createSandbox();
  beforeEach(() => {
    sandbox.restore();
  });

  it('should instantiate', () => {
    expect(new DeviceFactory()).toBeTruthy();
  });

  it('should instantiate, then initialize', () => {
    const df = new DeviceFactory();
    expect(Object.keys(Reflect.get(df, 'devices')).length).toEqual(0);
    df.init();

    expect(df).toBeTruthy();
    expect(Object.keys(Reflect.get(df, 'devices')).length).toEqual(3);
  });

  describe('Checkout', () => {
    it(`Checkout(validId)`, async () => {
      const result = DeviceFactory.Checkout<IpAddressDevice>('TV-SG-0000002');
      expect(result).toBeTruthy();
      expect(result.type).toEqual(DeviceType.Tv);
    });

    it(`Checkout(invalid)`, async () => {
      let threw;
      let _error;
      try {
        DeviceFactory.Checkout<IpAddressDevice>('TV-SG-invalid');
      }
      catch (error) {
        threw = true;
        _error = error;
      }
      expect(threw).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it(`Checkout(validId) 2 times`, async () => {
      const result = DeviceFactory.Checkout<IpAddressDevice>('TV-LG-0000001');
      expect(result).toBeTruthy();

      let threw;
      let _error;
      try {
        DeviceFactory.Checkout<IpAddressDevice>('TV-LG-0000001');
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
      const result = DeviceFactory.Checkout<IpAddressDevice>('AND-0000001');
      expect(result).toBeTruthy();
      expect(result.type).toEqual(DeviceType.Android);
      DeviceFactory.Checkin(result.devId);
      const { status } = devicePool.get('AND-0000001') as DeviceCheckinStatus;
      expect(status).toEqual(DeviceStatus.CheckedIn);
    });

    it(`Checkin(invalidId)`, async () => {
      const result = DeviceFactory.Checkin('some id that is not real');
      expect(result).toBeTruthy();
    });
  });

  describe('Find', () => {
    describe(`Find(validId)`, () => {
      it('should return 1 id when searching using 1 param', async () => {
        const ids = await DeviceFactory.Find({ type: DeviceType.Iphone });
        expect(ids.length).toEqual(1);
      });

      it('should return 1 id when searching using 2 params', async () => {
        const ids = await DeviceFactory.Find({ type: DeviceType.Iphone, location: 'lab_e4' });
        expect(ids.length).toEqual(1);
      });

      it('should return nothing when searching with invalid param', async () => {
        //@ts-ignore
        const ids = await DeviceFactory.Find({ dot: true });
        expect(ids.length).toEqual(0);
      });
      it('should return nothing when no device is found', async () => {
        const ids = await DeviceFactory.Find({ devId: 'idofnothing' });
        expect(ids.length).toEqual(0);
      });
    });
  });

  describe('start', () => {
    beforeEach(() => {
      sandbox.restore();
      // @ts-ignore
      sandbox.stub(Device.prototype, 'fetch').returns({
        //@ts-ignore
        text: async () => {return '';},
        //@ts-ignore
        json: async () => {
          return {
            stopUrl: 'stopstop.stop',
            logUrl: 'loglog.log'
          };
        }
      });
    });

    it('should evaluate the id as an iphone id then proceed to call the iphone.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Iphone'], 'start');

      const devId = 'IPH-0000001';
      await deviceFactory.start(devId);


      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Iphone'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Iphone'].start.calledOnce).toBeTruthy();
    });

    it('should evaluate the id as an iphone id then proceed to call the android.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();

      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Android'], 'start');

      const devId = 'AND-0000004';
      await deviceFactory.start(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Android'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Android'].start.calledOnce).toBeTruthy();
    });

    it('should evaluate the id as a tv id then proceed to call the tv.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Tv'], 'start');

      const devId = 'TV-TCL-0000003';
      await deviceFactory.start(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Tv'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Tv'].start.calledOnce).toBeTruthy();
    });

    it('should throw UnsupportedKeyError', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      const devId = 'AirFryer5000';
      let _error;
      try {
        await deviceFactory.start(devId);
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof UnsupportedKeyError).toBeTruthy();
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      sandbox.restore();
      // @ts-ignore
      sandbox.stub(Device.prototype, 'fetch').returns({
        //@ts-ignore
        text: async () => {return '';},
        //@ts-ignore
        json: async () => {return '';}
      });
    });

    it('should evaluate the id as an iphone id then proceed to call the iphone.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Iphone'], 'stop');

      const devId = 'IPH-0000001';
      await deviceFactory.stop(devId);


      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Iphone'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Iphone'].stop.calledOnce).toBeTruthy();
    });

    it('should evaluate the id as an iphone id then proceed to call the android.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();

      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Android'], 'stop');

      const devId = 'AND-0000004';
      await deviceFactory.stop(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Android'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Android'].stop.calledOnce).toBeTruthy();
    });

    it('should evaluate the id as a tv id then proceed to call the tv.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Tv'], 'stop');

      const devId = 'TV-TCL-0000003';

      // todo: special condition with tvs, as they have a cache entry don't forget to add it
      const tvRef = Reflect.get(deviceFactory, 'devices')['Tv'];
      Reflect.get(tvRef, 'cache').set(devId, {
        stopUrl: 'stop.staaap.pls',
      });

      await deviceFactory.stop(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Tv'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Tv'].stop.calledOnce).toBeTruthy();
    });

    it('should throw UnsupportedKeyError', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      const devId = 'AirFryer5000';
      let _error;
      try {
        await deviceFactory.stop(devId);
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof UnsupportedKeyError).toBeTruthy();
    });
  });

  describe('logs', () => {
    let res;
    beforeEach(() => {
      sandbox.restore();
      res = {
        //@ts-ignore
        text: async () => {return '';},
        //@ts-ignore
        json: async () => {return '';},
        //@ts-ignore
        body: {
          pipe: (...args: any[]) => {}
        }
      };
      // @ts-ignore
      sandbox.stub(Device.prototype, 'fetch').returns(res);
    });

    it('should evaluate the id as an iphone id then proceed to call the iphone.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Iphone'], 'logs');

      const devId = 'IPH-0000001';
      const callRes = await deviceFactory.logs(devId);


      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Iphone'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Iphone'].logs.calledOnce).toBeTruthy();
      expect(callRes).toEqual(res.body);
    });

    it('should evaluate the id as an iphone id then proceed to call the android.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();

      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Android'], 'logs');

      const devId = 'AND-0000004';
      const callRes = await deviceFactory.logs(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Android'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Android'].logs.calledOnce).toBeTruthy();
      expect(callRes).toEqual(res.body);
    });

    it('should evaluate the id as a tv id then proceed to call the tv.device start method', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Tv'], 'logs');

      const devId = 'TV-TCL-0000003';

      // todo: special condition with tvs, as they have a cache entry don't forget to add it
      const tvRef = Reflect.get(deviceFactory, 'devices')['Tv'];
      Reflect.get(tvRef, 'cache').set(devId, {
        stopUrl: 'stop.staaap.pls',
      });

      const callRes = await deviceFactory.logs(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Tv'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Tv'].logs.calledOnce).toBeTruthy();
      expect(callRes).toEqual(res.body);
    });

    it('should throw UnsupportedKeyError', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      const devId = 'AirFryer5000';
      let _error;
      try {
        await deviceFactory.logs(devId);
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof UnsupportedKeyError).toBeTruthy();
    });
  });

  describe('checkin', () => {
    it('should check back in a Tv device', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');
      sandbox.spy(Reflect.get(deviceFactory, 'devices')['Tv'], 'checkinHook');

      const devId = 'TV-TCL-0000003';

      deviceFactory.checkin(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Tv'])).toBeTruthy();
      expect(Reflect.get(deviceFactory, 'devices')['Tv'].checkinHook.calledOnce).toBeTruthy();
    });

    it('should check back in a iPhone device', async () => {
      let deviceFactory = new DeviceFactory();
      deviceFactory.init();
      // @ts-ignore
      sandbox.spy(deviceFactory, 'instance');

      const devId = 'IPH-0000001';

      deviceFactory.checkin(devId);

      expect(Reflect.get(deviceFactory, 'instance').calledWith(devId));
      expect(Reflect.get(deviceFactory, 'instance')
                    .returned(Reflect.get(deviceFactory, 'devices')['Iphone'])).toBeTruthy();
    });
  });
});
