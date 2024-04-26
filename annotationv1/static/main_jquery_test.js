let modelsDataToActualize;
let currentAnnotationVideo;
let currentExploreVideo;
let annotationNbImages = $("#annotation-options #number-of-images-filter").val();
let exploreNbImages = $("#explore-options #number-of-images-filter").val();
let exploreCategories = [];

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


  
$(document).ready(function (){
    modelsDataToActualize = JSON.parse($("#models-data").text());
    console.log(modelsDataToActualize);
    //console.log(modelsDataToActualize.keyFrame.filter(function (kf) { return kf.name == "fr2_20220421T224335_s2998_f0"}));
    $('input#start-kf').val(1);
    $('input#end-kf').val(1);
    $('#annotation-options #filter-options #number-of-images-filter').val(15);
    $('#explore-options #filter-options #number-of-images-filter').val(15);
    updateNbImages();
    generatefullHTML();
    $("[role='dialog'] #close-dialog").on('click', function() {
        $(this).closest("[role='dialog']").attr('aria-hidden', true);
    });

    /*$("#reset-selection").on('click', function() {
        $(".selectable").removeClass('intersected not-intersected');
    });*/
    
    $("#add-category-button").on('click', function() {
        $("[role='dialog']#create-category").attr('aria-hidden', 'false');
        console.log('adding event listener');
        
    });
    $("[role='dialog']#create-category").find("form.create-category").on('submit', function(e) {
        e.preventDefault();
        const data = $(this).serializeArray();
        sendCreateRequest(data[0].value, data[1].value);
        $("[role='dialog']#create-category").attr('aria-hidden', 'true');
        $(':input',this)
        .not(':button, :submit, :reset')
        .val('');
        //setTimeout(refreshDisplay, 100);
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
            $(".box.ui-selected").each(function() {
                //let existingAnnotation = modelsDataToActualize.annotations.find(function(annot){return annot.keyframe_id == node.find('img').attr('src')});
                //let existingCategories = (existingAnnotation) ? existingAnnotation.each(function(annot){return annot.category}) : [];
                //existingCategories.push(modelsDataToActualize.category.find(function(category){return category.name == $("button.category.selected").text()}).id);
                const annotation = {
                    keyframe_id: $(this).find('img').attr('src'),
                    category: currentCategory,
                };
                //console.log(annotation);
                annotations.push(annotation);
            });
            if ($("#fast-annotation").is(':checked')){
                $('.box.selectable img').each(function() {
                    //let existingAnnotation = modelsDataToActualize.annotations.find(function(annot){return annot.keyframe_id == node.find('img').attr('src')});
                    //let existingCategories = (existingAnnotation) ? existingAnnotation.each(function(annot){return annot.category}) : [];
                    //existingCategories.push(modelsDataToActualize.category.find(function(category){return category.name == $("button.category.selected").text()}).id);
                    const annotation = {
                        keyframe_id: $(this).attr('src'),
                        annotated: {[currentCategory]: true},
                    };
                    //console.log(annotation);
                    annotations.push(annotation);
                });
        }
            //console.log(annotations);
            //console.log(currentCategory);
            sendAnnotationRequest(annotations);
            
        }
    });

    $('#reset-annotations').on('click', sendResetAnnotationsRequest);
    $("#add-folder-button").on('click', addFolder);
    testFilePicker();
    
})    

function displayImages(){
    displayAnnotationGallery();
    displayExploreGallery();
}


function loadImages() {
    const gallery = $('#annotation-view .gallery');
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
    //$("select#video-filter").find("*").not(".default").remove();
    //console.log($("select#video-filter").find("*").not(".default"));
    //console.log($("select#video-filter"));
    //console.log(modelsDataToActualize.video);
    let videos = modelsDataToActualize.video
    $.each(videos, function (_, video) { 
        //console.log($("select#video_filter"));
        //console.log($("select#video-filter"))
        if ($("#annotation-options select#video-filter").find(`option[value="${video.code}"]`).length === 0){
            $("select#video-filter").append($('<option>').attr('value', video.code).text(video.name));
        }
    });
    
}

