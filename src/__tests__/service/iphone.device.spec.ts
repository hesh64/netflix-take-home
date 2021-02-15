import sinon                   from 'sinon';
import config                  from 'config';
import { IPhoneDevice as IPD } from '../../app/service';
import { NotFoundError }       from '../../app/utils';

const { IPhoneDevice } = IPD;

describe('IPhoneDevice', () => {
  let sandbox = sinon.createSandbox();

  it('should instantiate', () => {
    expect(new IPhoneDevice()).toBeTruthy();
  });

  describe('start', () => {
    let iphone = new IPhoneDevice();

    beforeEach(() => {
      sandbox.restore();
    });

    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await iphone.start('IPH-00000111');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });
    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(iphone, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(iphone, 'fetchConfig');

      await iphone.start('IPH-0000003');
      expect(Reflect.get(iphone, 'fetchConfig').calledOnce);
      expect(Reflect.get(iphone, 'fetch').calledOnce);
    });

    it('should call the iphone start endpoint', () => {
      //@ts-ignore
      sandbox.stub(iphone, 'fetch').returns(async () => {
        return {
          text: async () => ('')
        };
      });


    });
  });

  describe('stop', () => {
    let iphone = new IPhoneDevice();

    beforeEach(() => {
      sandbox.restore();
    });
    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await iphone.stop('IPH-00000111');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(iphone, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(iphone, 'fetchConfig');

      await iphone.stop('IPH-0000003');
      expect(Reflect.get(iphone, 'fetchConfig').calledOnce);
      expect(Reflect.get(iphone, 'fetch').calledOnce);
    });

  });

  describe('logs', () => {
    let iphone = new IPhoneDevice();

    beforeEach(() => {
      sandbox.restore();
    });
    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await iphone.start('IPH-00000111');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(iphone, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(iphone, 'fetchConfig');

      await iphone.logs('IPH-0000003');

      expect(Reflect.get(iphone, 'fetchConfig').calledOnce);
      expect(Reflect.get(iphone, 'fetchConfig').returned({
        method: 'GET',
        headers: { 'client-id': 'eb36b4e2-1585-11eb-adc1-0242ac120002' },
        json: false,
        timeout: config.get('request').timeout
      })).toBeTruthy();
      expect(Reflect.get(iphone, 'fetch').calledOnce);
    });
  });
});
