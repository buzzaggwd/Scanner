function goBack() {
    // window.location.href = "{% url 'levels' %}";
    window.location.href = "/levels/";
}

function startLesson(lessonId) {
    // Здесь будет логика перехода к конкретному уроку
    alert('Начало урока ' + lessonId);
}