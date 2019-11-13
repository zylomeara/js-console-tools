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
function findVal(obj = {}, item) {
    function find(obj, item) {
        if (find.path === undefined) {
            find.path = [];
        }
        if (find.result === undefined) {
            find.result = [];
        }
        if (find.level === undefined) {
            find.level = 0;
        } else {
            find.level += 1;
        }

        for (var key in obj) {
            find.path[find.level] = key;
            if (obj[key] && typeof obj[key] === "object") {
                find(obj[key], item);
            } else if (obj[key] === item) {
                find.result.push(`["${find.path.join('"]["')}"]`);
            }
        }
        find.level -= 1;
        find.path.pop();
    }

    find.resetResult = () => {
        find.path = undefined;
        find.result = undefined;
        find.level = undefined;
    };
    var varName = Object.keys(obj)[0];
    find.resetResult();
    find(obj[varName], item);

    return find.result.map(res => varName + res);
}

// example: findKey({obj: objWithDuplicates, key: "d"});
function findKey(options) {
    let results = [];

    (function findKeyItem({
                          key,
                          obj,
                          pathToKey,
                      }) {
        const oldPath = `${pathToKey ? pathToKey + "." : ""}`;
        if (obj.hasOwnProperty(key)) {
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
