
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    
    document.querySelectorAll("[data-year]").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });


    
    const themeButtons = document.querySelectorAll("[data-theme-toggle]");

    try {
        if (localStorage.getItem("discoverLesothoTheme") === "dark") {
            document.body.classList.add("dark-mode");
        }
    } catch (error) {
        console.warn("Theme preference could not be loaded.");
    }

    function updateThemeButton() {
        const isDark = document.body.classList.contains("dark-mode");

        themeButtons.forEach(function (button) {
            button.innerHTML = isDark
                ? "☀ <span>Light mode</span>"
                : "◐ <span>Dark mode</span>";

            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        });
    }

    updateThemeButton();

    themeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");

            try {
                localStorage.setItem(
                    "discoverLesothoTheme",
                    document.body.classList.contains("dark-mode")
                        ? "dark"
                        : "light"
                );
            } catch (error) {
                console.warn("Theme preference could not be saved.");
            }

            updateThemeButton();
        });
    });


    
    const destinationGrid = document.getElementById("destination-grid");

    if (destinationGrid) {
        const cards = Array.from(
            destinationGrid.querySelectorAll(".destination-item")
        );

        const searchInput = document.getElementById("destination-search");
        const filterButtons = Array.from(
            document.querySelectorAll("[data-filter]")
        );
        const resultCount = document.getElementById("results-count");
        const noResults = document.getElementById("no-results");
        const resetButton = document.querySelector(
            "[data-reset-destinations]"
        );

        let activeCategory = "all";

        function filterDestinations() {
            const query = searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

            let visible = 0;

            cards.forEach(function (card) {
                const category = (
                    card.dataset.category || ""
                ).toLowerCase();

                const categoryMatches =
                    activeCategory === "all" ||
                    category === activeCategory;

                const searchableText = (
                    (card.dataset.search || "") + " " +
                    card.textContent
                ).toLowerCase();

                const searchMatches = searchableText.includes(query);
                const show = categoryMatches && searchMatches;

                card.classList.toggle("d-none", !show);

                if (show) {
                    visible++;
                }
            });

            if (resultCount) {
                resultCount.textContent =
                    "Showing " + visible +
                    (visible === 1
                        ? " destination"
                        : " destinations");
            }

            if (noResults) {
                noResults.hidden = visible !== 0;
                noResults.classList.toggle("d-none", visible !== 0);
            }
        }

        function selectCategory(category) {
            activeCategory = category;

            filterButtons.forEach(function (button) {
                const selected = button.dataset.filter === category;

                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            });

            filterDestinations();
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterDestinations);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                selectCategory(button.dataset.filter || "all");
            });
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }

                selectCategory("all");
            });
        }

        // Set the initial filter and result count.
        filterDestinations();
    }


    
    const galleryModalElement = document.getElementById("galleryModal");
    const modalImage = document.getElementById("gallery-modal-image");

    if (
        galleryModalElement &&
        modalImage &&
        window.bootstrap &&
        window.bootstrap.Modal
    ) {
        const galleryModal = new bootstrap.Modal(galleryModalElement);

        document.querySelectorAll("[data-gallery-image]").forEach(function (tile) {
            tile.addEventListener("click", function () {
                const image = tile.querySelector("img");
                const imageSource =
                    tile.dataset.galleryImage ||
                    (image ? image.getAttribute("src") : "");

                if (!imageSource) {
                    return;
                }

                modalImage.src = imageSource;
                modalImage.alt = image
                    ? image.alt
                    : "Selected photograph from Discover Lesotho";

                galleryModal.show();
            });
        });

        galleryModalElement.addEventListener("hidden.bs.modal", function () {
            modalImage.removeAttribute("src");
            modalImage.alt = "";
        });
    }


    
    function showAlert(element, message, type) {
        if (!element) {
            return;
        }

        element.className = "alert alert-" + type;
        element.textContent = message;
        element.classList.remove("d-none");
        element.hidden = false;
    }

    function validateForm(form) {
        const valid = form.checkValidity();

        form.classList.add("was-validated");

        if (!valid) {
            const firstInvalid = form.querySelector(":invalid");

            if (firstInvalid) {
                firstInvalid.focus();
            }
        }

        return valid;
    }

    function saveToBrowser(key, item) {
        try {
            const stored = JSON.parse(localStorage.getItem(key) || "[]");

            if (!Array.isArray(stored)) {
                throw new Error("Stored data is not a list.");
            }

            stored.push(item);
            localStorage.setItem(key, JSON.stringify(stored));

            return true;
        } catch (error) {
            console.error("Could not save data:", error);
            return false;
        }
    }


    
    const bookingForm = document.getElementById("booking-form");

    if (bookingForm) {
        const dateInput = document.getElementById("booking-date");
        const guestsInput = document.getElementById("booking-guests");
        const placeInput = document.getElementById("booking-place");
        const estimate = document.getElementById("booking-estimate");
        const alertBox = document.getElementById("booking-alert");

        if (dateInput && guestsInput && placeInput && estimate) {
            const now = new Date();

            const today = new Date(
                now.getTime() - now.getTimezoneOffset() * 60000
            ).toISOString().split("T")[0];

            dateInput.min = today;

            function calculateEstimate() {
                const guests = Number(guestsInput.value);
                const place = placeInput.value;

                const rate =
                    place === "Pony trekking" ||
                    place === "Highland Passes"
                        ? 250
                        : 150;

                const total =
                    Number.isInteger(guests) &&
                    guests >= 1 &&
                    guests <= 30
                        ? guests * rate
                        : 0;

                estimate.textContent =
                    "M " + total.toLocaleString("en-LS");
            }

            guestsInput.addEventListener("input", calculateEstimate);
            placeInput.addEventListener("change", calculateEstimate);

            calculateEstimate();

            bookingForm.addEventListener("submit", function (event) {
                event.preventDefault();

                if (alertBox) {
                    alertBox.classList.add("d-none");
                }

                const dateValid =
                    Boolean(dateInput.value) &&
                    dateInput.value >= today;

                dateInput.setCustomValidity(
                    dateValid ? "" : "Choose today or a future date."
                );

                const guests = Number(guestsInput.value);
                const guestsValid =
                    Number.isInteger(guests) &&
                    guests >= 1 &&
                    guests <= 30;

                guestsInput.setCustomValidity(
                    guestsValid ? "" : "Choose between 1 and 30 people."
                );

                if (!validateForm(bookingForm)) {
                    showAlert(
                        alertBox,
                        "Please correct the highlighted fields.",
                        "warning"
                    );
                    return;
                }

                const formData = Object.fromEntries(
                    new FormData(bookingForm).entries()
                );

                const rate =
                    formData.place === "Pony trekking" ||
                    formData.place === "Highland Passes"
                        ? 250
                        : 150;

                formData.estimatedGuideCostM = guests * rate;
                formData.savedAt = new Date().toISOString();

                if (!saveToBrowser("discoverLesothoBookings", formData)) {
                    showAlert(
                        alertBox,
                        "Your request could not be saved in this browser.",
                        "danger"
                    );
                    return;
                }

                showAlert(
                    alertBox,
                    "Thank you, " + (formData.name || "visitor") +
                    ". Your sample trip request has been saved in this browser. " +
                    "This is not a confirmed booking.",
                    "success"
                );

                bookingForm.reset();
                guestsInput.value = "2";
                dateInput.setCustomValidity("");
                guestsInput.setCustomValidity("");
                bookingForm.classList.remove("was-validated");

                calculateEstimate();
            });
        }
    }



    const contactForm = document.getElementById("contact-form-element");

    if (contactForm) {
        const alertBox = document.getElementById("contact-alert");

        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (alertBox) {
                alertBox.classList.add("d-none");
            }

            if (!validateForm(contactForm)) {
                showAlert(
                    alertBox,
                    "Please complete all required fields correctly.",
                    "warning"
                );
                return;
            }

            const formData = Object.fromEntries(
                new FormData(contactForm).entries()
            );

            formData.savedAt = new Date().toISOString();

            if (!saveToBrowser("discoverLesothoMessages", formData)) {
                showAlert(
                    alertBox,
                    "Your message could not be saved in this browser.",
                    "danger"
                );
                return;
            }

            showAlert(
                alertBox,
                "Thanks, " + (formData.name || "visitor") +
                ". Your sample message has been saved in this browser. " +
                "It has not been emailed.",
                "success"
            );

            contactForm.reset();
            contactForm.classList.remove("was-validated");
        });
    }

});
