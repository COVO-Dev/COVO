"use client";

import { useEffect } from "react";

export function GrammarlySuppressionScript() {
  useEffect(() => {
    // This function removes Grammarly attributes from the DOM
    const removeGrammarlyAttributes = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && 
              (mutation.attributeName?.startsWith("data-gr-") || 
               mutation.attributeName?.includes("data-new-gr"))) {
            if (mutation.target instanceof HTMLElement) {
              mutation.target.removeAttribute(mutation.attributeName);
            }
          }
        });
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-gr-ext-installed", "data-new-gr-c-s-check-loaded"]
      });

      return () => observer.disconnect();
    };

    // Run the function
    if (typeof window !== "undefined") {
      removeGrammarlyAttributes();
    }
  }, []);

  return null;
}