function computeKfIndex(keyframes){
    let listKf;
    let list_index = {};
    let listVideos = keyframes.map(function(kf){return kf.video_id});
    listVideos = [...new Set(listVideos)];
    $.each(listVideos, function (_, video) {
        listKf = keyframes.filter(function(kf){return kf.video_id == video});
        listKf.sort(function(a, b) {
            return a.timecode.localeCompare(b.timecode);
        });
        $.each(listKf, function (index, kf) {
            list_index[kf.path] = index;
        });
    });
    keyframes = keyframes.map(function(kf){ 
        return {...kf, 'index': list_index[kf.path]+1};
    }
    );
    return keyframes;
}

function filterVideos(){
    exploreCategories = $('#explore-options input.category-filter:checked').map(function(){return $(this).attr('id')}).get();
    const listVideos = modelsDataToActualize.video;
    if (!($("#annotation-options select#video-filter").val()==="")){
        currentAnnotationVideo = $("#annotation-options select#video-filter").val();
        }
    else {
        if (currentAnnotationVideo === undefined){
            currentAnnotationVideo = listVideos[0].code;
        }
    }
    if (!($("#explore-options select#video-filter").val()==="")){
        currentExploreVideo = $("#explore-options select#video-filter").val();
    }
    else {
        if (currentExploreVideo === undefined){
            currentExploreVideo = listVideos[0].code;
        }
    }

}

function emptyExploreCategories (){
    exploreCategories = [];
}


function displayAnnotationGallery(){
    let listKf = modelsDataToActualize.keyFrame 
    listKf = computeKfIndex(listKf);
    updateNbImages();
    
    $('#annotation-view .gallery').empty();
    const notAnnotatedCats = $('#annotation-options input.not-annotated-filter:checked').map(function(){return $(this).attr('id')}).get();
    //console.log($("select#video-filter").prop('selectedIndex'));
    listKf.sort(function(a, b) {
        return (a.video_id.localeCompare(b.video_id) === 0) ? a.timecode.localeCompare(b.timecode) : a.video_id.localeCompare(b.video_id);
    })
    if (!($("#annotation-options select#video-filter").val()==="")){
        currentAnnotationVideo = $("#annotation-options select#video-filter").val();
        //console.log(notAnnotatedCats);
        //console.log(currentVideo);
        listKf = listKf.filter(function (kf) {
            return kf.video_id === currentAnnotationVideo;
        });
    }
    const N = listKf.length;
    const entireKf = listKf;

    listKf = listKf.filter(function (kf) {
        return notAnnotatedCats.every(function(cat){return kf.annotated[cat] === false});
    });
    
    listKf = listKf.slice(0, annotationNbImages);
    
    //console.log(listKf);
    const existingAnnotations = modelsDataToActualize.annotations;
    //console.log(existingAnnotations);
    listKf = listKf.map(function (kf) {
        let annot = existingAnnotations.filter(function(a){return a.keyframe_id == kf.path});
        //console.log(kf, annot);
        //kf.category = annot.map(function(annot){return annot.category});
        return {...kf, 'category': annot.map(function(annot){return annot.category_id})};
        });
    console.log(listKf);
    const index = entireKf.findIndex(function(kf){return kf.path == listKf[0].path});
    const othernbImages = annotationNbImages-1;
    $('#annotation-options #images-counter').text(`Key frames ${index+1} - ${index+othernbImages+1} / ${N}`)
    $('#annotation-view .gallery').css({'grid-template': `repeat(${(((othernbImages-othernbImages%5))/5)+1},220px)/ repeat(5, 320px)`});
    //console.log($('#annotation-view .gallery').css('grid-template'));
    $.each((listKf), function (_, kf) { 
        //console.log(kf.category.map(function(cat){return 'youpi'}));
        $('#annotation-view .gallery').append($('<div>').addClass('box selectable').append(
            $('<img>').attr('src', `./Datasets/${kf.path}`)).append(
                $('<ul>').addClass('img-label').append(
                    kf.category.map(createLabelList)
                    ),
                $('<ul>').addClass('img-metadata').append(
                    $('<li>').text(`${kf.video_id}`),
                    $('<li>').text(`${kf.timecode}`),
                    $('<li>').text(`n° ${kf.index}`)
                ).css({'display':'flex', 'list-style-type': 'none', 'justify-content': 'space-between', 'font-size':'7pt'})
            ).css({'display':'flex', 'flex-direction':'column'})
        )
        }
    );
        
        
        dragSelect3();
        createSvgLabel();
        //appendImages(list_images, $('#annotation-view .gallery'));
        observer.observe();
}

