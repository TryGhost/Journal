// Create table of contents for post & page template
function createTOC() {
    var tocContainer = document.querySelector(".article__toc");
    if (!tocContainer) {
        console.warn("TOC container not found! Disabling TOC ...");
        return;
    }

    var tocSelector = ".js-toc";

    // Collect links and render the TOC
    tocbot.init({
        // Where to render the table of contents.
        tocSelector: tocSelector,
        // Where to grab the headings to build the table of contents.
        contentSelector: ".gh-content",
        // Which headings to grab inside of the contentSelector element.
        headingSelector: "h1, h2, h3",
        // For headings inside relative or absolute positioned containers within content.
        hasInnerContainers: false,
        // ignore headings that are hidden in DOM
        ignoreHiddenElements: true,
        // Class to add to active links
        activeLinkClass: "current",
        // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
        headingsOffset: 12,
    });

    var tocElement = document.querySelector(tocSelector);
    if (!tocElement || tocElement.childNodes.length === 0) {
        // Post content does not have headings
        return;
    }

    // Show the TOC
    tocContainer.removeAttribute("hidden");

    var contentEl = document.querySelector(".gh-content");
    var tocNav = tocContainer.querySelector("nav");
    const largeElements = document.querySelectorAll(
        ".kg-width-wide, .kg-width-full"
    );

    if (!tocNav || !contentEl) {
        return;
    }

    // Mobile view toggle
    var tocHeading = document.querySelector(".article__toc-heading");
    tocHeading && tocHeading.addEventListener("click", function() {
        tocContainer.classList.toggle("article__toc--closed");
    });

    if (!tocHeading) {
        tocContainer.classList.remove("article__toc--closed");
    }

    // We need to hide the TOC when it intersect with wide/full images,
    // and when we're at the bottom of the post
    function hideTOCWhenNeeded() {
        const contentRect = contentEl.getBoundingClientRect();
        const navRect = tocNav.getBoundingClientRect();
        let intersect = false;

        // are we at the bottom of the post content
        if (navRect.bottom >= contentRect.bottom + 60) {
            intersect = true;
            tocContainer.classList.toggle("fadeout", intersect);
            tocContainer.classList.toggle("fadein", !intersect);
            return;
        }

        for (let i = 0; i < largeElements.length; i++) {
            const el = largeElements[i];
            const elRect = el.getBoundingClientRect();

            if (
                // is top or bottom of TOC inside large container ?
                (navRect.top >= elRect.top && navRect.top <= elRect.bottom) ||
                (navRect.bottom <= elRect.bottom &&
                    navRect.bottom >= elRect.top) ||
                // is top or bottom of large container inside TOC ?
                (elRect.top >= navRect.top && elRect.top <= navRect.bottom) ||
                (elRect.bottom <= navRect.bottom &&
                    elRect.bottom >= navRect.top)
            ) {
                intersect = true;
                break;
            }
        }

        if (
            !intersect &&
            !tocContainer.classList.contains("fadein") &&
            !tocContainer.classList.contains("fadeout")
        ) {
            // First render, don't animate
            return;
        }

        tocContainer.classList.toggle("fadeout", intersect);
        tocContainer.classList.toggle("fadein", !intersect);
    }

    // Create a throttled version to be use as scroll event handler
    var hideTOCWhenNeededThrottled = _.throttle(hideTOCWhenNeeded, 150);

    // Add scroll event listener only when position is sticky (desktop)
    function bindScrollEvent() {
        var position = window.getComputedStyle(tocContainer).position;

        if (position && position.toLowerCase() === "sticky") {
            window.addEventListener("scroll", hideTOCWhenNeededThrottled);
        } else {
            window.removeEventListener("scroll", hideTOCWhenNeededThrottled);
        }
    }

    // Check for resize event and add/remove scroll listener
    window.addEventListener("resize", _.debounce(bindScrollEvent, 200));

    // First render
    bindScrollEvent();
}    

createTOC();