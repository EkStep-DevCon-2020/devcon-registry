const registryUrl = "http://localhost:8080"
const httpUtil = require('./httpUtils.js')

class RegistryService {

    constructor() {
    }

    addRecord(value, callback) {
        const options = {
            url: registryUrl + "/add",
            headers: this.getDefaultHeaders(value.headers),
            body: value.body
        }
        httpUtil.post(options, function (err, res) {
            if (res) {
                callback(null, res)
            } else {
                callback(err)
            }
        });

    }

    updateRecord(value, callback) {
        const options = {
            url: registryUrl + "/update",
            headers: this.getDefaultHeaders(value.headers),
            body: value.body
        }
        httpUtil.post(options, function (err, res) {
            if (res) {
                callback(null, res.body)
            } else {
                callback(err)
            }
        })

    }

    readRecord(value, callback) {
        const options = {
            url: registryUrl + "/read",
            headers: this.getDefaultHeaders(value.headers),
            body: value.body
        }
        httpUtil.post(options, function (err, res) {
            if (res) {
                callback(null, res.body)
            } else {
                callback(err)
            }
        })
    }

    searchRecord(value, callback) {
        const options = {
            url: registryUrl + "/search",
            headers: this.getDefaultHeaders(value.headers),
            body: value.body
        }
        httpUtil.post(options, function (err, res) {
            if (res) {
                callback(null, res.body)
            } else {
                callback(err)
            }
        })
    }

    getDefaultHeaders(reqHeaders) {
        let headers = {
            'content-type': 'application/json',
            'accept': 'application/json'
        }
        return headers;
    }
}


module.exports = RegistryService;
