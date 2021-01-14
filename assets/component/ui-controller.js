export const ui_controller = (() => {
  class UiController {
      constructor(){        
      }

      displayAnimalInformation(data){
        const ui = `
          <div style="position: absolute; left:30%; top: 25%;">
                  <div id="info">
                      <h2>INFO</h2>
                  </div>
                  <div class="container" id="container2">
                      <div class="image">
                          <img src="${data.image}" alt="" srcset="">
                      </div>
                      <div class="animal_info">
                          <div id="name">
                              <h3>Name</h3>
                              <p id="animal_name">${data.name}</p>
                          </div>
                          <div id="latin">
                              <h3>Latin</h3>
                              <p  id="animal_latin">Description</p>
                          </div>
                          <div id="description">
                              <h3>Description</h3>
                              <p  id="animal_description">${data.description}</p>
                          </div>
                          <div id="food">
                              <h3>food</h3>
                              <p  id="animal_food">${data.food}</p>
                          </div>
                          <div id="location">
                              <h3>Location</h3>
                              <p  id="animal_location">${data.location}</p>
                          </div>
                      </div>
                  </div>
              </div>
              `
              document.body.innerHTML = ui+=document.body.innerHTML;
      }
  }

  return {
      UiController: UiController
  };
  
})();