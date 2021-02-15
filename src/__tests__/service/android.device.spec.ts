import sinon                    from 'sinon';
import config                   from 'config';
import { AndroidDevice as AND } from '../../app/service';
import { NotFoundError }        from '../../app/utils';

const { AndroidDevice } = AND;

describe('AndroidDevice', () => {
  let sandbox = sinon.createSandbox();

  it('should instantiate', () => {
    expect(new AndroidDevice()).toBeTruthy();
  });

  describe('start', () => {
    let android = new AndroidDevice();

    beforeEach(() => {
      sandbox.restore();
    });

    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await android.start('AND-0001111');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });
    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(android, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(android, 'fetchConfig');

      await android.start('AND-0000001');

      const expectedConfig = {
        method: 'POST',
        headers: { 'client-id': 'eb36b4e2-1585-11eb-adc1-0242ac120002' },
        json: false
      };

      expect(Reflect.get(android, 'fetchConfig').calledOnce);
      expect(Reflect.get(android, 'fetch').calledWith('https://dumy.net.net/start', expectedConfig));
    });
  });
  describe('stop', () => {
    let android = new AndroidDevice();

    beforeEach(() => {
      sandbox.restore();
    });
    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await android.start('AND-000111001');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });
    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(android, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(android, 'fetchConfig');

      await android.stop('AND-0000001');

      const expectedConfig = {
        method: 'POST',
        headers: { 'client-id': 'eb36b4e2-1585-11eb-adc1-0242ac120002' },
        json: false,
        timeout: config.get('request').timeout

      };

      expect(Reflect.get(android, 'fetchConfig').calledOnce);
      expect(Reflect.get(android, 'fetchConfig').returned(expectedConfig)).toBeTruthy();
      expect(Reflect.get(android, 'fetch').calledWith('https://dumy.net.net/stop', expectedConfig));
    });
    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(android, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(android, 'fetchConfig');

      await android.stop('AND-0000001');

      expect(Reflect.get(android, 'fetchConfig').calledOnce);
      expect(Reflect.get(android, 'fetchConfig').returned({
        method: 'POST',
        headers: { 'client-id': 'eb36b4e2-1585-11eb-adc1-0242ac120002' },
        json: false,
        timeout: config.get('request').timeout
      })).toBeTruthy();
      expect(Reflect.get(android, 'fetch').calledOnce);
    });
  });
  describe('logs', () => {
    let android = new AndroidDevice();

    beforeEach(() => {
      sandbox.restore();
    });
    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await android.logs('AND-00aaa001');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });
    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(android, 'fetch').returns({
        //@ts-ignore
        text: async () => ('')
      });
      //@ts-ignore
      sandbox.spy(android, 'fetchConfig');

      await android.logs('AND-0000001');

      expect(Reflect.get(android, 'fetchConfig').calledOnce);
      expect(Reflect.get(android, 'fetchConfig').returned({
        method: 'GET',
        headers: { 'client-id': 'eb36b4e2-1585-11eb-adc1-0242ac120002' },
        json: false,
        timeout: config.get('request').timeout
      })).toBeTruthy();
      expect(Reflect.get(android, 'fetch').calledOnce);
    });
  });
});
