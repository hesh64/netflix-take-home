import sinon               from 'sinon';
import { TVDevice as TVD } from '../../app/service';
import { NotFoundError }   from '../../app/utils';

const { TVDevice } = TVD;

describe('TVDevice', () => {
  let sandbox = sinon.createSandbox();
  beforeEach(() => {
    sandbox.restore();
  });

  it('should instantiate', () => {
    expect(new TVDevice()).toBeTruthy();
  });

  describe('start', () => {
    let tv = new TVDevice();


    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await tv.start('AND-0001111');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it('should call fetchConfig', async () => {
      //@ts-ignore
      sandbox.stub(tv, 'fetch').returns({
        //@ts-ignore
        json: async () => {
          return { stopUrl: '', logUrl: '' };
        }
      });
      //@ts-ignore
      sandbox.spy(tv, 'fetchConfig');

      await tv.start('TV-LG-0000005');
      expect(Reflect.get(tv, 'fetchConfig').calledOnce);
      expect(Reflect.get(tv, 'fetch').calledOnce);
    });

    it('should call the iphone start endpoint', () => {
      //@ts-ignore
      sandbox.stub(tv, 'fetch').returns(async () => {
        return {
          json: async () => {
            return { stopUrl: '', logUrl: '' };
          }
        };
      });
    });
  });
  describe('stop', () => {
    let tv = new TVDevice();

    beforeEach(() => {
      sandbox.restore();
    });
    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await tv.stop('TV-NEw-0000001');
      }
      catch (error) {
        _error = error;
        console.log(_error);
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it('should throw NotFound but this time for cache entry', async () => {
      let _error;
      try {
        await tv.stop('TV-LG-0000004');
      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
      expect(_error.message).toEqual('Missing Cache Entry');
    });

    it('should stop a device', async () => {
      const devId = 'TV-LG-0000004';
      //@ts-ignore
      sandbox.stub(tv, 'fetch').returns({
        //@ts-ignore
        json: async () => {
          return { stopUrl: '', logUrl: '' };
        },
        text: async () => {'';}
      });
      await tv.start(devId);
      await tv.stop(devId);

      expect(Reflect.get(tv, 'fetch').calledTwice);
    });
  });

  describe('logs', () => {
    let tv = new TVDevice();

    it('should throw NotFoundError', async () => {
      let _error;
      try {
        await tv.logs('TV-LG-1000005');

      }
      catch (error) {
        _error = error;
      }

      expect(!!_error).toBeTruthy();
      expect(_error instanceof NotFoundError).toBeTruthy();
    });

    it('should return response body so it could be piped', async () => {
      const devId = 'TV-LG-0000004';
      const returned = {
        //@ts-ignore
        json: async () => {
          return { stopUrl: '', logUrl: '' };
        },
        text: async () => {'';},
        // @ts-ignore
        body: {}
      };
      //@ts-ignore
      sandbox.stub(tv, 'fetch').returns(returned);
      await tv.start(devId);
      const result = await tv.logs(devId);

      expect(result).toEqual(returned.body);
    });
  });
});
