import _ from 'underscore';
import * as R from 'ramda';

window._f = _;
window._R = R;


var PREDICATES = {
    includes: (a, b) => String(a).includes(b),
    equals: (a, b) => a === b,
};
window.PREDICATES = PREDICATES;

var mergeDeep = (...objects) => {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
};

// The function is needed because the Object.keys does not work with the document
function ObjectKeys(obj = {}) {
    var set = new Set();
    for (var i in obj) {
        set.add(i);
    }

    return [...set];
}

// example: findVal({obj}, 123);
function findVal(obj = {}, item, predicate = PREDICATES.equals) {
    let result = [];
    let path = [];
    let index = -1;

    function find(obj, item) {
        index++;
        for (var key in obj) {
            path[index] = key;
            if (obj[key] && typeof obj[key] === "object") {
                find(obj[key], item);
            } else if (predicate(obj[key], item)) {
                result.push(`["${path.join('"]["')}"]`);
            }
        }
        index -= 1;
        path.pop();
    }
    var varName = Object.keys(obj)[0];

    find(obj[varName], item);

    return result.map(res => varName + res);
}
findVal.EXAMPLE = 'findVal({obj}, 123, PREDICATES.equals);';
window.findVal = findVal;

// example: findValWithoutRecursion({obj}, 123, {
//       predicate = PREDICATES.equals,
//       timeout = 0,
//       throttle = 0,
//       deepLevel = 0,
//   });
function findValWithoutRecursion(
  obj = {},
  item,
  {
      predicate = PREDICATES.equals,
      timeout = 0,
      throttle = 0,
      deepLevel = 0,
  } = {},
  ) {
    let result = [];
    let scopes = [];
    let varName = Object.keys(obj)[0];
    let searchObject = Object.values(obj)[0];
    scopes.push({
        keys: ObjectKeys(searchObject),
        currentKey: ObjectKeys(searchObject)[0],
        currentIndex: 0,
        thresholdIndex: ObjectKeys(searchObject).length - 1,
        value: searchObject,
    });
    let failureAccess = [];
    let blockLog = false;
    let throttleLog = _.throttle(() => !blockLog && console.log('Result: ', result), throttle);
    let timeStart = (new Date()).getTime();
    let timeEnd = timeStart + timeout;

    if (ObjectKeys(searchObject).length === 0) {
        throw Error('Пустой объект')
    }

    loop1:
    while(true) {
        if ((new Date()).getTime() > timeEnd && timeout !== 0) {
            console.log('Result after timeout');
            if (failureAccess.length) {
                console.log('Failure access: ', failureAccess)
            }
            blockLog = true;
            return result.map(pathItem => `${varName}${pathItem}`);
        }

        throttle && throttleLog();
        let scope = scopes[scopes.length - 1];
        if (!scope) {
            if (failureAccess.length) {
                console.log('Failure access: ', failureAccess)
            }
            blockLog = true;
            return result.map(pathItem => `${varName}${pathItem}`);
        }

        for (; scope.currentIndex <= scope.thresholdIndex; scope.currentIndex++) {
            scope.currentKey = scope.keys[scope.currentIndex];

            try {
                if (scope.value[scope.currentKey] && typeof scope.value[scope.currentKey] === "object") {
                    if (typeof item === 'object' && predicate(scope.value[scope.currentKey], item)) {
                        let path = scopes.map(s => s.currentKey);
                        result.push(`["${path.join('"]["')}"]`);
                    } else {
                        if (scopes.length < deepLevel || deepLevel === 0) {
                            scopes.push({
                                keys: ObjectKeys(scope.value[scope.currentKey]),
                                currentKey: ObjectKeys(scope.value[scope.currentKey])[0],
                                currentIndex: 0,
                                thresholdIndex: ObjectKeys(scope.value[scope.currentKey]).length - 1,
                                value: scope.value[scope.currentKey],
                            });
                        }
                    }
                    scope.currentIndex++;
                    continue loop1;
                } else if (predicate(scope.value[scope.currentKey], item)) {
                    let path = scopes.map(s => s.currentKey);
                    result.push(`["${path.join('"]["')}"]`);
                }
            } catch (e) {
                let path = scopes.map(s => s.currentKey);

                failureAccess.push({
                    path: `${varName}["${path.join('"]["')}"]`,
                    reason: e,
                })
            }
        }
        scopes.pop()
    }
}
findValWithoutRecursion.EXAMPLE = `
    findValWithoutRecursion({obj}, 123, {
        predicate = PREDICATES.equals,
        timeout = 0,
        throttle = 0,
        deepLevel = 0,
    });
`;
window.findValWithoutRecursion = findValWithoutRecursion;

// example: findKey({obj: objWithDuplicates, val: "d", key: "d"});
function findKey(options) {
    let results = [];

    (function findKeyItem({
                              key,
                              obj,
                              val,
                              pathToKey,
                          }) {
        const oldPath = `${pathToKey ? pathToKey + "" : ""}`;
        if (obj.hasOwnProperty(key) && (val === undefined ? true : obj[key] === val)) {
            results.push(`${oldPath}['${key}']`);
            // return;
        }

        if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
            for (const k in obj) {
                if (obj.hasOwnProperty(k)) {
                    if (Array.isArray(obj[k])) {
                        for (let j = 0; j < obj[k].length; j++) {
                            findKeyItem({
                                obj: obj[k][j],
                                key,
                                pathToKey: `${oldPath}${k}[${j}]`,
                            });
                        }
                    }

                    if (obj[k] !== null && typeof obj[k] === "object") {
                        findKeyItem({
                            obj: obj[k],
                            key,
                            pathToKey: `${oldPath}['${k}']`,
                        });
                    }
                }
            }
        }
    })(options);

    return results;
}
findKey.EXAMPLE = 'findKey({obj: objWithDuplicates, val: "d", key: "d"});';
window.findKey = findKey;
