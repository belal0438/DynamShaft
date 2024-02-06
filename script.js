let autoFeeder;
function toggleCheckboxValue(id) {
  let checkbox = document.getElementById(id);
  autoFeeder = checkbox.checked;
}

let ShowUi;
function toggleCheckboxValueUi(id) {
  let checkbox = document.getElementById(id);
  ShowUi = checkbox.checked;
}

let DWObject;

Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", Dynamsoft_OnReady);

function Dynamsoft_OnReady() {
  DWObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");

  const thumbnailViewer = DWObject.Viewer.createThumbnailViewer({
    size: "100%",
    rows: 2,
    columns: 2,
  });
  thumbnailViewer.show();
  populateSources();
}

function populateSources() {
  // Clear existing options
  let sourceDropdown = document.getElementById("source");
  sourceDropdown.innerHTML = "";

  // Get all available sources and populate the dropdown
  DWObject.IfShowUI = false; // Disable UI for source selection
  DWObject.OpenSourceManager();
  let sourceCount = DWObject.SourceCount;
  for (let i = 0; i < sourceCount; i++) {
    let sourceName = DWObject.GetSourceNameItems(i);
    let option = document.createElement("option");
    option.value = i;
    option.text = sourceName;
    sourceDropdown.add(option);
  }
  DWObject.CloseSourceManager();
}

function toggleShowUI() {
  if (DWObject) {
    DWObject.IfShowUI = document.getElementById("showUI").checked;
  }
}

let selectedValueResolution;
function updateResolution() {
  const resolutionSelect = document.getElementById("resolution");
  selectedValueResolution = resolutionSelect.value;
}

const radioButtons = document.getElementsByName("pixelType");
let selectedPixelValue;
radioButtons.forEach(function (radioButton) {
  radioButton.addEventListener("change", function () {
    const selectedValue = document.querySelector(
      'input[name="pixelType"]:checked'
    ).value;
    selectedPixelValue = selectedValue;
  });
});

// hlper function for acquireImage()
function ImagesAqure() {
  return DWObject.AcquireImageAsync({
    IfCloseSourceAfterAcquire: true,
  })
    .then(function (result) {
      console.log("Image acquired successfully. Result:", result);
      // Check if there is an image before attempting to save
      if (DWObject.HowManyImagesInBuffer > 0) {
      } else {
        console.warn("No image available to save.");
      }
    })
    .catch(function (e) {
      console.error("Error acquiring image: " + e.message);
    })
    .finally(function () {
      DWObject.CloseSourceAsync().catch(function (e) {
        console.error(e);
      });
    });
}

function acquireImage() {
  // Configure settings based on user input
  if (DWObject) {
    DWObject.SelectSourceByIndex(document.getElementById("source").value);
    DWObject.IfShowUI = ShowUi;
    DWObject.IfAutoFeed = autoFeeder;
    DWObject.PixelType = selectedPixelValue;
    DWObject.Resolution = parseInt(selectedValueResolution);
  }
  if (ShowUi) {
    if (DWObject) {
      DWObject.OpenSource();
      ImagesAqure();
    }
  } else {
    ImagesAqure();
  }
}

// Function to scan and save all images as a multi-page PDF
function scanAndSaveMultiPagePDF() {
  // Save all images as a multi-page PDF
  if (DWObject) {
    DWObject.IfShowFileDialog = true;
    DWObject.SaveAllAsPDF(
      "E:DynamoShaft3\\result.pdf",
      function () {
        console.log("Multi-page PDF saved successfully!");
      },
      function (errCode, errString) {
        console.error("Error saving multi-page PDF:", errString);
      }
    );
  }
}

// Function to scan and save each image as an individual PDF
function scanAndSaveIndividualPDFs() {
  if (DWObject) {
    DWObject.IfShowFileDialog = false;
    // console.log(DWObject.HowManyImagesInBuffer);
    if (DWObject.HowManyImagesInBuffer > 0) {
      // Iterate through each scanned image
      for (let i = 0; i < DWObject.HowManyImagesInBuffer; i++) {
        let imageIndex = i;
        let pdfFilePath = `temp\\Image_${i + 1}.pdf`;
        // Save the current image as PDF
        DWObject.SaveAsPDF(
          pdfFilePath,
          imageIndex,
          function () {
            console.log("Success:", pdfFilePath);
          },
          function (code, string) {
            console.error(code, string);
          }
        );
      }
      console.log("Done");
    } else {
      console.log("No Scanned Images");
    }
  }
}

// Remove blank images from the viewer
function removeBlankImages() {
  if (DWObject) {
    if (DWObject.IsBlankImageExpress(DWObject.CurrentImageIndexInBuffer)) {
      DWObject.RemoveImage(DWObject.CurrentImageIndexInBuffer);
    } else {
      alert("No Blank Images");
    }
  }
}

// Remove all images from the viewer
function removeAllImages() {
  if (DWObject) {
    DWObject.RemoveAllImages();
    // console.log("All images removed.");
  }
}
