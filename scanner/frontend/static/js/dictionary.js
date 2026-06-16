// Настраиваем отображение окна при загрузке
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("word-details-modal");
    console.log("DOM загружен, ширина экрана:", window.innerWidth);
    console.log("Модальное окно найдено:", modal !== null);
    if (modal) {
        modal.classList.remove("show");
        // На десктопе (>768px) показываем окно как карточка
        if (window.innerWidth > 768) {
            modal.style.display = "flex";
            console.log("Режим десктопа: окно показывается как карточка");
        } else {
            // На мобильных CSS уже скрывает окно
            console.log("Режим мобильный: окно скрыто CSS");
        }
    }
});

function openWordDetails() {
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        modal.classList.add("show");
        // На десктопе ничего дополнительного не нужно
    }
}

function closeWordDetails() {
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        modal.classList.remove("show");
    }
}

// Закрытие по клику на фон
document
    .getElementById("word-details-modal")
    .addEventListener("click", function (event) {
        if (event.target === this) {
            closeWordDetails();
        }
    });
