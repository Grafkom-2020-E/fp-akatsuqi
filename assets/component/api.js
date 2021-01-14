export const api_manager = (() => {
  class ApiManager {
      constructor(){
        this._data = 0;
        const API_URL = 'http://54.167.42.176'
        // let request = this._id.map(animal => ))
        const request = fetch(`${API_URL}/animal`).then(resp => resp.json())

        Promise.all([request])
        .then( response => {
          response.map(resp => this._data = resp.data);
        })
      }

      get data(){
        return this._data;
      }
  }

  return {
      ApiManager: ApiManager
  };
  
})();