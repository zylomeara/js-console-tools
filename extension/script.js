var PREDICATES = {
    includes: (a, b) => String(a).includes(b),
    equals: (a, b) => a === b,
};

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

// example: findVal({obj}, 123);
function findVal(obj = {}, item, predicate = PREDICATES.equals) {
    let result = [];
    let path = [];
    let index = -1;

    function find(obj, item) {
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

// example: findKey({obj: objWithDuplicates, val: "d", key: "d"});
function findKey(options) {
    let results = [];

    (function findKeyItem({
                              key,
                              obj,
                              val,
                              pathToKey,
                          }) {
        const oldPath = `${pathToKey ? pathToKey + "." : ""}`;
        if (obj.hasOwnProperty(key) && (val === undefined ? true : obj[key] === val)) {
            results.push(`${oldPath}${key}`);
            return;
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
                            pathToKey: `${oldPath}${k}`,
                        });
                    }
                }
            }
        }
    })(options);

    return results;
}
