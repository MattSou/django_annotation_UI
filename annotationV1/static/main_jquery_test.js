let modelsDataToActualize;
let currentVideo;
let nbImages = $("#number-of-images-filter").val();

const colorDict = {
    0: '#2080d8',
    1: '#e317b7',
    2: '#ec7456',
    3: '#ceb012',
    4: '#48da85',
    5: 'light-orange',
    6: 'light-pink',
    7: 'pink',
    8: 'brown',
    9: 'black',
    10: 'cyan',
    11: 'grey',
    12: 'light-blue',
    13: 'light-yellow',
    14: 'light-purple',
}


let categoryColors = {};

function generateCategoryColors() {
    const categories = modelsDataToActualize.category;
    $.each(categories, function(_, category) {
        categoryColors[category.name] = colorDict[_];
    }
    );
}


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
    //console.log(modelsDataToActualize.keyFrame.filter(function (kf) { return kf.name == "fr2_20220421T224335_s2998_f0"}));
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
        //console.log($("select#video_filter"));
        $("select#video-filter").append($('<option>').attr('value', video.code).text(video.name));
    });
    
}

function filterVideo(){
    //console.log($("select#video-filter").prop('selectedIndex'));
    if (!($("select#video-filter").val()==="")){
        currentVideo = $("select#video-filter").val();
        //console.log(currentVideo);
        $('#main-view .gallery').empty();
        let c =0;
        let listKf = modelsDataToActualize.keyFrame.filter(function (kf) {
            return kf.video_id === currentVideo;
        });
        listKf.sort(function(a, b) {
            return a.timecode.localeCompare(b.timecode);
        })
        listKf = listKf.slice(0, nbImages);
        
        //console.log(listKf);
        const existingAnnotations = modelsDataToActualize.annotations;
        //console.log(existingAnnotations);
        listKf = listKf.map(function (kf) {
            let annot = existingAnnotations.filter(function(a){return a.keyframe_id == kf.path});
            //console.log(kf, annot);
            //kf.category = annot.map(function(annot){return annot.category});
            return {...kf, 'category': annot.map(function(annot){return annot.category_id})};
            });
        //console.log(listKf);
        const othernbImages = nbImages-1;
        $('#main-view .gallery').css({'grid-template': `repeat(${(((othernbImages-othernbImages%5))/5)+1},220px)/ repeat(5, 320px)`});
        console.log($('#main-view .gallery').css('grid-template'));
        $.each((listKf), function (_, kf) { 
            //console.log(kf.category.map(function(cat){return 'youpi'}));
            $('#main-view .gallery').append($('<div>').addClass('box selectable').append(
                $('<img>').attr('src', kf.path)).append(
                    $('<ul>').addClass('img-label').append(
                        kf.category.map(createLabelList)
                        )
                    )
                )
            }
        );
        
        
    };
        dragSelect3();
        createSvgLabel();
        //appendImages(list_images, $('#main-view .gallery'));
        observer.observe();
}

function createLabelList(cat){
    const color = categoryColors[cat];
    console.log(color, cat)
    return $('<li>').append(createSvgLabel(cat).css({'fill': color, 'stroke': color}))
                    .append($('<button>').addClass('label').attr('id', cat).text(cat).css({'background-color': color}));
}


function updateNbImages(){
    nbImages = $("#number-of-images-filter").val();
    //console.log(nbImages);
}


function loadImagesFromData() {
    let images = modelsDataToActualize.keyFrame

    $.each(images, function (_, image) { 
        $('#main-view .gallery').append($('<div>').addClass('box selectable').append($('<img>').attr('src', image.path)));
    });

    
}

function dragSelect3() {
    $( "#selectable" ).selectable({appendTo: $("#main-view .gallery")});
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
    const categoryButtons = $('nav header #choose-category button.category');
    //console.log(categoryButtons);
    categoryButtons.on('click', selectThisCategory);

    function selectThisCategory(e) {
        const thisButton = $(e.target);
        const actualCategoryButtons = $('nav header #choose-category button.category');
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
        url: "./category/create-inside/",
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
            generateCategoryColors();
            treatCategories(modelsDataToActualize.category);
            filterVideo();

        },
        error: function(xhr, status, error) {
            //console.error("Fetch error :", xhr.status);
        }
    });
    setTimeout(selectCat, 100)
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
        console.log(categoryColors[category.name])
        const link = $('<a>').addClass('lozad').addClass('button label').attr('href', `./category/${category.name}`).attr('target', '_blank').text(category.name).css({'background-color': categoryColors[category.name]});
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
        url: "./category/delete-inside/",
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


function sendAnnotationRequest(annotations) {
    const data = new FormData();
    data.append('body', JSON.stringify(annotations));

    $.ajax({
        type: "POST",
        url: "./keyframe/update",
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            console.log("Instance créée avec succès !");
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.error("Erreur lors de la création de l'instance :", xhr.status);
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
    generateCategoryColors();
    treatCategories(modelsDataToActualize.category);
    //loadImagesFromData();
    dragSelect3();
    fetchVideos();
    selectCat();
    
    $("[role='dialog'] #close-dialog").on('click', function() {
        $(this).closest("[role='dialog']").attr('aria-hidden', true);
    });

    /*$("#reset-selection").on('click', function() {
        $(".selectable").removeClass('intersected not-intersected');
    });*/

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

    $("#save-annotations").on('click', function(e) {
        const annotations = [];
        const currentCategory = $("button.category.selected").text();
        if (currentCategory === "") {
            alert("Veuillez sélectionner une catégorie pour annoter les images.");
            return;
        }
        else{
            //console.log($("button.category.selected").text());
            //console.log(modelsDataToActualize.category);
            $("img.ui-selected").each(function() {
                //let existingAnnotation = modelsDataToActualize.annotations.find(function(annot){return annot.keyframe_id == node.find('img').attr('src')});
                //let existingCategories = (existingAnnotation) ? existingAnnotation.each(function(annot){return annot.category}) : [];
                //existingCategories.push(modelsDataToActualize.category.find(function(category){return category.name == $("button.category.selected").text()}).id);
                const annotation = {
                    keyframe_id: $(this).attr('src'),
                    category: currentCategory   ,
                };
                //console.log(annotation);
                annotations.push(annotation);
            });
            console.log(annotations);
            sendAnnotationRequest(annotations);
            
        }
        setTimeout(refreshData, 30);
    });
}

(function($) {
    $.fn.cssSpecific = function(str) {
        var ob = {};
        if(this.length) {
            var css = str.split(', ');
            var prms = [];
            for(var i = 0, ii = css.length; i < ii; i++) {
                prms = css[i].split(':');
                ob[$.trim(prms[0])] = $(this).css($.trim(prms[1] || prms[0]));
            }
        }
        return ob;
    };
})(jQuery);


function GFG_Fun() {
    var styles = $('#GFG_UP').cssSpecific(
'color, backgroundColor, opacity, height, lineHeight:height');
    down.innerHTML = JSON.stringify(styles);
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








