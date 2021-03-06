import ApiRequest from '../ApiRequest'

const DB_NAME = 'CACHE_REQUST';

export default class ApiCacheRequest extends ApiRequest {

  static db = null

  constructor (restApiUrlBuilder, PouchDB) {
      super(restApiUrlBuilder)
      this.db = new PouchDB(DB_NAME)
  }

  async dispatch (method, data, endpoint, isResponsePlainText = false) {
    let response = null
    try {
      response = await this.dispatchRequest(method, data, endpoint, isResponsePlainText)
    }
    catch(err) {
      console.log(err)
      if (method !== 'get') {
        this.saveRequest(method, data, endpoint)
      }
    }
    return response
  }

  saveRequest (method, data, endpoint) {
    if (this.db !== null) {
      try {
        this.db.post({
          method,
          data,
          endpoint
        })
      }
      catch(err) {
        console.log(err)
      }
    }
  }

  async sendAllCachedRequests () {
    if (this.db !== null) {
      try {
        var db = this.db
        var dispatch = this.dispatch

        await this.db.allDocs({include_docs: true}).then(function(result){
          return Promise.all(result.rows.map(function(row){
            const {method, data, endpoint} = row.doc
            return Promise.all(
              db.remove(row.id, row.value.rev),
              dispatch(method, data, endpoint)
            )
          }))
        })
      }
      catch(err) {
        console.log(err)
      }
    }
  }

  async showAllCachedRequests () {
    if (this.db !== null) {
      try {
        const cache = await this.db.allDocs({include_docs: true})
        cache.rows.forEach((request) => {
          const {_id, method, data, endpoint} = request.doc
          console.log({
            _id,
            method,
            data,
            endpoint
          })
        })
      }
      catch(err) {
        console.log(err)
      }
    }
  }

}
