let modelsDataToActualize;
let currentVideo;
let nbImages = $("#number-of-images-filter").val();
console.log($("#number-of-images-filter"));

function waitForEl(selector, callback) {
    if ($(selector).length) {
      callback();
      console.log('true');
    } else {
        console.log(false);
      setTimeout(function() {
        waitForEl(selector, callback);
      }, 10);
    }
  };
  
$(document).ready(function (){
    modelsDataToActualize = JSON.parse($("#models-data").text());
    nbImages = $("#number-of-images-filter").val();
    generatefullHTML();
    
})    




function loadImages() {
    const gallery = $('#main-view .gallery');
    const gallery2 = $('#images .gallery');

    appendImages(range(0, 79).map(toJPGPath).map(addImgDir), gallery);
    //appendImages(range(15, 29).map(toJPGPath).map(addImgDir), gallery2);
}

function appendImages(images, container) {
    $.each(images, function(_, image) {
        container.append($('<div>').addClass('box selectable').append($('<img>').attr('src', image)));
    });
}


function fetchVideos(){
    let videos = modelsDataToActualize.video
    $.each(videos, function (_, video) { 
        console.log($("select#video_filter"));
        $("select#video-filter").append($('<option>').attr('value', video.code).text(video.name));
    });
    
}

function filterVideo(){
    console.log($("select#video-filter").prop('selectedIndex'));
    if (!($("select#video-filter").val()==="")){
        currentVideo = $("select#video-filter").val();
        console.log(currentVideo);
        let list_images = [];
        $('#main-view .gallery').empty();
        console.log(modelsDataToActualize.keyFrame);
        let c =0;
        $.each(modelsDataToActualize.keyFrame, function (_, kf) { 
            if (kf.video_id === currentVideo){
                c++;
            $('#main-view .gallery').append($('<div>').addClass('box selectable').append($('<img>').attr('src', kf.path)));
            }
            
            if (c==nbImages){
                return false;
            }
            
        });
        dragSelect3();
        //appendImages(list_images, $('#main-view .gallery'));
        observer.observe();
    }
    
}

function updateNbImages(){
    nbImages = $("#number-of-images-filter").val();
    console.log(nbImages);
}


function loadImagesFromData() {
    let images = modelsDataToActualize.keyFrame

    $.each(images, function (_, image) { 
        $('#main-view .gallery').append($('<div>').addClass('box selectable').append($('<img>').attr('src', image.path)));
    });

    
}

function dragSelect3() {
    $( "#selectable" ).selectable();
  }


function dragSelect2(){
    const ds = new DragSelect({
        selectables: $(".selectable"),
      });
      
      ds.subscribe("DS:end", (e) => {
        console.log(e);
      });
}


function getElementPosition(element) {
    const offset = element.position();
    const width = element.outerWidth();
    const height = element.outerHeight();

    return {
        x: offset.left,
        y: offset.top,
        width: width,
        height: height
    };
}

