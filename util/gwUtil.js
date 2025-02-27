const crypto = require("crypto");
const sh = require("shorthash");
const uuid = require("uuid/v1");
const urlConfig = require("../config/urlConfig");
let logger = global.logger;

let e = {};


e.randomStr = function(len) {
	let str = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < len; i++) {
		str += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return str;
};

e.getTxnId = (_req) => {
	_req.headers["TxnId"] = sh.unique(crypto.createHash("md5").update(uuid()).digest("hex"));
	if (!_req.path.startsWith("/gw/health")) logger.debug(`getTxnId() :: _req.headers.TxnId :: ${_req.headers.TxnId}`);
};

e.compareUrl = (tempUrl, url) => {
	let tempUrlSegment = tempUrl.split("/").filter(_d => _d != "");
	let urlSegment = url.split("/").filter(_d => _d != "");
	if (tempUrlSegment.length != urlSegment.length) return false;

	tempUrlSegment.shift();
	urlSegment.shift();

	let flag = tempUrlSegment.every((_k, i) => {
		if (_k.startsWith("{") && _k.endsWith("}") && urlSegment[i] != "") return true;
		return _k === urlSegment[i];
	});
	logger.trace(`Compare URL :: ${tempUrl}, ${url} :: ${flag}`);
	return flag;
};

e.md5 = data => {
	return crypto.createHash("md5").update(data).digest("hex");
};

e.isPermittedURL = (_req) => {
	return urlConfig.permittedUrl.some(_url => e.compareUrl(_url, _req.path));
};

e.isPermittedAuthZUrl = (_req) => {
	return urlConfig.permittedAuthZUrl.some(_url => _req.path.startsWith(_url));
};

e.isDownloadURL = (_req) => {
	return urlConfig.downloadUrl.some(_url => e.compareUrl(_url, _req.path));
};

e.hasDuplicate = (arr) => {
	return arr.length !== Array.from(new Set(arr)).length;
}; 

e.getDuplicateValues = (arr) => {
	var duplicates = arr.filter(a => arr.indexOf(a) !== arr.lastIndexOf(a));
	return Array.from(new Set(duplicates));
};

module.exports = e;