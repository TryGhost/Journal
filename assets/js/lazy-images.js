(function() {
    document.body.classList.remove('hide-images');

    // Check if an img was already loaded
    function isImageLoaded(img) {
        if (!img.complete || img.naturalWidth === 0) {
            return false;
        }
    
        return true;
    }    

    // Improve how native lazy loaded image appear (hide alt text while loading, then fade in )
    function fadeImages(images) {
        images.forEach(function(image) {
            if (isImageLoaded(image)) {
                return;
            }

            function showImage() {
                image.classList.toggle("gh-card-image-invisible", false);
                image.classList.toggle("gh-card-image-fadein", true);
            }
    
            image.classList.add("gh-card-image-invisible");
    
            image.onload = function() {
                showImage();
            }
    
            image.onerror = function() {
                showImage();
            }
        });
    }

    // Run on page load
    const images = document.querySelectorAll(".home-template .gh-card-image img");
    fadeImages(images);

    // Run again on pagination (use MutationObserver to check when new elements are added to post feed)

    const feedElement = document.querySelector('.home-template .gh-feed');
    const loadMoreBtn = document.querySelector(".home-template .gh-loadmore");

    if (!feedElement || !loadMoreBtn || !window.MutationObserver) {
        return;
    }

    const observer = new MutationObserver(function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(element) {
                        const images = element.querySelectorAll(".gh-card-image img");
                        fadeImages(images);
                    });
                }

                // Disconnect if the loadMoreBtn was removed (we reached last page)
                if (!loadMoreBtn || !loadMoreBtn.parentElement) {
                    observer.disconnect();
                }
            }
        }
    });

    observer.observe(feedElement, { childList: true });
})();