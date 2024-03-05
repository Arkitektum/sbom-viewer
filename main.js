let sbomData = null;

const renderSbomInfo = (sbomData, licenses) => {
    const packageNameElement = document.getElementById("package-name");
    const packageCountElement = document.getElementById("package-count");
    const uniqueLicensesElement = document.getElementById("unique-licenses");

    packageNameElement.textContent = sbomData.name;
    packageCountElement.textContent = sbomData.packages.length;
    uniqueLicensesElement.textContent = licenses.length;
};

function renderPackageList(packages, licenses) {
    const list = document.getElementById("package-list");
    list.innerHTML = "";
    packages.forEach((package) => {
        const packageLicense = getLicenseForPackage(package, licenses);
        const packageElement = document.createElement("li");
        packageElement.textContent = package.name;
        packageElement.style.backgroundColor = packageLicense?.color;

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
    licenses.forEach((license) => {
        const licenseCount = license.count;
        const fieldContainer = document.createElement("div");
        const checkboxInput = document.createElement("input");
        const checkboxLabel = document.createElement("label");

        fieldContainer.classList.add("field-container");
        fieldContainer.style.backgroundColor = license.color;

        checkboxInput.name = "license";
        checkboxInput.value = license.name;
        checkboxInput.type = "checkbox";
        checkboxInput.id = license.name;
        checkboxInput.addEventListener("change", function () {
            handleLicenseFilterChange(licenses);
        });

        checkboxLabel.textContent = license.name;
        const licenseCountElement = document.createElement("span");
        licenseCountElement.textContent = licenseCount;
        licenseCountElement.classList.add("badge");

        checkboxLabel.appendChild(licenseCountElement);
        checkboxLabel.htmlFor = license.name;

        fieldContainer.appendChild(checkboxInput);
        fieldContainer.appendChild(checkboxLabel);
        filterInputs.appendChild(fieldContainer);
    });
}

function renderLicenseGraph(sbomData, licenses) {
    const graphContainer = document.getElementById("license-graph");
    const packageCount = sbomData.packages.length;
    licenses.forEach((license) => {
        const licenseCount = license.count;
        const licensePercentage = (licenseCount / packageCount) * 100;
        const licenseGraphElement = document.createElement("span");
        licenseGraphElement.style.width = licensePercentage + "%";
        licenseGraphElement.style.backgroundColor = license.color;
        licenseGraphElement.classList.add("license-graph-element");
        graphContainer.appendChild(licenseGraphElement);
    });
}

function getLicenseForPackage(package, licenses) {
    const packageLicense = package?.licenseConcluded?.length ? package.licenseConcluded : "No license";
    return licenses.find((license) => license.name === packageLicense);
}

function getLicenses(packages) {
    const licenses = {};
    packages.forEach((package) => {
        const packageLicense = package?.licenseConcluded?.length ? package.licenseConcluded : "No license";
        if (licenses?.[packageLicense]) {
            licenses[packageLicense] = licenses[packageLicense] + 1;
        } else {
            licenses[packageLicense] = 1;
        }
    });
    const licensesArray = Object.keys(licenses).map((key, index) => {
        return { name: key, count: licenses[key], color: `hsl(${(index * 100) % 360}, 92%, 85%)` };
    });
    return licensesArray;
}

function handleLicenseFilterChange(licenses) {
    const checkedLicenses = Array.from(document.querySelectorAll("input[name=license]:checked")).map(
        (input) => input.value
    );
    if (checkedLicenses.length) {
        const filteredPackages = sbomData.packages.filter((pkg) => {
            const packageLicense = pkg?.licenseConcluded?.length ? pkg.licenseConcluded : "No license";
            return checkedLicenses.includes(packageLicense);
        });
        renderPackageList(filteredPackages, licenses);
    } else {
        renderPackageList(sbomData.packages, licenses);
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
            renderPackageList(sbomData.packages, licenses);
            renderLicenseFilter(licenses);
            renderLicenseGraph(sbomData, licenses);
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
