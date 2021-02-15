import _               from 'lodash';
import { randomBytes } from 'crypto';
import express         from 'express';
import bodyParser      from 'body-parser';
import cookieParser    from 'cookie-parser';

import { SearchParams, Cache } from '../model';
import { ControllerError }     from '../utils';
import { DeviceFactory }       from '../service/device.factory';

const factory = new DeviceFactory();
factory.init();


/**
 * Q3: Alrighty so we need a way to "lock" a device to a single user. That means we need a way to unlock a device
 *     I think it's fair to implement a checkout and checkin methods. Thankfully because I went with a pool from
 *     the start, it should not be too many changed
 *
 */
const UserDevices = new Cache<{ [key: string]: boolean }>();
/**
 * Validate that the device queried about is currently registered until the callers client id.
 *
 * @param req
 * @param res
 * @param next
 * @constructor
 */
const CheckDeviceIsWithUser = (req, res, next) => {
  //@ts-ignore
  const { UserDevices, params, cookies } = req;
  const { id } = params;
  const { clientId } = cookies;

  if (!UserDevices.has(clientId) || !UserDevices.get(clientId)[id]) {
    res.status(403).send('Not Allowed');
    return;
  }

  next();
};


export const app = express();
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use((req, res, next) => {
  /**
   * Generate a quick cookie for new users.
   */
  if (!req.cookies || !req.cookies.client) {
    const clientId = randomBytes(5).toString('hex');
    res.cookie('client', clientId, { httpOnly: true });
  }

  next();
});

app.use((req, _, next) => {
  /**
   * There should be a clear differentiation between a checked out device from the pool
   *
   * And a device in current use by a user.
   *
   * Often times that's a second cache / another cache layer
   *
   * @type {Map<string, {[p: string]: boolean}>}
   */
  //@ts-ignore
  req.UserDevices = UserDevices;
  next();
});

app.get('/health', (_, res) => {
  res.sendStatus(200);
});

app.post('/brew', (_, res) => {
  res.sendStatus(418);
});

app.get('/find', async (req, res) => {
  const { query } = req;
  // console.log(req)
  const searchParams: Partial<SearchParams> = {};

  try {
    // available params
    // construct searchParam struct
    [ 'type', 'location', 'usbAddr', 'ipAddr' ]
      .forEach((key) => {
        if (query[key]) {
          searchParams[key] = query[key] as string;
        }
      });

    if (!Object.keys(searchParams).length) {
      throw new ControllerError(400, 'No Search Params');
    }

    const result = await factory.find(searchParams);
    res.status(200).send(result);
  }
  catch (error) {
    // isn't it nice to be able to destruct
    const { code, message } = error;
    res.status(code).json(message);
  }
});

/**
 * Get the logs for a device id
 */
app.get('/:id/logs', CheckDeviceIsWithUser, async (req, res) => {
  try {
    const { params, cookies } = req;
    const { id } = params;
    const logs = await factory.logs(id);
    // bada-bing bada-boom
    logs.pipe(res);
  }
  catch (error) {
    const { code, message } = error;
    res.status(code).send(message);
  }
});

/**
 * takes in a query param named action = [ start , stop,]
 */
app.post('/:id/checkin', CheckDeviceIsWithUser, async (req, res) => {
  try {
    //@ts-ignore
    const { UserDevices } = req;

    const { params, cookies } = req;
    const { id } = params;
    const { clientId } = cookies;
    await factory.checkin(id);

    // updated user checked out list
    if (!UserDevices.has(clientId)) {
      UserDevices.set(clientId, {});
    }
    delete UserDevices.get(clientId)[id];

    res.status(200).send();
  }
  catch (error) {
    const { code, message } = error;
    res.status(code).send(message);
  }
});
/**
 * takes in a query param named action = [ start , stop,]
 */
app.post('/:id/checkout', async (req, res) => {
  try {
    //@ts-ignore
    const { UserDevices } = req;

    const { params, cookies } = req;
    const { id } = params;
    const { clientId } = cookies;

    factory.checkout(id);

    // updated user checked out list
    if (!UserDevices.has(clientId)) {
      UserDevices.set(clientId, {});
    }
    UserDevices.get(clientId)[id] = true;

    res.status(200).send();
  }
  catch (error) {
    const { code, message } = error;
    res.status(code).send(message);
  }
});

/**
 * takes in a query param named action = [ start , stop,]
 */
app.post('/:id/start', CheckDeviceIsWithUser, async (req, res) => {
  try {
    const { query, params, cookies } = req;
    const paramsString = _.get(query, 'params', undefined) as string | undefined;
    const { id } = params;
    const result = await factory.start(id, paramsString);

    res.status(200).send(result);
  }
  catch (error) {
    const { code, message } = error;
    res.status(code).send(message);
  }
});

/**
 * takes in a query param named action = [ start , stop,]
 */
app.post('/:id/stop', CheckDeviceIsWithUser, async (req, res) => {
  try {
    const { params, cookies } = req;
    const { id } = params;
    const result = await factory.stop(id);

    res.status(200).send(result);
  }
  catch (error) {
    const { code, message } = error;
    res.status(code).send(message);
  }
});
