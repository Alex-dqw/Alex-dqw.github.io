function selectImage(tag) {
    // Снимаем выделение со всех изображений:
    var other = document.querySelectorAll("[name='avatar']");
    for (var i = 0, img; img = other[i]; i++) {
        img.setAttribute("src", "img/" + img.getAttribute('alt') + ".png");
        img.classList.remove("team-avatar-selected");
    }
    // Выделяем одно изображение на которое нажали:
    var image = document.querySelector("[alt='"+tag+"']");
    image.setAttribute("src", "img/"+image.getAttribute('alt')+"-selected.png");
    image.classList.add("team-avatar-selected");
}
function selectStart() {
    var other = document.querySelectorAll("[name='avatar']");
    for (var i = 0, img; img = other[i]; i++) {
        if(img.getAttribute("alt") == "avatar2") {
            img.setAttribute("src", "img/" + img.getAttribute('alt') + "-selected.png");
            img.classList.add("team-avatar-selected");
        }
    }
}