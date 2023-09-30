
const Router = module.exports.Router = class Router {
    constructor() {
        this.routePaths = [];
        return this;
    }
}

Router.prototype.compilePaths = function (paths) {
    const pathNames = Object.keys(paths);
    const parts = [];
    pathNames.forEach((v) => {
        parts.push({
            path: v,
            parts: v.split("/"),
            operation: paths[v]
        });
    })
    this.routePaths = parts;
}

Router.prototype.lookup = function (path) {
    let operation = undefined;
    let params = {};

    this.routePaths.forEach((routePath) => {
        if (path === routePath.path) {
            operation = routePath.operation;
            params = {};
        }
        if (!operation) {
            let p = this.extractFromPath(routePath.path, path);
            if (Object.keys(p).length !== 0) {
                operation = routePath.operation;
                params = p;
            }
        }
    });
    if (operation) {
        return {
            value: operation,
            params: params
        };
    }
}

Router.prototype.extractFromPath = function (template, value) {
    const templateArr = template.split("/")
    const valueArr = value.split("/")

    if (templateArr.length !== valueArr.length) {
        return {};
    }

    return templateArr.reduce((obj, part, i) => {
        if (part.match(/\{.*\}/)) {
            const name = part.slice(1, -1)
            obj[name] = valueArr[i]
        }
        return obj
    }, {})
}
