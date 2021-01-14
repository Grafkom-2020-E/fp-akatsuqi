export const ui_controller = (() => {
  class UiController {
      constructor(){        
      }

      displayAnimalInformation(data){
        const ui = document.querySelector('#ui');
        ui.querySelector('#animal_image').setAttribute('src', data.image);
        ui.querySelector('#animal_name').innerHTML = data.name
        ui.querySelector('#animal_description').innerHTML = data.description
        ui.querySelector('#animal_location').innerHTML = data.location
        ui.querySelector('#animal_food').innerHTML = data.food
        ui.querySelector('#animal_latin').innerHTML = data.latin_name
        ui.style.display = 'block'
      }
      isDisplayedAnimalInformation(){
        const ui = document.querySelector('#ui');  
        if (ui.style.display == 'none') {
            return false;
        }
        return true;
      }
      hideAnimalInformation(){
        const ui = document.querySelector('#ui');
        ui.style.display = 'none'
      }

      displayInteraction(){
        const guide = document.getElementById('guide');
        guide.style.display = 'block';
      }

      hideInteraction(){
        const guide = document.getElementById('guide');
        guide.style.display = 'none';
      }

      isDisplayInteraction(){
        const guide = document.getElementById('guide');
        if (guide.style.display == 'none') {
          return false
        } else {
          return true
        }
      }
      
  }

  return {
      UiController: UiController
  };
  
})();