function dragSelect() {
    const selectables = [];
    console.log($(".selectable"))
    $(".selectable").each(function() {
        const { x, y, width, height } = getElementPosition($(this));
        selectables.push({ x, y, width, height, elem: $(this)});
        $(this).data('info', JSON.stringify({ x, y, width, height }));
    });
    console.log(selectables);

    

    function checkRectIntersection(r1, r2) {
        //console.log(r1.x, r1.y, r1)
        return !(r1.x + r1.width < r2.x ||
            r2.x + r2.width < r1.x ||
            r1.y + r1.height < r2.y ||
            r2.y + r2.height < r1.y);
    }

    const main_view = $('[role="tabpanel"]#main-view');
    const gallleryContainer = $('.gallery-container');
    gallleryContainer.on("pointerdown", createSelectAreaDiv);

    async function createSelectAreaDiv(event) {
        event.preventDefault();
        const x = event.pageX + main_view.scrollLeft();
        const y = event.pageY + main_view.scrollTop();
        //console.log(x,y);
        //console.log(event.pageX, event.pageY);
        console.log(x,y);

        const true_sel = $('<div>').css({
            position: "absolute",
            zIndex: "10",
            width: "0",
            height: "0",
            left: x + "px",
            top: y + "px"
        });

        const box_sel = $('<div>').css({
            position: "absolute",
            zIndex: "10",
            width: "0",
            height: "0",
            left: event.pageX + "px",
            top: event.pageY + "px"
        }).addClass("drag-select");

        gallleryContainer.append(true_sel).append(box_sel);

        function checkSelectedUp() {
            let i=0;
            const { x, y, height, width } = getElementPosition(true_sel);
            console.log(width);
            
            $.each(selectables, function(_, selectable) {
                if (checkRectIntersection({ x, y, width, height }, selectable)) {
                    console.log(i++,{ x, y, width, height }, selectable);
                    if (!$(selectable.elem).hasClass("intersected")) {
                        $(selectable.elem).addClass("intersected").removeClass('not-intersected');
                    } else {
                        if (height === 0 && width === 0) {
                            $(selectable.elem).removeClass("intersected").addClass('not-intersected');
                        }
                    }
                } else {
                    if (!is_key_down('Control')) {
                        $(selectable.elem).removeClass("intersected").addClass('not-intersected');
                    }
                }
            });
        }

        function checkSelectedMove() {
            const { x, y, height, width } = getElementPosition(true_sel);
            $.each(selectables, function(_, selectable) {
                if (checkRectIntersection({ x, y, width, height }, selectable)) {
                    if (!$(selectable.elem).hasClass("intersected")) {
                        $(selectable.elem).addClass("intersected").removeClass('not-intersected');
                    }
                } else {
                    if (!is_key_down('Control')) {
                        $(selectable.elem).removeClass("intersected");
                    }
                }
            });
        }
        

        function resize(event) {
            const diffX = event.pageX + main_view.scrollLeft() - x;
            const diffY = event.pageY + main_view.scrollTop() - y;

            true_sel.css({
                left: diffX < 0 ? x + diffX + "px" : true_sel.css('left'),
                top: diffY < 0 ? y + diffY + "px" : true_sel.css('top'),
                height: Math.abs(diffY) + "px",
                width: Math.abs(diffX) + "px"
            });

            box_sel.css({
                left: diffX < 0 ? x + diffX - main_view.scrollLeft() + "px" : box_sel.css('left'),
                top: diffY < 0 ? y + diffY - main_view.scrollTop() + "px" : box_sel.css('top'),
                height: Math.abs(diffY) + "px",
                width: Math.abs(diffX) + "px"
            });
            //console.log($(true_sel).offset().left, $(box_sel).offset().left);
            checkSelectedMove(); // extra line 1
        }
        function addEventListenerOnce(element, event, handler) {
            // Fonction de gestionnaire d'événements qui supprime l'événement après son déclenchement
            function onceHandler(event) {
                handler(event);
                $(element).off(event, onceHandler); // Supprime le gestionnaire d'événements après qu'il a été déclenché
            }
        
            // Ajoute le gestionnaire d'événements
            $(element).on(event, onceHandler);
        }

        gallleryContainer.on("pointermove", resize);
        /*gallleryContainer.on("pointerup", function() {
            gallleryContainer.off("pointermove", resize);
            //console.log(true_sel);
            checkSelectedUp();
            true_sel.remove();
            box_sel.remove();
        }//, { once: true }
    );*/
        addEventListenerOnce(gallleryContainer, "pointerup", ()=>{
            gallleryContainer.off("pointermove", resize);
            //console.log(true_sel);
            checkSelectedUp();
            true_sel.remove();
            box_sel.remove();})
    }

    const is_key_down = (() => {
        const state = {};

        $(window).on('keyup', (e) => state[e.key] = false);
        $(window).on('keydown', (e) => state[e.key] = true);

        return (key) => state.hasOwnProperty(key) && state[key] || false;
    })();
}

function tabChange() {
    const tabs = $('[role="tab"]');
    const tabList = $('[role="tablist"]');

    tabs.on("click", changeTabs);

    let tabFocus = 0;

    tabList.on("keydown", function(e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            tabs.eq(tabFocus).attr("tabindex", -1);
            if (e.key === "ArrowRight") {
                tabFocus++;
                if (tabFocus >= tabs.length) {
                    tabFocus = 0;
                }
            } else if (e.key === "ArrowLeft") {
                tabFocus--;
                if (tabFocus < 0) {
                    tabFocus = tabs.length - 1;
                }
            }

            tabs.eq(tabFocus).attr("tabindex", 0).focus();
        }
    });

    function changeTabs(e) {
        const target = $(e.target);
        const parent = target.parent();
        const grandparent = parent.parent();

        parent.find('[aria-selected="true"]').attr("aria-selected", false).attr("tabindex", -1);
        parent.find('[tabindex="0"]').attr("tabindex", -1);

        target.attr("aria-selected", true).attr("tabindex", 0);

        grandparent.parent().find(`#${target.attr("aria-controls")}`).removeAttr("hidden");
    }
}

function selectCat() {
    const categoryButtons = $('#main-view header #choose-category button.category');
    console.log(categoryButtons);
    categoryButtons.on('click', selectThisCategory);

    function selectThisCategory(e) {
        const thisButton = $(e.target);
        const actualCategoryButtons = $('#main-view header #choose-category button.category');
        actualCategoryButtons.each(function() {
            if ($(this).is(thisButton)) {
                if (!$(this).hasClass('selected')) {
                    $(this).addClass('selected');
                } else {
                    $(this).removeClass('selected');
                }
            } else {
                $(this).removeClass('selected');
            }
        });
    }
}


