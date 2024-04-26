


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
