//const { createElement } = require("react");

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i+start)
}
function toJPGPath(x){
  return String(x)+'.jpg';
}

/* Declaring the array of image filenames */
function addImgDir(name){
  return "/static/images/"+name;
}

function onload () {

}
function fetchCategories(){
  return new Promise(
    (resolve) => {
      const choose_cat = document.querySelector('#choose-category');
      const conteneur = document.createElement('iframe');
      iFrame.setAttribute('src', 'category');
      iFrame.setAttribute('seamless','');
      choose_cat.appendChild(iFrame);
      //let conteneur = choose_cat.querySelector('iframe');
      resolve(iFrame);
    }
  )
}


function displayCat () {
  
  return new Promise(
    (resolve, reject)=>{
      const choose_cat = document.querySelector('#choose-category');
      //let conteneur = choose_cat.querySelector('iframe');const choose_cat = document.querySelector('#choose-category');
      const conteneur = document.createElement('iframe');
      conteneur.setAttribute('src', 'category/');
      conteneur.setAttribute('seamless','');
      choose_cat.appendChild(conteneur);
      console.log(conteneur);
      console.log(conteneur.contentDocument)
      conteneur.onload = function () {
        const conteneurContent = conteneur.contentDocument.querySelector('ul');
      
        const sidelist = conteneurContent.cloneNode(true);
        choose_cat.appendChild(conteneurContent);

        choose_cat.removeChild(conteneur);
        const sideCategories = document.querySelector('aside .categories');
        sideCategories.appendChild(sidelist);  
    }
    if (conteneur.contentDocument){
      resolve('Success');
    }else {
      reject('no data fetched');
    }
     
}
);
}

function removeLinks(){
  return new Promise(
    (resolve)=>{
      const choose_cat = document.querySelector('#choose-category');
      console.log(choose_cat);
      let buttons = choose_cat.querySelectorAll('button.category');
      console.log(buttons);
      for (let button of buttons){
        console.log(button);
        const link = button.querySelector('a');
        console.log(link);
        const catName = link.textContent;
        console.log(catName);
        button.textContent = catName;
      } 
      resolve('links removed');
    }
  )
}

function removeButtons(){
  return new Promise(
    (resolve)=>{
      const categories = document.querySelector('aside ul#categories');
      let buttons = categories.querySelectorAll('button.category');
      for (let button of buttons){
        console.log(button);
        const catLink = button.querySelector('a');
        console.log(catLink);
        const liToAdd = document.createElement('li');
        liToAdd.appendChild(catLink);
        //categories.appendChild(catLink);
        button.replaceWith(liToAdd);
      }
      const liToRemove = categories.querySelector('li');
      console.log(liToRemove);
      categories.removeChild(liToRemove);
      const buttonToRemove = categories.querySelector('button');
      categories.removeChild(buttonToRemove);
      //const catlist = categories.querySelector('ul');
      //categories.removeChild(catlist);
      resolve('buttons removed');
    }
  )
}

function loadImages () {
  return new Promise(
    (resolve)=>{
      const gallery = document.querySelector('#main-view .gallery');
      const gallery2 = document.querySelector('#images .gallery');

      
      //{% static 'images/local_library_model_uml.png' %}
      const images = range(0,14).map(toJPGPath).map(addImgDir);
      const images2 = range(15,29).map(toJPGPath).map(addImgDir);

      /* Looping through images */
      for (i in images){
        const box = document.createElement('div');
        box.setAttribute('class', 'box');
        box.classList.add('selectable');
        
        const newImage = document.createElement('img');
        newImage.setAttribute('src', images[i]);
        //newImage.setAttribute('alt', alt_texts[i]);
        box.appendChild(newImage);
        gallery.appendChild(box);}

      
      for (i in images2){
      const box = document.createElement('div');
        box.setAttribute('class', 'box');
        
        const newImage = document.createElement('img');
        newImage.setAttribute('src', images2[i]);
        //newImage.setAttribute('alt', alt_texts[i]);
        box.appendChild(newImage);
        gallery2.appendChild(box);
        
  }
  resolve('success 2');
});
}

