import {range, toJPGPath, addImgDir} from './functions.js';

const modelsDataHidden = document.querySelector("#models-data").textContent;


let modelsDataToActualize = JSON.parse(document.querySelector("#models-data").textContent);
//console.log(modelsDataToActualize);


const refreshButton = document.querySelector("#refresh-data-button");
refreshButton.addEventListener('click', (e)=>{
  e.preventDefault;
  refreshData();
})




function loadImages () {
  
      const gallery = document.querySelector('#main-view .gallery');
      const gallery2 = document.querySelector('#images .gallery');

      
      //{% static 'images/local_library_model_uml.png' %}
      const images = range(0,79).map(toJPGPath).map(addImgDir);
      const images2 = range(15,29).map(toJPGPath).map(addImgDir);

      /* Looping through images */
      for (const i in images){
        const box = document.createElement('div');
        box.setAttribute('class', 'box');
        box.classList.add('selectable');
        
        const newImage = document.createElement('img');
        newImage.setAttribute('src', images[i]);
        //newImage.setAttribute('alt', alt_texts[i]);
        box.appendChild(newImage);
        gallery.appendChild(box);}

      //console.log('images imported!')
      for (const i in images2){
      const box = document.createElement('div');
        box.setAttribute('class', 'box');
        
        const newImage = document.createElement('img');
        newImage.setAttribute('src', images2[i]);
        //newImage.setAttribute('alt', alt_texts[i]);
        box.appendChild(newImage);
        gallery2.appendChild(box);
        
  }
 
}

function drag_select(){


/* Drag-select */

    const selectables = [];
    const selectableElems = [...document.querySelectorAll(".selectable")];
    for (const selectable of selectableElems) {
    const {x, y, width, height} = selectable.getBoundingClientRect();
    selectables.push({x: x + window.scrollX, y: y + window.scrollY, width, height, elem: selectable});
    selectable.dataset.info = JSON.stringify({x, y, width, height});
    }

    function checkSelectedUp(selectAreaElem) {
    const select = selectAreaElem.getBoundingClientRect();
    const {x, y, height, width} = select;
    //console.log({x: x + window.scrollX, y: y + window.scrollY, height, width})
    for (const selectable of selectables) {
      //console.log(selectable);
      //console.log(checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable));
      if (checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable)){
        if(!selectable.elem.classList.contains("intersected")){
          selectable.elem.classList.add("intersected");
          selectable.elem.classList.remove('not-intersected');
        } 
        else {
          if (height===0 && width===0){
            selectable.elem.classList.remove("intersected");
            selectable.elem.classList.add('not-intersected');
          }
        }
      } else {
        if (!is_key_down('Control')){
        selectable.elem.classList.remove("intersected");
        selectable.elem.classList.add('not-intersected');
      }
    }
    }
    }
    function checkSelectedMove(selectAreaElem) {
      const select = selectAreaElem.getBoundingClientRect();
      const {x, y, height, width} = select;
      //console.log({x: x + window.scrollX, y: y + window.scrollY, height, width})
      for (const selectable of selectables) {
        //console.log(selectable);
        //console.log(checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable));
        if (checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable)){
          if(!selectable.elem.classList.contains("intersected")){
            selectable.elem.classList.add("intersected");
            selectable.elem.classList.remove('not-intersected');
          } 
        } else {
          if (!is_key_down('Control')){
          selectable.elem.classList.remove("intersected");
          
        }
      }
      }
    }
    // ------------

    function checkRectIntersection(r1, r2) {    // stackoverflow.com/a/13390495
    return !(r1.x + r1.width  < r2.x ||
            r2.x + r2.width  < r1.x ||
            r1.y + r1.height < r2.y ||
            r2.y + r2.height < r1.y);
    }
    const main_view = document.querySelector('[role="tabpanel"]#main-view');
    const gallleryContainer = document.querySelector('.gallery-container');
    //console.log(gallleryContainer);
    gallleryContainer.addEventListener("pointerdown", createSelectAreaDiv);
    async function createSelectAreaDiv(event) { // stackoverflow.com/a/75902998
    event.preventDefault();
    const x = event.pageX+main_view.scrollLeft;
    const y = event.pageY+main_view.scrollTop;

    const true_sel = document.createElement("div");
    true_sel.style.position = "absolute";
    true_sel.style.zIndex="10";
    true_sel.style.width = "0";
    true_sel.style.height = "0";
    true_sel.style.left = x + "px";
    true_sel.style.top = y + "px";

    const box_sel = document.createElement('div');
    box_sel.style.position = "absolute";
    box_sel.style.zIndex="10";
    box_sel.style.width = "0";
    box_sel.style.height = "0";
    box_sel.style.left = event.pageX + "px";
    box_sel.style.top = event.pageY + "px";
    box_sel.classList.add("drag-select");
    gallleryContainer.append(true_sel);
    gallleryContainer.append(box_sel);

    function resize(event) {
      const diffX = event.pageX+main_view.scrollLeft - x;
      const diffY = event.pageY+main_view.scrollTop - y;

      true_sel.style.left = diffX < 0 ? x + diffX + "px" : true_sel.style.left + "px";
      true_sel.style.top = diffY < 0 ? y + diffY + "px" : true_sel.style.top + "px";
      true_sel.style.height = Math.abs(diffY) + "px";
      true_sel.style.width = Math.abs(diffX) + "px";

      box_sel.style.left = diffX < 0 ? x + diffX - main_view.scrollLeft + "px" : box_sel.style.left + "px";
      box_sel.style.top = diffY < 0 ? y + diffY - main_view.scrollTop + "px" : box_sel.style.top + "px";
      box_sel.style.height = Math.abs(diffY) + "px";
      box_sel.style.width = Math.abs(diffX) + "px";
      checkSelectedMove(true_sel); // extra line 1
    }
      // extra line 2
      gallleryContainer.addEventListener("pointermove", resize);
      gallleryContainer.addEventListener("pointerup", () => {
        gallleryContainer.removeEventListener("pointermove", resize);
      checkSelectedUp(true_sel);
      //console.log('remove');
      true_sel.remove();
      box_sel.remove();
    }, {once: true});
    }

    /* Check if a key (ctrl for instance) is down */
    const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
    })();



}

  /* Select category to annotate for */

