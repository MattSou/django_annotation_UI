import { range, toJPGPath, addImgDir } from './functions.js';


const modelsDataHidden = $("#models-data").text();
let modelsDataToActualize = JSON.parse($("#models-data").text());

$("#refresh-data-button").on('click', function(e) {
    e.preventDefault();
    refreshData();
});

function loadImages() {
    const gallery = $('#main-view .gallery');
    const gallery2 = $('#images .gallery');

    const images = range(0, 79).map(toJPGPath).map(addImgDir);
    const images2 = range(15, 29).map(toJPGPath).map(addImgDir);

    $.each(images, function(i, image) {
        const box = $('<div>').addClass('box selectable');
        const newImage = $('<img>').attr('src', image);
        box.append(newImage);
        gallery.append(box);
    });

    $.each(images2, function(i, image) {
        const box = $('<div>').addClass('box');
        const newImage = $('<img>').attr('src', image);
        box.append(newImage);
        gallery2.append(box);
    });
}

function drag_select() {
    const selectables = [];
    const selectableElems = $(".selectable");
    selectableElems.each(function() {
        const { x, y, width, height } = $(this).get(0).getBoundingClientRect();
        selectables.push({ x: x + window.scrollX, y: y + window.scrollY, width, height, elem: $(this).get(0) });
        $(this).data('info', JSON.stringify({ x, y, width, height }));
    });

    function checkSelectedUp(selectAreaElem) {
        const select = selectAreaElem.getBoundingClientRect();
        const { x, y, height, width } = select;
        $.each(selectables, function(_, selectable) {
            if (checkRectIntersection({ x: x + window.scrollX, y: y + window.scrollY, height, width }, selectable)) {
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

    function checkSelectedMove(selectAreaElem) {
        const select = selectAreaElem.getBoundingClientRect();
        const { x, y, height, width } = select;
        $.each(selectables, function(_, selectable) {
            if (checkRectIntersection({ x: x + window.scrollX, y: y + window.scrollY, height, width }, selectable)) {
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

    function checkRectIntersection(r1, r2) {
        return !(r1.x + r1.width < r2.x ||
            r2.x + r2.width < r1.x ||
            r1.y + r1.height < r2.y ||
            r2.y + r2.height < r1.y);
    }

    const main_view = $('[role="tabpanel"]#main-view');
    const gallleryContainer = $('.gallery-container');
    gallleryContainer.on("pointerdown", createSelectAreaDiv);

    function createSelectAreaDiv(event) {
        event.preventDefault();
        const x = event.pageX + main_view.scrollLeft();
        const y = event.pageY + main_view.scrollTop();

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
            checkSelectedMove(true_sel); // extra line 1
        }

        gallleryContainer.on("pointermove", resize);
        gallleryContainer.on("pointerup", function() {
            gallleryContainer.off("pointermove", resize);
            checkSelectedUp(true_sel);
            true_sel.remove();
            box_sel.remove();
        }, { once: true });
    }

    const is_key_down = (() => {
        const state = {};

        $(window).on('keyup', (e) => state[e.key] = false);
        $(window).on('keydown', (e) => state[e.key] = true);

        return (key) => state.hasOwnProperty(key) && state[key] || false;
    })();
}

function selectCat() {
    const categoryButtons = $('#main-view header #choose-category button.category');
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

tabChange();
refreshData();
setTimeout(function() {
    loadImages();
    drag_select();
}, 10);

const dialogs = $("[role='dialog']");
dialogs.each(function() {
    const closeDialog = $(this).find('#close-dialog');
    closeDialog.on('click', function() {
        $(this).closest("[role='dialog']").attr('aria-hidden', true);
    });
});

const resetSelectionButton = $("#reset-selection");
resetSelectionButton.on('click', resetSelection);

function resetSelection() {
    const selectables = $(".selectable");
    selectables.removeClass('intersected not-intersected');
}
const deleteCategoriesButton = $('#delete-category-button');
deleteCategoriesButton.on('click', deleteCategories);

const testButton = $('#test-add-category');
testButton.on('click', testAddCategory);
function fetchCategories() {
    $.ajax({
        type: "GET",
        url: "./fetch-models-data",
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        },
        success: function(response) {
            const categories = response.modelsData.category;
            treatCategories(categories);
        },
        error: function(xhr, status, error) {
            //console.error("Fetch error :", xhr.status);
        }
    });
    setTimeout(selectCat, 10);
}

function testAddCategory() {
    const createCategoryDialog = $("[role='dialog']#create-category");
    createCategoryDialog.attr('aria-hidden', 'false');
    const createCategoryForm = createCategoryDialog.find("form.create-category");
    createCategoryForm.on('submit', function(e) {
        e.preventDefault();
        const name = createCategoryForm.find("#id_name").val();
        const description = createCategoryForm.find("#id_description").val();
        sendCreateRequest(name, description);
        createCategoryDialog.attr('aria-hidden', 'true');
        setTimeout(function() {
            createCategoryForm.find("#id_name").val("");
            createCategoryForm.find("#id_description").val("");
        }, 10);
        setTimeout(refreshData, 10);
    });
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


function refreshData() {
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
    selectCat();
}

function treatCategories(categories) {
    const chooseCategories = $("#choose-category ul#categories");
    const deleteCategories = $("#delete-category ul#categories-to-delete");
    const sidebarCategories = $("aside ul#categories");

    chooseCategories.empty();
    sidebarCategories.empty();
    deleteCategories.empty();

    $.each(categories, function(_, category) {
        const catButton = $('<button>').addClass('category').text(category.name);
        chooseCategories.append(catButton);

        const catLink = $('<li>');
        const link = $('<a>').attr('href', `./category/${category.id}`).attr('target', '_blank').text(category.name);
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