function changeExploreMode(){
    const exploreMode = $("#explore-options select#mode-choice").val();
    if (exploreMode === 'by-filters'){
        $('#explore-options .by-frame-number').hide();
        $('#explore-options .by-filters').show();
        exploreCategories = [];
    }
    if (exploreMode === 'by-frame-number'){
        $('#explore-options .by-filters').hide();
        $('#explore-options .by-frame-number').show();
        exploreCategories = $('#explore-options input.category-filter:checked').map(function(){return $(this).attr('id')}).get();
    }
    

}

function updateEndKf(){
    const start = $('input#start-kf').val();
    const end = $('input#end-kf').val();
    $('input#end-kf').attr('min', start);
    //console.log(end, start, end < start);
    if (end < start){
        $('input#end-kf').val(start);
    }
}

function displayExploreGallery(){
    changeExploreMode();
    let listKf = modelsDataToActualize.keyFrame 
    listKf = computeKfIndex(listKf);
    console.log(listKf);
    
    $('#explore .gallery').empty();
    //console.log($("select#video-filter").prop('selectedIndex'));
    listKf.sort(function(a, b) {
        return (a.video_id.localeCompare(b.video_id) === 0) ? a.timecode.localeCompare(b.timecode) : a.video_id.localeCompare(b.video_id);
    })
    //console.log($("#explore-options select#video-filter"));
    if (!($("#explore-options select#video-filter").val()==="")){
        currentExploreVideo = $("#explore-options select#video-filter").val();
        //console.log(notAnnotatedCats);
        //console.log(currentVideo);
        listKf = listKf.filter(function (kf) {
            return kf.video_id === currentExploreVideo;
        });
    }
    
    const existingAnnotations = modelsDataToActualize.annotations;
    listKf = listKf.map(function (kf) {
        let annot = existingAnnotations.filter(function(a){return a.keyframe_id == kf.path});
        //console.log(kf, annot);
        //kf.category = annot.map(function(annot){return annot.category});
        return {...kf, 'category': annot.map(function(annot){return annot.category_id})};
        });
    console.log(listKf);

    const exploreMode = $("#explore-options select#mode-choice").val();
    //console.log(exploreMode);
    
    //const entireKf = listKf;
    let othernbImages;
    if (exploreMode === 'by-filters'){
        const categoriesToDisplay = $('#explore-options input.category-filter:checked').map(function(){return $(this).attr('id')}).get();
        if (categoriesToDisplay.length > 0) {
            listKf = listKf.filter(function (kf) {
                return categoriesToDisplay.some(function(cat){return kf.category.includes(cat)});
            });
        }
        const N = listKf.length;
        
        listKf = listKf.slice(0, exploreNbImages);

        const index = listKf.findIndex(function(kf){return kf.path == listKf[0].path});
        othernbImages = exploreNbImages-1;
        $('#explore-options #images-counter').text(`Key frames ${index+1} - ${index+othernbImages+1} / ${N} selected`);


    }
    

    if (exploreMode === 'by-frame-number'){
        const start = $('input#start-kf').val();
        const end = $('input#end-kf').val();
        const N = listKf.length;
        $('input#end-kf').attr('max', N);
        listKf = listKf.slice(start-1, end);
        othernbImages = end-start;
        if (listKf.length > 1){
            $('#explore-options #images-counter').text(`Key frames n° ${start} - ${end} / ${N} (total)`);
        }
        else if (listKf.length === 1){
            $('#explore-options #images-counter').text(`Key frame n° ${start} / ${N}`);
        }
        else{
            $('#explore-options #images-counter').text(`No key frame in this range - ${N} (total)`);
            return;
        }

    }
    //console.log(existingAnnotations);
    listKf = listKf.map(function (kf) {
        let annot = existingAnnotations.filter(function(a){return a.keyframe_id == kf.path});
        //console.log(kf, annot);
        //kf.category = annot.map(function(annot){return annot.category});
        return {...kf, 'category': annot.map(function(annot){return annot.category_id})};
        });
    
    $('#explore .gallery').css({'grid-template': `repeat(${(((othernbImages-othernbImages%5))/5)+1},220px)/ repeat(5, 320px)`});
    //console.log($('#explore .gallery').css('grid-template'));
    //console.log(listKf);
    $.each((listKf), function (_, kf) { 
        //console.log(kf.category.map(function(cat){return 'youpi'}));
        $('#explore .gallery').append($('<div>').addClass('box selectable').append(
            $('<img>').attr('src', `./Datasets/${kf.path}`)).append(
                $('<ul>').addClass('img-label').append(
                    kf.category.map(createLabelList)
                ),
                    $('<ul>').addClass('img-metadata').append(
                        $('<li>').text(`${kf.video_id}`),
                        $('<li>').text(`${kf.timecode}`),
                        $('<li>').text(`n° ${kf.index}`)
                    ).css({'display':'flex', 'list-style-type': 'none', 'justify-content': 'space-between', 'font-size':'7pt'})
                ).css({'display':'flex', 'flex-direction':'column'})
                
            )
        }
    );
        
        
        dragSelect3();
        createSvgLabel();
        //appendImages(list_images, $('#annotation-view .gallery'));
        observer.observe();

}