function selectCat(){

  const categoryButtons = document.querySelectorAll('#main-view header #choose-category button.category');
  //console.log(categoryButtons);
  for (let button of categoryButtons){
    //console.log(button);
    button.addEventListener('click', selectThisCategory);
  }

  function selectThisCategory(e){
    const thisButton = e.target;
    const actualCategoryButtons = document.querySelectorAll('#main-view header #choose-category button.category');
    for (let button of actualCategoryButtons){
      if (button===thisButton){
        if (!button.classList.contains('selected')){
        //console.log('yes');
        button.classList.add('selected');
      }else{
        //console.log('no');
        button.classList.remove('selected');
      }
      } else {
        //console.log('no');
        button.classList.remove('selected');
      }
    }
  }

}


  /* Tab change */
function tabChange() {
  window.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('[role="tab"]');
  const tabList = document.querySelector('[role="tablist"]');

  // Add a click event handler to each tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTabs);
  });

  // Enable arrow navigation between tabs in the tab list
  let tabFocus = 0;

  tabList.addEventListener("keydown", (e) => {
    // Move right
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      tabs[tabFocus].setAttribute("tabindex", -1);
      if (e.key === "ArrowRight") {
        tabFocus++;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === "ArrowLeft") {
        tabFocus--;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute("tabindex", 0);
      tabs[tabFocus].focus();
    }
  });
  });

  function changeTabs(e) {
  const target = e.target;
  const parent = target.parentNode;
  const grandparent = parent.parentNode;

  // Remove all current selected tabs
  parent
    .querySelectorAll('[aria-selected="true"]')
    .forEach((t) => t.setAttribute("aria-selected", false));
  parent
    .querySelectorAll('[tabindex="0"]')
    .forEach((t) => t.setAttribute("tabindex", "-1"));

  // Set this tab as selected
  target.setAttribute("aria-selected", true);
  target.setAttribute("tabindex", "0");

  // Hide all tab panels
  grandparent
    .querySelectorAll('[role="tabpanel"]')
    .forEach((p) => p.setAttribute("hidden", true));

  // Show the selected panel
  grandparent.parentNode
    .querySelector(`#${target.getAttribute("aria-controls")}`)
    .removeAttribute("hidden");
  }
}



tabChange();
refreshData();
setTimeout(()=>{
  
  loadImages();
  

  drag_select();
  //selectCat();
}, 10);

const dialogs = document.querySelectorAll("[role='dialog']");
dialogs.forEach((dialog)=>{
  const closeDialog = dialog.querySelector('#close-dialog');
  closeDialog.addEventListener('click', ()=> {
    dialog.setAttribute('aria-hidden', true);
  })

})

const resetSelectionButton = document.querySelector("#reset-selection");
resetSelectionButton.addEventListener('click', resetSelection);

function resetSelection(){
  const selectables = document.querySelectorAll(".selectable")
  //console.log(selectables);
  for (const selectable of selectables){
    selectable.classList.remove('intersected');
    selectable.classList.remove('not-intersected');
  }

}

const testButton = document.querySelector('#test-add-category');
testButton.addEventListener('click', testAddCategory);
function testAddCategory(){
  const createCategoryDialog = document.querySelector("[role='dialog']#create-category");
  createCategoryDialog.setAttribute('aria-hidden', 'false');
  const createCategoryForm = createCategoryDialog.querySelector("form.create-category");
  createCategoryForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    let name = createCategoryForm.querySelector("#id_name").value;
    let description = createCategoryForm.querySelector("#id_description").value;
    sendCreateRequest(name, description);
    createCategoryDialog.setAttribute('aria-hidden', 'true');
    setTimeout(()=>{
      createCategoryForm.querySelector("#id_name").value="";
      createCategoryForm.querySelector("#id_description").value="";
    },10);
    setTimeout(refreshData, 10);
  })
}