function addCat(){
  /* Add a category*/
  return new Promise(
    (resolve)=>{
      const add_cat = document.querySelector('button#add-category');
      console.log(add_cat);
        const categories = document.querySelector('ul#categories');


        add_cat.addEventListener('click', addNEwCategory );

        const dialog = document.querySelector("[role='dialog']");
        //const iframe = document.createElement('iframe');
        //iframe.setAttribute('src', 'category/create');
        //dialog.appendChild(iframe);


        function addNEwCategory(){
        dialog.setAttribute('aria-hidden', false);
        const conteneur = document.querySelector('iframe');

        submit = conteneur.contentDocument.querySelector("[type='submit']");
        submit.addEventListener('click', ()=>{
          dialog.setAttribute('aria-hidden', true);
          autoRefresh();
      });
      }

      resolve('success3');
    });
}




/*window.onload = async function(){
  await displayCat();
  await loadImages();
  await addCat();
  await drag_select();
  
}*/

function drag_select(){


/* Drag-select */
return new Promise(
  (resolve)=>{
    const selectables = [];
    const selectableElems = [...document.querySelectorAll(".selectable")];
    for (const selectable of selectableElems) {
    const {x, y, width, height} = selectable.getBoundingClientRect();
    selectables.push({x: x + window.scrollX, y: y + window.scrollY, width, height, elem: selectable});
    selectable.dataset.info = JSON.stringify({x, y, width, height});
    }

    function checkSelected(selectAreaElem) {
    const select = selectAreaElem.getBoundingClientRect();
    const {x, y, height, width} = select;
    for (const selectable of selectables) {
      if (checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable)){
        if(!selectable.elem.classList.contains("intersected")){
          selectable.elem.classList.add("intersected");
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
    const gallery = document.querySelector('#main-view .gallery');
    console.log(gallery);
    gallery.addEventListener("pointerdown", createSelectAreaDiv);
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
    main_view.append(true_sel);
    main_view.append(box_sel);

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
      checkSelected(true_sel); // extra line 1
    }
      // extra line 2
    gallery.addEventListener("pointermove", resize);
    gallery.addEventListener("pointerup", () => {
      gallery.removeEventListener("pointermove", resize);
      checkSelected(true_sel);
      true_sel.remove();
      box_sel.remove();
    });
    }
    const main_view = document.querySelector('[role="tabpanel"]#main-view');
    /* Check if a key (ctrl for instance) is down */
    const is_key_down = (() => {
    const state = {};

    window.addEventListener('keyup', (e) => state[e.key] = false);
    window.addEventListener('keydown', (e) => state[e.key] = true);

    return (key) => state.hasOwnProperty(key) && state[key] || false;
    })();

    resolve('success 4');
      }
    )



}
  /* Tab change */

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




function autoRefresh() {
  window.location = window.location.href;
}


  //let prom = await fetchCategories();
let promise1 = displayCat();
let promiseLink;
let promise2;
let promise3;
let promise4;
let promiseButton ;
setTimeout(()=>{
  promiseLink = removeLinks();
  promise2 = loadImages();
  promise3 = addCat();
  promise4 = drag_select();
  promiseButton = removeButtons();
}, 1000);
  
/*
let promiseCat = fetchCategories();
let promise1 = displayCat();
let promiseLink = removeLinks();
let promise2 = loadImages();
let promise3 = addCat();
let promise4 = drag_select();
let promiseButton = removeButtons();

let Promises = [promiseCat, promise1, promiseLink, promise2, promise3, promise4, promiseButton]*/


/*async function load() {
  let prom = fetchCategories();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }

  prom = displayCat();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }
  prom = removeLinks();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }
  prom = loadImages();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }
  prom = addCat();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }
  prom = drag_select();
  try {
    const message = await prom;
    console.log(message);
  } catch (error) {
      console.log(error.message);
  }
  prom = removeButtons();
    try {
      const message = await prom;
      console.log(message);
  } catch (error) {
      console.log(error.message);
  }
}
load(); 

promiseCat = promiseCat.then(
  (result) => {
  console.log(result);
  return displayCat()},
  (result) => {
    return fetchCategories();
  }
)
console.log(promiseCat);
*/

promise1
.then((result1) => {
  console.log(result1);
  return promiseLink;
})
.then((resultLink)=>{
  console.log(resultLink);
  return promise2;
})
.then((result2) => {
  console.log(result2);
  return promise3
})
.then((result3)=>{
  console.log(result3);
  return promise4;
})
.then((result4)=>{
  console.log(result4);
  return promiseButton;
})
.then((resultButton)=>{
  console.log(resultButton);
});