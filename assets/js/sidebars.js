// Table of contents & Footnotes sidebars

(function() {

    // Create footnotes container for post & page template
    function createFootnotes() {
        var footnotesSidebar = document.querySelector(".article__footnotes");
        var contentEl = document.querySelector(".gh-content");
        var footnotesNav = footnotesSidebar.querySelector("nav");
        var footnotesContainer = document.querySelector(".article__footnotes-container");
        var footnotesListElement = document.querySelector(".footnotes-list");
        var mq = window.matchMedia("(min-width: 1200px)"); // Desktop media query. Needs to be in sync with css
    
        if (!footnotesSidebar || !footnotesNav || !footnotesContainer || !contentEl) {
            console.warn("Footnotes required elements not found! Disabling ...");
            return;
        }
    
        if (!footnotesListElement || footnotesListElement.childNodes.length === 0) {
            // Post content does not have footnotes
            return;
        }    
        
        // Footnotes links
        (contentEl.querySelectorAll(".footnote-ref a") || []).forEach(function(link) {
          link.addEventListener("click", function(e) {

                // Do nothing if not desktop view
                if (!mq.matches) {
                  return false;
                }

                e.preventDefault();
                
                var id = link.hash.split('').slice(1).join(''); // #fn2
                const counter = id.replace("fn", "");
                
                var noteElement = footnotesListElement.querySelector('.footnote-item[id="' + id + '"]');
    
                if (!noteElement) {
                    return;
                }
    
                var noteElementClone = noteElement.cloneNode(true);
                noteElementClone.removeAttribute("id"); // prevent duplicate id in page
    
                var counterElement = document.createElement("span");
                counterElement.classList.add("article__footnotes-counter");
                counterElement.textContent = counter + ".";
    
                noteElementClone.insertBefore(counterElement, noteElementClone.childNodes[0]);
    
                // Show the footnotes
                footnotesSidebar.removeAttribute("hidden");
                footnotesContainer.innerHTML = "";
                footnotesContainer.appendChild(noteElementClone);  
            })
        })
    
        // Ghost images
        const largeElements = document.querySelectorAll(
            ".kg-width-wide, .kg-width-full"
        );
    
        // We need to hide the container when it intersect with wide/full images,
        // and when we're at the bottom of the post
        function hideWhenNeeded() {
            const contentRect = contentEl.getBoundingClientRect();
            const navRect = footnotesNav.getBoundingClientRect();
            let intersect = false;
    
            // are we at the bottom of the post content
            if (navRect.bottom >= contentRect.bottom + 80) {
                intersect = true;
                footnotesSidebar.classList.toggle("fadeout", intersect);
                footnotesSidebar.classList.toggle("fadein", !intersect);
                return;
            }
    
            for (let i = 0; i < largeElements.length; i++) {
                const el = largeElements[i];
                const elRect = el.getBoundingClientRect();
    
                if (
                    // is top or bottom of footnotes inside large container ?
                    (navRect.top >= elRect.top && navRect.top <= elRect.bottom) ||
                    (navRect.bottom <= elRect.bottom &&
                        navRect.bottom >= elRect.top) ||
                    // is top or bottom of large container inside footnotes ?
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
                !footnotesSidebar.classList.contains("fadein") &&
                !footnotesSidebar.classList.contains("fadeout")
            ) {
                // First render, don't animate
                return;
            }
    
            footnotesSidebar.classList.toggle("fadeout", intersect);
            footnotesSidebar.classList.toggle("fadein", !intersect);
        }
    
        // Create a throttled version to be use as scroll event handler
        var hideWhenNeededThrottled = throttle(hideWhenNeeded, 150);
    
        // Add scroll event listener only when position is sticky (desktop)
        function bindScrollEvent() {
            var position = window.getComputedStyle(footnotesSidebar).position;
    
            if (position && position.toLowerCase() === "sticky") {
                window.addEventListener("scroll", hideWhenNeededThrottled);
            } else {
                window.removeEventListener("scroll", hideWhenNeededThrottled);
            }
        }
    
        // Check for resize event and add/remove scroll listener
        window.addEventListener("resize", debounce(bindScrollEvent, 200));
    
        // First render
        setTimeout(() => {
            hideWhenNeeded();
            bindScrollEvent();
        }, 100);
    }     


    // Create table of contents for post & page template
    function createTOC() {
        var tocContainer = document.querySelector(".article__toc");
        if (!tocContainer) {
            console.warn("TOC container not found! Disabling TOC ...");
            return;
        }

        var tocSelector = ".js-toc";

        // Collect links and render the TOC
        // https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.js
        tocbot.init({
            // Where to render the table of contents.
            tocSelector: tocSelector,
            // Where to grab the headings to build the table of contents.
            contentSelector: ".gh-content",
            // Which headings to grab inside of the contentSelector element.
            headingSelector: "h1, h2, h3",
            // Headings that match the ignoreSelector will be skipped.
            ignoreSelector: '.js-toc-ignore',        
            // For headings inside relative or absolute positioned containers within content.
            hasInnerContainers: false,
            // ignore headings that are hidden in DOM
            ignoreHiddenElements: true,
            // Class to add to active links
            activeLinkClass: "current",
            // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
            headingsOffset: 20,
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
        var hideTOCWhenNeededThrottled = throttle(hideTOCWhenNeeded, 150);

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
        window.addEventListener("resize", debounce(bindScrollEvent, 200));

        // First render
        setTimeout(() => {
            hideTOCWhenNeeded();
            bindScrollEvent();
        }, 300);
    }    

    // Lodash 5.0.0 isObject
    function isObject(value) {
        const type = typeof value
        return value != null && (type === 'object' || type === 'function')
    }

    // Lodash 5.0.0 debounce
    function debounce(func, wait, options) {
        let lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime
      
        let lastInvokeTime = 0
        let leading = false
        let maxing = false
        let trailing = true
      
        // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
        const useRAF = (!wait && wait !== 0 && typeof window.requestAnimationFrame === 'function')
      
        if (typeof func !== 'function') {
          throw new TypeError('Expected a function')
        }
        wait = +wait || 0
        if (isObject(options)) {
          leading = !!options.leading
          maxing = 'maxWait' in options
          maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
          trailing = 'trailing' in options ? !!options.trailing : trailing
        }
      
        function invokeFunc(time) {
          const args = lastArgs
          const thisArg = lastThis
      
          lastArgs = lastThis = undefined
          lastInvokeTime = time
          result = func.apply(thisArg, args)
          return result
        }
      
        function startTimer(pendingFunc, wait) {
          if (useRAF) {
            window.cancelAnimationFrame(timerId)
            return window.requestAnimationFrame(pendingFunc)
          }
          return setTimeout(pendingFunc, wait)
        }
      
        function cancelTimer(id) {
          if (useRAF) {
            return window.cancelAnimationFrame(id)
          }
          clearTimeout(id)
        }
      
        function leadingEdge(time) {
          // Reset any `maxWait` timer.
          lastInvokeTime = time
          // Start the timer for the trailing edge.
          timerId = startTimer(timerExpired, wait)
          // Invoke the leading edge.
          return leading ? invokeFunc(time) : result
        }
      
        function remainingWait(time) {
          const timeSinceLastCall = time - lastCallTime
          const timeSinceLastInvoke = time - lastInvokeTime
          const timeWaiting = wait - timeSinceLastCall
      
          return maxing
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting
        }
      
        function shouldInvoke(time) {
          const timeSinceLastCall = time - lastCallTime
          const timeSinceLastInvoke = time - lastInvokeTime
      
          // Either this is the first call, activity has stopped and we're at the
          // trailing edge, the system time has gone backwards and we're treating
          // it as the trailing edge, or we've hit the `maxWait` limit.
          return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
        }
      
        function timerExpired() {
          const time = Date.now()
          if (shouldInvoke(time)) {
            return trailingEdge(time)
          }
          // Restart the timer.
          timerId = startTimer(timerExpired, remainingWait(time))
        }
      
        function trailingEdge(time) {
          timerId = undefined
      
          // Only invoke if we have `lastArgs` which means `func` has been
          // debounced at least once.
          if (trailing && lastArgs) {
            return invokeFunc(time)
          }
          lastArgs = lastThis = undefined
          return result
        }
      
        function cancel() {
          if (timerId !== undefined) {
            cancelTimer(timerId)
          }
          lastInvokeTime = 0
          lastArgs = lastCallTime = lastThis = timerId = undefined
        }
      
        function flush() {
          return timerId === undefined ? result : trailingEdge(Date.now())
        }
      
        function pending() {
          return timerId !== undefined
        }
      
        function debounced(...args) {
          const time = Date.now()
          const isInvoking = shouldInvoke(time)
      
          lastArgs = args
          lastThis = this
          lastCallTime = time
      
          if (isInvoking) {
            if (timerId === undefined) {
              return leadingEdge(lastCallTime)
            }
            if (maxing) {
              // Handle invocations in a tight loop.
              timerId = startTimer(timerExpired, wait)
              return invokeFunc(lastCallTime)
            }
          }
          if (timerId === undefined) {
            timerId = startTimer(timerExpired, wait)
          }
          return result
        }
        debounced.cancel = cancel
        debounced.flush = flush
        debounced.pending = pending
        return debounced
    }    

    // Lodash 5.0.0 throttle
    function throttle(func, wait, options) {
        let leading = true
        let trailing = true
      
        if (typeof func !== 'function') {
          throw new TypeError('Expected a function')
        }
        if (isObject(options)) {
          leading = 'leading' in options ? !!options.leading : leading
          trailing = 'trailing' in options ? !!options.trailing : trailing
        }

        return debounce(func, wait, {
          leading,
          trailing,
          'maxWait': wait
        })
    }    


    // Start
    createTOC();
    createFootnotes();

})();