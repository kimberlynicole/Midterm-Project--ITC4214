// Fetch the external footer.html file and insert its content into the page
fetch("footer.html")
    .then(response => response.text()) // Convert the response into plain text (HTML content)
    .then(data => {
        // Insert the fetched HTML into the element with id "footer-placeholder"
        document.querySelector("#footer-placeholder").innerHTML = data;
    });