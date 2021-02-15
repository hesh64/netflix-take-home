import supertest         from 'supertest';
import sinon             from 'sinon';
import { app }           from '../../app/controller';
import { DeviceFactory } from '../../app/service/device.factory';

const request = supertest(app);

describe('Device Controller', () => {
  let sandbox = sinon.createSandbox();
  beforeEach(() => {
    sandbox.restore();
  });

  describe('/find', () => {
    it('should find a device iphone', async (done) => {
      const res = await request.get('/find?type=iphone');

      expect(res.body.length).toEqual(1);
      // given that we search the array in a linear form we can predict the first elements
      // IPH-0000001
      expect(res.body[0]).toEqual('IPH-0000001');

      done();
    });

    it('should find a device tv', async (done) => {
      const res = await request.get('/find?type=tv');

      expect(res.body.length).toEqual(1);
      // given that we search the array in a linear form we can predict the first elements
      // IPH-0000001
      expect(res.body[0]).toEqual('TV-LG-0000001');

      done();
    });

    it('should find a device android', async (done) => {
      const res = await request.get('/find?type=android');

      expect(res.body.length).toEqual(1);
      // given that we search the array in a linear form we can predict the first elements
      // IPH-0000001
      expect(res.body[0]).toEqual('AND-0000001');

      done();
    });
    it('no search params 400 error', async (done) => {
      const res = await request.get('/find');

      expect(res.status).toEqual(400);
      expect(res.body).toEqual('No Search Params');

      done();
    });
  });

  describe('/checkout', () => {
    it('should find then checkout a device', async (done) => {
      const res = await request.get('/find?type=android');
      const [ id ] = res.body;
      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);
      done();
    });

    it('should find then checkout a device twice', async (done) => {
      const res = await request.get('/find?type=android');
      const [ id ] = res.body;
      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const checkout2 = await request.post(`/${ id }/checkout`);
      expect(checkout2.status).toEqual(404);

      await request.post(`/${ id }/checkin`);
      done();
    });
  });

  describe('/logs', () => {
    it('should find then checkout a device', async (done) => {
      const res = await request.get('/find?type=android');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const start = await request.post(`/${ id }/start`);
      expect(start.status).toEqual(200);

      const logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should find - android, checkout, start, logs, stop, logs', async (done) => {
      const res = await request.get('/find?type=android');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const start = await request.post(`/${ id }/start`);
      expect(start.status).toEqual(200);

      let logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);

      logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should find - iphone, checkout, start, logs, stop, logs', async (done) => {
      const res = await request.get('/find?type=iphone');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const start = await request.post(`/${ id }/start`);
      expect(start.status).toEqual(200);

      let logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);

      logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should find - tv, checkout, start, logs, stop, logs', async (done) => {
      const res = await request.get('/find?type=iphone');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const start = await request.post(`/${ id }/start`);
      expect(start.status).toEqual(200);

      let logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);

      logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });
  });
  describe('/stop', () => {
    it('should find - android then checkout a device', async (done) => {
      const res = await request.get('/find?type=android');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);

      const logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should find - iphone then checkout a device', async (done) => {
      const res = await request.get('/find?type=iphone');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);

      const logs = await request.get(`/${ id }/logs`);
      expect(logs.status).toEqual(200);
      expect(logs.text.length > 0).toBeTruthy();

      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should find - tv then check it out', async (done) => {
      const res = await request.get('/find?type=tv');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const start = await request.post(`/${ id }/start`);
      expect(start.status).toEqual(200);

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(200);


      await request.post(`/${ id }/checkin`);
      done();
    });

    it('should return error thrown with error code', async (done) => {
      sandbox.stub(DeviceFactory.prototype, 'stop').throws({ code: 333, message: 'abc' });
      const res = await request.get('/find?usbAddr=3:4&location=lab_e2');
      const [ id ] = res.body;
      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const stop = await request.post(`/${ id }/stop`);
      expect(stop.status).toEqual(333);

      await request.post(`/${ id }/checkin`);
      done();
    });
  });

  describe('/checkin', () => {
    it('should find then checkout a device', async (done) => {
      const res = await request.get('/find?type=android&location=lab_e2');
      const [ id ] = res.body;

      const checkout = await request.post(`/${ id }/checkout`);
      expect(checkout.status).toEqual(200);

      const checkin = await request.post(`/${ id }/checkin`);
      expect(checkin.status).toEqual(200);
      done();
    });

    it('should find then attempt to checkin a device we did not checkout', async (done) => {
      const res = await request.get('/find?type=iphone');
      const [ id ] = res.body;

      const checkin = await request.post(`/${ id }/checkin`);
      expect(checkin.status).toEqual(403);

      done();
    });
  });

  describe('/health', () => {
    it('should find then checkout a device', async (done) => {
      const health = await request.get(`/health`);
      expect(health.status).toEqual(200);
      done();
    });
  });
});
