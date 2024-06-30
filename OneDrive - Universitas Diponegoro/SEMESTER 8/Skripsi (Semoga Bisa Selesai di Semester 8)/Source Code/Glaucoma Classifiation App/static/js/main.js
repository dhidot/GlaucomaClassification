$(document).ready(function () {
  // Init
  $(".image-section").hide();
  $(".loader").hide();
  $("#result").hide();

  // Predict
  $("#btn-predict").click(function () {
    var form_data = new FormData($("#upload-file")[0]);

    // Show loading animation
    $(this).hide();
    $(".loader").show();

    // Make prediction by calling API /predict
    $.ajax({
      type: "POST",
      url: "/predict",
      data: form_data,
      contentType: false,
      cache: false,
      processData: false,
      async: true,
      success: function (data) {
        // Get and display the result
        $(".loader").hide();
        $("#result").fadeIn(600);
        $("#result").text("Hasil Prediksi: " + data);

        // Set prediction state to true
        predictionMade = true;

        // Hide predict button
        $("#btn-predict").hide();
        console.log("Success!");
      },
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    // Add click event for Prediksi link
    var prediksiLink = document.getElementById("prediksiLink");
    prediksiLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default behavior of the link

      // Fetch and replace content with prediksi.html
      fetch("/prediksi")
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("content").innerHTML = data;
        })
        .catch((error) => console.error("Error fetching content:", error));
    });
  });

  // Get the current URL path
  var path = window.location.pathname;

  // Check if the current path contains "/prediksi"
  if (path.includes("/prediksi")) {
    // If it does, add the "active" class to the "prediksi" element
    $("#prediksi").addClass("active");
    $("#home").removeClass("active");
  } else {
    // If not, remove the "active" class from the "prediksi" element
    $("#prediksi").removeClass("active");
    $("#home").addClass("active");
  }
});

// load image
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");
  const predictionButton = document.getElementById("btn-predict"); // Get the prediction button

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      showPredictionButton(); // Show the "Do Prediction" button
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
      showPredictionButton(); // Show the "Do Prediction" button
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });

  function showPredictionButton() {
    const imageSection = document.querySelector(".button-section");
    imageSection.style.display = "block"; // Display the image section containing the "Do Prediction" button
  }
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
  let predictButton = $("#btn-predict");

  // First time or after prediction - remove the prompt and reset state
  if (dropZoneElement.querySelector(".drop-zone__prompt") || predictionMade) {
    dropZoneElement.querySelector(".drop-zone__prompt")?.remove();
    $("#result").hide();
    predictionMade = false;

    // Show predict button
    if (predictButton) {
      predictButton.fadeIn(600);
    }
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}