function sendCreateRequest(name, description){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "./category/create-inside", true);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              //console.log("Instance créée avec succès !");
          } else {
              //console.error("Erreur lors de la création de l'instance :", xhr.status);
          }
      }
  };

  /*var data = JSON.stringify({
      champ1: "test-cat",
      champ2: "test-description"
      // Ajoutez d'autres champs selon vos besoins
  });*/
  let data = new FormData();
  data.append('name', name);
  data.append('description', description);
  //console.log(xhr);
  //console.log(data);
  xhr.send(data);
}


function fetchCategories(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./fetch-models-data", true);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            //console.log(response);
            const categories = response.modelsData.category;
            treatCategories(categories);
            //console.log(categories);
            //console.log("Data fetched !");
          } else {
            //console.error("Fetch error :", xhr.status);
          }
      }
  };
  xhr.send();
  setTimeout(selectCat, 10);
}

async function refreshData(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./fetch-models-data", true);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            //console.log(response);
            modelsDataToActualize = response.modelsData;
            console.log(modelsDataToActualize);
            //console.log(categories);
            //console.log("Data fetched !");
          } else {
            //console.error("Fetch error :", xhr.status);
          }
      }
  };
  xhr.send();
  treatCategories(modelsDataToActualize.category);
  selectCat();
}



function treatCategories(categories){
  console.log('treating categories');
  const chooseCategories = document.querySelector("#choose-category ul#categories");
  const deleteCategories = document.querySelector("#delete-category ul#categories-to-delete");
  const catButtons = Array.from(chooseCategories.querySelectorAll(":not(button)"));
  //console.log('catButtons',catButtons);
  const sidebarCategories = document.querySelector("aside ul#categories");
  const catLinks = Array.from(sidebarCategories.querySelectorAll(":not(li, a)"));
  //console.log('catLinks',catLinks);
  for (const category of categories){
    const catButton = document.createElement('button');
    catButton.setAttribute('class', 'category');
    catButton.textContent = category.name;
    catButtons.push(catButton);

    const catLink = document.createElement('li');
    //console.log(catLink);
    const link = document.createElement('a');
    link.setAttribute('href', `./category/${category.id}`);
    link.setAttribute('target', '_blank');
    link.textContent = category.name;
    catLink.appendChild(link);
    catLinks.push(catLink);
  }
  const cattButtonsDelete = [];
  catButtons.forEach((e)=>{
    const newE = e.cloneNode(true);
    newE.setAttribute('type', 'button');
    cattButtonsDelete.push(newE);
  });
  //console.log('catButtons',catButtons);
  //console.log('catLinks',catLinks);
  chooseCategories.replaceChildren();
  sidebarCategories.replaceChildren();
  deleteCategories.replaceChildren();
  chooseCategories.append(...catButtons);
  sidebarCategories.append(...catLinks);
  deleteCategories.append(...cattButtonsDelete);
  

}

const deleteCategoriesButton = document.querySelector('#delete-category-button');
deleteCategoriesButton.addEventListener('click', deleteCategories);
function deleteCategories(){
  const deleteCategoryDialog = document.querySelector("[role='dialog']#delete-category");
  deleteCategoryDialog.setAttribute('aria-hidden', 'false');
  const deleteCategoryForm = deleteCategoryDialog.querySelector("div.delete-category");
  const categoriesAvailable = deleteCategoryForm.querySelectorAll("button.category");
  //console.log(categoriesAvailable);
  categoriesAvailable.forEach((button)=>{
    button.addEventListener('click', (e)=>{
      e.preventDefault();
      const node = e.target;
      if (!node.classList.contains('selected-for-delete')){
        node.classList.add('selected-for-delete');
      } else {
        node.classList.remove('selected-for-delete');
      }
    })
  })
  const submitDelete = deleteCategoryForm.querySelector("button#delete");
  //console.log(submitDelete);
  
  submitDelete.addEventListener('click', (e)=>{
    e.preventDefault();
    const categoriesToDelete = document.querySelectorAll("button.selected-for-delete");
    //console.log(categoriesToDelete);
    categoriesToDelete.forEach((button) =>{
      const name = button.textContent;
      //console.log(name);
      sendDeleteRequest(name);
      deleteCategoryDialog.setAttribute('aria-hidden', 'true');
    })
    setTimeout(refreshData, 10);
  })
}



function sendDeleteRequest(name){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "./category/delete-inside", true);
  //xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
  xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              //console.log("Instance créée avec succès !");
          } else {
              //console.error("Erreur lors de la création de l'instance :", xhr.status);
          }
      }
  };

  /*var data = JSON.stringify({
      champ1: "test-cat",
      champ2: "test-description"
      // Ajoutez d'autres champs selon vos besoins
  });*/
  let data = new FormData();
  data.append('name', name);
  //console.log(xhr);
  //console.log(data);
  xhr.send(data);
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Recherchez le cookie CSRF
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