function sendCreateRequest(name, description) {
    const data = new FormData();
    data.append('name', name);
    data.append('description', description);

    $.ajax({
        type: "POST",
        url: "./category/create-inside",
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            //console.log("Instance créée avec succès !");
        },
        error: function(xhr, status, error) {
            //console.error("Erreur lors de la création de l'instance :", xhr.status);
        }
    });
}


async function refreshData() {
    $.ajax({
        type: "GET",
        url: "./fetch-models-data",
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            modelsDataToActualize = response.modelsData;
            treatCategories(modelsDataToActualize.category);
        },
        error: function(xhr, status, error) {
            //console.error("Fetch error :", xhr.status);
        }
    });
    setTimeout(selectCat, 50)
}

function treatCategories(categories) {
    const chooseCategories = $("#choose-category ul#categories");
    const deleteCategories = $("#delete-category ul#categories-to-delete");
    const sidebarCategories = $("aside ul#categories");

    chooseCategories.find("*").not("li").remove();
    sidebarCategories.empty();
    deleteCategories.empty();

    $.each(categories, function(_, category) {
        const catButton = $('<button>').addClass('category').addClass('lozad').text(category.name);
        chooseCategories.append(catButton);

        const catLink = $('<li>').addClass('lozad');
        const link = $('<a>').addClass('lozad').attr('href', `./category/${category.id}`).attr('target', '_blank').text(category.name);
        catLink.append(link);
        sidebarCategories.append(catLink);

        const cattButtonDelete = catButton.clone().attr('type', 'button');
        deleteCategories.append(cattButtonDelete);
    });
}


function deleteCategories() {
    const deleteCategoryDialog = $("[role='dialog']#delete-category");
    deleteCategoryDialog.attr('aria-hidden', 'false');
    const deleteCategoryForm = deleteCategoryDialog.find("div.delete-category");
    const categoriesAvailable = deleteCategoryForm.find("button.category");

    categoriesAvailable.on('click', function(e) {
        e.preventDefault();
        const node = $(this);
        if (!node.hasClass('selected-for-delete')) {
            node.addClass('selected-for-delete');
        } else {
            node.removeClass('selected-for-delete');
        }
    });

    const submitDelete = deleteCategoryForm.find("button#delete");
    submitDelete.on('click', function(e) {
        e.preventDefault();
        const categoriesToDelete = $("button.selected-for-delete");
        categoriesToDelete.each(function() {
            const name = $(this).text();
            sendDeleteRequest(name);
            deleteCategoryDialog.attr('aria-hidden', 'true');
        });
        setTimeout(refreshData, 10);
    });
}

function sendDeleteRequest(name) {
    const data = new FormData();
    data.append('name', name);

    $.ajax({
        type: "POST",
        url: "./category/delete-inside",
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            //console.log("Instance créée avec succès !");
        },
        error: function(xhr, status, error) {
            //console.error("Erreur lors de la création de l'instance :", xhr.status);
        }
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function generatefullHTML(){
    treatCategories(modelsDataToActualize.category);
    //loadImagesFromData();
    dragSelect3();
    fetchVideos();
    $("[role='dialog'] #close-dialog").on('click', function() {
        $(this).closest("[role='dialog']").attr('aria-hidden', true);
    });

    $("#reset-selection").on('click', function() {
        $(".selectable").removeClass('intersected not-intersected');
    });

    $("#test-add-category").on('click', function() {
        const createCategoryDialog = $("[role='dialog']#create-category");
        createCategoryDialog.attr('aria-hidden', 'false');
        createCategoryDialog.find("form.create-category").on('submit', function(e) {
            e.preventDefault();
            const data = $(this).serializeArray();
            sendCreateRequest(data[0].value, data[1].value);
            createCategoryDialog.attr('aria-hidden', 'true');
            setTimeout(refreshData, 10);
        });
    });

    $('#delete-category-button').on('click', deleteCategories);
    $('.gallery').on('mousedown', ()=>{
        $('.gallery').on('mousemove', ()=>{
        console.log('yayayya');
        console.log($(".ui-selectable-helper"));
        console.log(window.getComputedStyle(($(".ui-selectable-helper")).get(0)));});
    });
}

const observer = lozad('.lozad', {
    rootMargin: '10px 0px',
    threshold: 0.1,
    // loaded: function (el) {
    //     if (USE_MAGNIFIER) {
    //         $(el).elevateZoom({
    //             tint: true,
    //             tintColour: '#F90',
    //             tintOpacity: 0.5,
    //             scrollZoom: true
    //         });
    //     }
    // }
})
;
//generatefullHTML();
// Initialisation des fonctionnalités
//tabChange();
//refreshData();
/*setTimeout(function() {
    loadImages();
    dragSelect();
}, 10);*/