function createLabelList(cat){
    const color = categoryColors[cat];
    //console.log(color, cat)
    return $('<li>').append(createSvgLabel(cat).css({'fill': color, 'stroke': color}))
                    .append($('<button>').addClass('label').attr('id', cat).text(cat).css({'background-color': color}));
}


function updateNbImages(){
    annotationNbImages = $("#annotation-options #number-of-images-filter").val();
    exploreNbImages = $("#explore-options #number-of-images-filter").val();
    //console.log(nbImages);
}


function loadImagesFromData() {
    let images = modelsDataToActualize.keyFrame

    $.each(images, function (_, image) { 
        $('#annotation-view .gallery').append($('<div>').addClass('box selectable').append($('<img>').attr('src', image.path)));
    });

    
}

function dragSelect3() {
    $( "#annotation-view .gallery" ).selectable({appendTo: $("#annotation-view .gallery")});
    $( "#explore .gallery" ).selectable({appendTo: $("#explore .gallery")});
  }


function tabChange() {
    const tabs = $('.tabs');
    const tabList = $('[role="tablist"]');

    tabList.on("click", changeTabs);

    function changeTabs(e) {
        const label = $(e.target).attr('id');
        const selectedTabpanels = $(`[role="tabpanel"][aria-labelledby="${label}"]`).get();
        //console.log(selectedTabpanels);
        $.each(selectedTabpanels, function (_, tabpanel){$(tabpanel).attr('aria-hidden', false).siblings('[role="tabpanel"]').attr('aria-hidden', true)});
        $(e.target).attr('aria-selected', true).attr('tabindex', 0).siblings().attr('aria-selected', false).attr('tabindex', -1);
        changeExploreMode();
    }
}

function selectCat() {
    const categoryButtons = $('nav header #choose-category button.category');
    //console.log(categoryButtons);
    categoryButtons.on('click', selectThisCategory);
}

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
    setTimeout(refreshDisplay, 100);
}


function refreshData() {
    $.ajax({
        type: "GET",
        url: "./fetch-models-data",
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            modelsDataToActualize = response.modelsData;
            /*setTimeout(function (){
                generateCategoryColors();
                treatCategories(modelsDataToActualize.category);
                displayGallery();
        },
        100)*/
            setTimeout(generatefullHTML, 100);
            

        },
        error: function(xhr, status, error) {
            //console.error("Fetch error :", xhr.status);
        }
    });
    //setTimeout(selectCat, 100)
}


function refreshDisplay() {
    filterVideos();
    const data = new FormData();
    data.append('annotationVideo', currentAnnotationVideo);
    data.append('exploreVideo', currentExploreVideo);
    data.append('exploreCategories', exploreCategories);
    console.log(currentAnnotationVideo, currentExploreVideo, exploreCategories);
    $.ajax({
        type: "POST",
        url: "./fetch-models-data-display",
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            console.log(response.modelsData);
            console.log(response.data);
            modelsDataToActualize = response.modelsData;
            setTimeout(generatefullHTML, 100);
            /*setTimeout(function (){
                displayAnnotationGallery();
        },
        100)*/
            

        },
        error: function(xhr, status, error) {
            //console.error("Fetch error :", xhr.status);
        }
    });
    //setTimeout(selectCat, 100)
}

