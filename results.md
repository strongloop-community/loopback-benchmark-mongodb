# Tue 14 Jul 2015 01:36:44 PDT

## loopback-connector-mongodb
create x 325 ops/sec ±2.61% (72 runs sampled)
find x 497 ops/sec ±1.79% (74 runs sampled)
find with a simple filter x 485 ops/sec ±2.25% (74 runs sampled)

## mongoose
create x 326 ops/sec ±2.78% (72 runs sampled)
find x 419 ops/sec ±1.80% (78 runs sampled)
find with a simple filter x 477 ops/sec ±2.24% (71 runs sampled)

## mongodb native driver
create x 451 ops/sec ±2.14% (73 runs sampled)
find x 547 ops/sec ±1.67% (75 runs sampled)
find with a simple filter x 561 ops/sec ±2.18% (44 runs sampled)

# Took
55s

---

