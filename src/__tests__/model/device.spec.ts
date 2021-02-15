const devices = require('../../../devices.json');

import { DevicePool, DeviceType } from '../../app/model/device';
import sinon                      from 'sinon';

describe('DevicePool', function () {
  let sandbox = sinon.createSandbox();
  it('should create a new instance and init list', () => {
    let threw = false;
    let pool;
    try {
      pool = new DevicePool(devices);
    }
    catch (error) {
      threw = true;
    }

    expect(threw).toBeFalsy();
    expect(pool instanceof Map).toBeTruthy();
  });

  it('should create a new instance and init with empty list', () => {
    let threw = false;
    let pool;
    try {
      pool = new DevicePool([]);
    }
    catch (error) {
      threw = true;
    }

    expect(threw).toBeFalsy();
    expect(pool instanceof Map).toBeTruthy();
  });

  describe('find', () => {
    /**
     * no need to put these in before each.
     *
     */
    const pool = new DevicePool(devices);

    const search = {
      devId: 'AND-0000004',
      type: 'android',
      location: 'lab_e2'
    };

    beforeEach(() => {
      sandbox.restore();
      //@ts-ignore
      sandbox.spy(pool, '_find');
    });

    [ 'devId', 'type', 'location', 'ipAddr' ].forEach(key => {
      it(`should find device using ${ key } only`, () => {
        const result = pool.find({ [key]: search[key] });
        expect(typeof result!.devId === 'string').toBeTruthy();
        expect(Reflect.get(pool, '_find').calledOnce).toBeTruthy();
      });
    });

    [ { type: DeviceType.Tv, location: 'lab_e2' }, { location: 'lab_e3', ipAddr: '175.23.23.05' } ]
      .forEach((search) => {
        it(`should find device using ${ JSON.stringify(search) }`, () => {
          const result = pool.find(search);
          expect(typeof result!.devId == 'string').toBeTruthy();

          for (const key in search) {
            //todo: if you are seeing a warning in your editor saying check of has
            // property -- given our use case is so simple it's not something necessary.
            expect(result![key]).toEqual(search[key]);
            expect(Reflect.get(pool, '_find').calledOnce).toBeTruthy();
          }
        });
      });

    [ 'devId', 'type', 'location', 'ipAddr' ].forEach(key => {
      it(`should not find anything`, () => {
        const result = pool.find({ [key]: 'i dont exist' });
        expect(result).toBeFalsy();
        expect(Reflect.get(pool, '_find').calledOnce).toBeTruthy();
      });
    });
  });

  describe('checkout', () => {
    /**
     * no need to put these in before each.
     *
     */
    let pool;
    beforeEach(() => {
      sandbox.restore();
    });

    it(`should checkout device with devId: 'AND-0000004'`, () => {
      const pool = new DevicePool(devices);

      //@ts-ignore
      sandbox.spy(pool, '_find');

      const device = pool.find({ type: DeviceType.Iphone });
      const checkedOut = pool.checkout(device!.devId);

      expect(!!checkedOut).toBeTruthy();
      // typescript gives us this test for free
      // expect(Reflect.get(checkedOut, 'status'))
      expect(Reflect.get(pool, '_find').calledOnce).toBeTruthy();
    });

    it(`should checkout short id of device with devId: 'AND-0000004' the first time around then return false the second`, () => {
      const devId = 'AND-0000004';
      const pool = new DevicePool(devices);

      // @ts-ignore
      sandbox.spy(pool, '_find');
      const device1 = pool.find({ type: DeviceType.Iphone });

      // checkout first time
      const checkedOut = pool.checkout(device1!.devId);
      expect(device1).toBeTruthy();
      expect(checkedOut).toBeTruthy();
      // expect(Reflect.get(device1 as object, 'devId')).toBe(devId);
      expect(Reflect.get(pool, '_find').calledOnce).toBeTruthy();

      // the device is already checked out.
      // should return false
      const device2 = pool.checkout(device1!.devId);
      expect(device2 === false).toBeTruthy();
    });


    it(`should checkout id: 'I am not real' and get null`, () => {
      const shortId = 'I am not real';
      const pool = new DevicePool(devices);

      //@ts-ignore
      sandbox.spy(pool, '_find');

      const device1 = pool.checkout(shortId);

      expect(device1 == null).toBeTruthy();
    });
  });

  describe('checkin', () => {
    /**
     * no need to put these in before each.
     *
     */
    let pool;
    beforeEach(() => {
      sandbox.restore();
    });

    it(`should checkout device with devId: 'AND-0000004' then check it back in using it's shortId`, () => {
      const devId = 'AND-0000004';
      const pool = new DevicePool(devices);

      //@ts-ignore
      // sandbox.spy(pool, '_find');

      // pool.find({ devId })!;

      // one must checkout before they check in.
      const device = pool.checkout(devId) as { devId: string };
      expect(device).toBeTruthy();
      expect(Reflect.get(device as object, 'devId')).toBe(devId);

      const result = pool.checkin(devId);
      expect(result).toBeTruthy();

      // remember find only returns checked in values
      const thatDeviceAgain = pool.find({ devId }) as { devId: string };
      expect(Reflect.get(thatDeviceAgain, 'devId')).toBe(devId);
    });

    it(`should get true even if we checkin a bad id`, () => {
      const devId = 'not real';
      const pool = new DevicePool(devices);

      const result = pool.checkin(devId);
      expect(result).toBeTruthy();
    });
  });
});
