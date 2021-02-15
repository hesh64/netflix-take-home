/***
 *
 * I would never suggest that anyone write their own logger.
 *
 * I just wrote this for fun. -- it's super basic super limited but
 * does the job
 *
 *
 * another approach to doing this would be to wrap classes with proxies
 * and use traps.
 */

const logger = (...args) => {
  if (process.env.NODE_ENV == 'test') {
    return;
  }

  let final: any = args;
  if (args.length > 1) {
    final = args.join();
  }
  try {
    process.stdout.write(JSON.stringify(final) + '\n');
  }
  catch (_) {
    process.stdout.write(final + '\n');
  }
};

export const Log = (ctor, p?, desc?) => {
  if (!p) {
    // static side
    Reflect.ownKeys(ctor).forEach((prop) => {
      const desc = Reflect.getOwnPropertyDescriptor(ctor, prop);
      if (~[ 'length', 'prototype', 'name' ].indexOf(prop as string)) {
        return;
      }

      if (desc) {
        const { value } = desc;
        desc.value = function (...args) {
          logger(`${ ctor.name }.${ prop as string }(${ JSON.stringify(args) })`);
          return value.apply(this, args);
        };
        Object.defineProperty(ctor.prototype, prop, desc);
      }
    });

    // instance side
    Reflect.ownKeys(ctor.prototype).forEach(prop => {
      if (prop == 'constructor') {return;}
      const desc = Reflect.getOwnPropertyDescriptor(ctor.prototype, prop);
      if (desc && desc.value) {
        const { value } = desc;
        desc.value = function (...args) {
          logger(`${ ctor.name }.${ prop as string }(${ JSON.stringify(args) })`);
          return value.apply(this, args);
        };
        Object.defineProperty(ctor.prototype, prop, desc);
      }
    });
  }
};
