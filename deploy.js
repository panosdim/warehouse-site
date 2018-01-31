var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');
var readJsonParsed = function (file) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

// Default names for node_modules and package.json
var pkgJson = './package.json';
var nodeModules = './node_modules';

// Read package.json for dependencies and then loop through each dependency
// and read package.json of dependency module to find out main and style sections.
var packageJson = readJsonParsed(pkgJson);
var dependencies = packageJson.dependencies;
var depFiles = [];

for (var dependency in dependencies) {
    if (dependencies.hasOwnProperty(dependency)) {
        var modulePath = path.join(nodeModules, dependency);
    }

    //Read the package.json of a dependency
    var dependencyPkg = readJsonParsed(path.join(modulePath, 'package.json'));

    ['main', 'style'].forEach(function(fileKey) {
        var file = dependencyPkg[fileKey] || '';
        if (file && file.length) {
            var f = path.parse(path.join(__dirname, modulePath, file));
            if (f.ext !== '') {
                depFiles.push(path.join(f.dir, f.name + ".min" + f.ext));
            } else {
                depFiles.push(path.join(f.dir, f.name + ".min.js"));
            }          
        }
      });
}

var dest = path.join(__dirname, 'dist');

// Copy main files from node_modules to dist folder
for (var i = 0, len = depFiles.length; i < len; i++) {
    var npm_path = depFiles[i].split(path.sep);
    var npm_cmp = '';
    for (var j = 0, itm = npm_path.length; j < itm; j++) {
        if (npm_path[j] === 'node_modules') {
            npm_cmp = dest;
        }
        if (npm_cmp.length) {
            npm_cmp = path.join(npm_cmp, npm_path[j]);
        }
    }

    fse.ensureFileSync(npm_cmp);
    fse.copySync(depFiles[i], npm_cmp);
}

var copyMinFiles = function(src) {
    if (fse.lstatSync(src).isDirectory()) {
        return true;
    } else {
        return  /^.*\.min.*$/.test(path.basename(src));
    }
};

// Copy css files
fse.copySync(path.join(__dirname, 'css'), path.join(dest, 'css'),{ filter: copyMinFiles});

// Copy js files
fse.copySync(path.join(__dirname, 'js'), path.join(dest, 'js'),{ filter: copyMinFiles});

// Copy image files
fse.copySync(path.join(__dirname, 'images'), path.join(dest, 'images'));

// Copy php files
fse.copySync(path.join(__dirname, 'php'), path.join(dest, 'php'));

// Copy index files
fse.copySync(path.join(__dirname, 'index.html'), path.join(dest, 'index.html'));