import { Store } from "express-session";
function optionalCb(err, data, cb) {
  if (cb) return cb(err, data);
  if (err) throw err;
  return data;
}
class RedisStore extends Store {
  client;
  prefix;
  scanCount;
  serializer;
  ttl;
  disableTTL;
  disableTouch;
  constructor(opts) {
    super();
    this.prefix = opts.prefix == null ? "sess:" : opts.prefix;
    this.scanCount = opts.scanCount || 100;
    this.serializer = opts.serializer || JSON;
    this.ttl = opts.ttl || 86400;
    this.disableTTL = opts.disableTTL || false;
    this.disableTouch = opts.disableTouch || false;
    this.client = this.normalizeClient(opts.client);
  }
  // Create a redis and ioredis compatible client
  normalizeClient(client) {
    let isRedis = "scanIterator" in client || "masters" in client;
    let isRedisCluster = "masters" in client;
    return {
      get: (key) => client.get(key),
      set: (key, val, ttl) => {
        if (ttl) {
          return isRedis ? client.set(key, val, { EX: ttl }) : client.set(key, val, "EX", ttl);
        }
        return client.set(key, val);
      },
      del: (key) => client.del(key),
      expire: (key, ttl) => client.expire(key, ttl),
      mget: (keys) => isRedis ? client.mGet(keys) : client.mget(keys),
      scanIterator: (match, count) => {
        if (isRedisCluster) {
          return async function* () {
            for (const master of client.masters) {
              const nodeClient = await client.nodeClient(master);
              for await (const key of nodeClient.scanIterator({
                COUNT: count,
                MATCH: match
              })) {
                yield key;
              }
            }
          }();
        }
        if (isRedis) return client.scanIterator({ MATCH: match, COUNT: count });
        return async function* () {
          let [c, xs] = await client.scan("0", "MATCH", match, "COUNT", count);
          for (let key of xs) yield key;
          while (c !== "0") {
            ;
            [c, xs] = await client.scan(c, "MATCH", match, "COUNT", count);
            for (let key of xs) yield key;
          }
        }();
      }
    };
  }
  async get(sid, cb) {
    let key = this.prefix + sid;
    try {
      let data = await this.client.get(key);
      if (!data) return optionalCb(null, null, cb);
      return optionalCb(null, await this.serializer.parse(data), cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async set(sid, sess, cb) {
    let key = this.prefix + sid;
    let ttl = this._getTTL(sess);
    try {
      if (ttl > 0) {
        let val = this.serializer.stringify(sess);
        if (this.disableTTL) await this.client.set(key, val);
        else await this.client.set(key, val, ttl);
        return optionalCb(null, null, cb);
      } else {
        return this.destroy(sid, cb);
      }
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async touch(sid, sess, cb) {
    let key = this.prefix + sid;
    if (this.disableTouch || this.disableTTL) return optionalCb(null, null, cb);
    try {
      await this.client.expire(key, this._getTTL(sess));
      return optionalCb(null, null, cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async destroy(sid, cb) {
    let key = this.prefix + sid;
    try {
      await this.client.del([key]);
      return optionalCb(null, null, cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async clear(cb) {
    try {
      let keys = await this._getAllKeys();
      if (!keys.length) return optionalCb(null, null, cb);
      await this.client.del(keys);
      return optionalCb(null, null, cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async length(cb) {
    try {
      let keys = await this._getAllKeys();
      return optionalCb(null, keys.length, cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async ids(cb) {
    let len = this.prefix.length;
    try {
      let keys = await this._getAllKeys();
      return optionalCb(
        null,
        keys.map((k) => k.substring(len)),
        cb
      );
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  async all(cb) {
    let len = this.prefix.length;
    try {
      let keys = await this._getAllKeys();
      if (keys.length === 0) return optionalCb(null, [], cb);
      let data = await this.client.mget(keys);
      let results = data.reduce((acc, raw, idx) => {
        if (!raw) return acc;
        let sess = this.serializer.parse(raw);
        sess.id = keys[idx].substring(len);
        acc.push(sess);
        return acc;
      }, []);
      return optionalCb(null, results, cb);
    } catch (err) {
      return optionalCb(err, null, cb);
    }
  }
  _getTTL(sess) {
    if (typeof this.ttl === "function") {
      return this.ttl(sess);
    }
    let ttl;
    if (sess && sess.cookie && sess.cookie.expires) {
      let ms = Number(new Date(sess.cookie.expires)) - Date.now();
      ttl = Math.ceil(ms / 1e3);
    } else {
      ttl = this.ttl;
    }
    return ttl;
  }
  async _getAllKeys() {
    let pattern = this.prefix + "*";
    let keys = [];
    for await (let key of this.client.scanIterator(pattern, this.scanCount)) {
      keys.push(key);
    }
    return keys;
  }
}
export {
  RedisStore
};
