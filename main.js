let sbomData = null;

const renderSbomInfo = (sbomData, licenses) => {
    const packageNameElement = document.getElementById("package-name");
    const packageCountElement = document.getElementById("package-count");
    const uniqueLicensesElement = document.getElementById("unique-licenses");

    packageNameElement.textContent = sbomData.name;
    packageCountElement.textContent = sbomData.packages.length;
    uniqueLicensesElement.textContent = Object.keys(licenses).length;
};

function renderPackageList(packages) {
    const list = document.getElementById("package-list");
    list.innerHTML = "";
    packages.forEach((package) => {
        const packageElement = document.createElement("li");
        packageElement.textContent = package.name;

        if (package?.versionInfo?.length) {
            const packageVersionElement = document.createElement("span");
            packageVersionElement.textContent = package.versionInfo;
            packageVersionElement.classList.add("badge");
            packageElement.appendChild(packageVersionElement);
        }

        list.appendChild(packageElement);
    });
}

function renderLicenseFilter(licenses) {
    const filterInputs = document.getElementById("license-filter-inputs");
    Object.keys(licenses).forEach((licenseKey) => {
        const licenseCount = licenses[licenseKey];
        const fieldContainer = document.createElement("div");
        const checkboxInput = document.createElement("input");
        const checkboxLabel = document.createElement("label");

        fieldContainer.classList.add("field-container");

        checkboxInput.name = "license";
        checkboxInput.value = licenseKey;
        checkboxInput.type = "checkbox";
        checkboxInput.id = licenseKey;
        checkboxInput.addEventListener("change", handleLicenseFilterChange);

        checkboxLabel.textContent = licenseKey;
        const licenseCountElement = document.createElement("span");
        licenseCountElement.textContent = licenseCount;
        licenseCountElement.classList.add("badge");

        checkboxLabel.appendChild(licenseCountElement);
        checkboxLabel.htmlFor = licenseKey;

        fieldContainer.appendChild(checkboxInput);
        fieldContainer.appendChild(checkboxLabel);
        filterInputs.appendChild(fieldContainer);
    });
}

function getLicenses(packages) {
    const licenses = {};
    packages.forEach((package) => {
        if (package?.licenseConcluded?.length) {
            if (licenses?.[package?.licenseConcluded]) {
                licenses[package.licenseConcluded] = licenses[package.licenseConcluded] + 1;
            } else {
                licenses[package.licenseConcluded] = 1;
            }
        }
    });
    return licenses;
}

function handleLicenseFilterChange(event) {
    const checkedLicenses = Array.from(document.querySelectorAll("input[name=license]:checked")).map(
        (input) => input.value
    );
    if (checkedLicenses.length) {
        const filteredPackages = sbomData.packages.filter((pkg) => checkedLicenses.includes(pkg.licenseConcluded));
        renderPackageList(filteredPackages);
    } else {
        renderPackageList(sbomData.packages);
    }
}

function onDragAndDropChange(files) {
    const file = files[0];
    if (file.type === "application/json") {
        hideElement(document.getElementById("file-input-container"));
        showElement(document.getElementById("results-container"));
        const reader = new FileReader();
        reader.onload = function (e) {
            sbomData = JSON.parse(e.target.result);
            const licenses = getLicenses(sbomData.packages);
            renderSbomInfo(sbomData, licenses);
            renderPackageList(sbomData.packages);
            renderLicenseFilter(licenses);
        };
        reader.readAsText(file);
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function setHighlight(isHighlighted) {
    const fileInputContainerElement = document.getElementById("file-input-container");
    if (isHighlighted) {
        fileInputContainerElement.classList.add("highlighted");
    } else {
        fileInputContainerElement.classList.remove("highlighted");
    }
}

const handleFiles = (files) => {
    onDragAndDropChange(files);
};

function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function initFileInput() {
    const fileInputContainerElement = document.getElementById("file-input-container");
    // Prevent defaults
    fileInputContainerElement.addEventListener("dragenter", preventDefaults, false);
    fileInputContainerElement.addEventListener("dragover", preventDefaults, false);
    fileInputContainerElement.addEventListener("dragleave", preventDefaults, false);
    fileInputContainerElement.addEventListener("drop", preventDefaults, false);

    // Highlight
    fileInputContainerElement.addEventListener(
        "dragenter",
        () => {
            setHighlight(true);
        },
        false
    );
    fileInputContainerElement.addEventListener(
        "dragover",
        () => {
            setHighlight(true);
        },
        false
    );

    // Unhighlight
    fileInputContainerElement.addEventListener(
        "dragleave",
        () => {
            setHighlight(false);
        },
        false
    );
    fileInputContainerElement.addEventListener(
        "drop",
        () => {
            setHighlight(false);
        },
        false
    );

    // Hande drop
    fileInputContainerElement.addEventListener("drop", handleDrop, false);
}

function hideElement(element) {
    element.classList.add("hidden");
}

function showElement(element) {
    element.classList.remove("hidden");
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        hideElement(document.getElementById("results-container"));
        initFileInput();
    },
    false
);
