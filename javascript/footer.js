fetch("footer.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("#footer-placeholder").innerHTML = data;
});