function treatCategories(categories) {
    const chooseCategories = $("#annotation-options ul#choose-category");
    const deleteCategories = $("#delete-category ul#categories-to-delete");
    const sidebarCategories = $("aside ul#categories");
    const annotationFilterOptions = $("#annotation-options #filter-options");
    const exploreFilterOptions = $("#explore-options #filter-options");

    chooseCategories.find("*").not("li").remove();
    sidebarCategories.empty();
    deleteCategories.empty();
    annotationFilterOptions.find(".not-annotated-filter").remove();
    exploreFilterOptions.find(".category-filter").remove();

    $.each(categories, function(_, category) {
        const catButton = $('<button>').addClass('category').addClass('lozad').text(category.name)
        catButton.on('click', selectThisCategory);
        chooseCategories.append(catButton);

        const catLink = $('<li>').addClass('lozad');
        //console.log(categoryColors[category.name])
        const link = $('<a>').addClass('lozad').addClass('button label').attr('href', `./category/${category.name}`).attr('target', '_blank').text(category.name).css({'background-color': categoryColors[category.name]});
        catLink.append(link);
        sidebarCategories.append(catLink);

        const cattButtonDelete = catButton.clone().attr('type', 'button');
        deleteCategories.append(cattButtonDelete);


        annotationFilterOptions.append($('<input>').addClass('not-annotated-filter').attr('type', "checkbox").attr('id', category.name).attr('value', category.name))
        .append($('<label>').addClass('not-annotated-filter').attr('for', category.name).text(category.name));

        exploreFilterOptions.append($('<input>').addClass('category-filter').attr('type', "checkbox").attr('id', category.name).attr('value', category.name))
        .append($('<label>').addClass('category-filter').attr('for', category.name).text(category.name));
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
        //setTimeout(refreshDisplay, 100);
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
    setTimeout(refreshDisplay, 100);
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
            setTimeout(refreshDisplay, 50);
            
        },
        error: function(xhr, status, error) {
            console.error("Erreur lors de la création de l'instance :", xhr.status);
        }
    });
    ;
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
    fetchVideos();
    //selectCat();
    displayImages();
    dragSelect3();
    tabChange();
}

function sendResetAnnotationsRequest() {
    $.ajax({
        type: "POST",
        url: "./annotations-reset",
        data: {},
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            console.log("Annotations réinitialisées");
            console.log(response);
            
        },
        error: function(xhr, status, error) {
            console.error("Erreur lors de la création de l'instance :", xhr.status);
        }
    });
    setTimeout(refreshDisplay, 50);
    
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
//refreshDisplay();
/*setTimeout(function() {
    loadImages();
    dragSelect();
}, 10);*/

async function testDirectoryPicker(){
    const directoryPicker = await window.showDirectoryPicker();

    // Récupère l'URL du dossier sélectionné
    const directoryUrl = directoryPicker.name;
    
    console.log("URL du dossier sélectionné :", directoryUrl);
    console.log(directoryPicker.keys());
    let c=0;
    for await (const key of directoryPicker.keys()) {
        console.log(key);
        c++;
      }
    console.log(c);

}


function testFilePicker(){
    $("#filepicker").on(
    "change",
    (event) => {
     // let output = $("#listing");
      console.log(event.target.files[0].webkitRelativePath);
      //console.log(event.target);
      //$.each(event.target.files, function(_, file) {
        //console.log(file, file.webkitRelativePath);
        //output.append($('<li>').text(file.webkitRelativePath));
      //}
    //);
    },
  );
}

async function addFolder(){
    const directoryPicker = await window.showDirectoryPicker();

    const newDataset = directoryPicker.name;
    sendCreateDatasetRequest(newDataset);

}

function sendCreateDatasetRequest(name){
    const data = new FormData();
    data.append('name', name);
    console.log(name);
    data.append('currentCategories', modelsDataToActualize.category.map(function(cat){return cat.name}));
    console.log(modelsDataToActualize.category.map(function(cat){return cat.name}));

    $.ajax({
        type: "POST",
        url: "./create-dataset",
        data: data,
        processData: false,
        contentType: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            console.log("Instance créée avec succès !");
            console.log(response);
            autoRefresh();
            
        },
        error: function(xhr, status, error) {
            console.error("Erreur lors de la création de l'instance :", xhr.status);
        }
    });
    //setTimeout(refreshDisplay, 100);
}

function autoRefresh() {
    window.location = window.location.href;
}





