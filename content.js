// Function to expand all category dropdown buttons
async function expandAllTokopediaCategories() {
  // Find all collapsed dropdown buttons (only those with class css-5zeid9)
  const buttons = document.querySelectorAll(
    'button.css-1ve8okv[data-testid="btnSRPDropDownCategoryFilter"]'
  );
  let clickedAny = false;

  // Click each button to expand categories
  for (const button of buttons) {
    button.click();
    clickedAny = true;
    // Small delay to allow DOM to update
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // If we clicked any buttons, wait a bit longer for all expansions to complete
  if (clickedAny) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Recursively expand any new buttons that appeared
    await expandAllTokopediaCategories();
  }
}

// Function to extract all category paths from Tokopedia's category navigation
function extractTokopediaCategories() {
  // Get the main container for categories
  const categoryContainer = document.querySelector(".css-1cb34wj");
  if (!categoryContainer) {
    return "Category container not found on this page";
  }

  const categoryPaths = [];

  // Process each level 1 category
  const level1Categories = categoryContainer.querySelectorAll(
    ":scope > .css-1ksxbs2"
  );

  level1Categories.forEach((level1Container) => {
    // Get level 1 category name
    const level1Name = level1Container
      .querySelector('[data-testid="spnSRPLevel1Filter"]')
      ?.textContent.trim();
    if (!level1Name) return;

    // Find level 2 container
    const level2Container = level1Container.querySelector(".css-14repag");
    if (!level2Container) {
      // If no subcategories, add the level 1 category alone
      categoryPaths.push(level1Name);
      return;
    }

    // Process each level 2 category
    const level2Categories = level2Container.querySelectorAll(
      ":scope > .css-1ksxbs2"
    );

    level2Categories.forEach((level2Container) => {
      // Get level 2 category name
      const level2Name = level2Container
        .querySelector('[data-testid="spnSRPLevel2Filter"]')
        ?.textContent.trim();
      if (!level2Name) return;

      // Find level 3 container
      const level3Container = level2Container.querySelector(".css-14repag");
      if (!level3Container) {
        // If no level 3 categories, add the level 1 > level 2 path
        categoryPaths.push(`${level1Name} > ${level2Name}`);
        return;
      }

      // Process each level 3 category
      const level3Categories = level3Container.querySelectorAll(
        ":scope > .css-1ksxbs2"
      );

      level3Categories.forEach((level3Container) => {
        // Get level 3 category name
        const level3Name = level3Container
          .querySelector('[data-testid="spnSRPLevel3Filter"]')
          ?.textContent.trim();
        if (!level3Name) return;

        // Add the complete path: level 1 > level 2 > level 3
        categoryPaths.push(`${level1Name} > ${level2Name} > ${level3Name}`);
      });
    });
  });

  // Join all paths with semicolons as requested
  return categoryPaths.join("; ");
}

// Function to add a "Copy Category" button
function addCopyTokopediaCategoryButton() {
  // Check if the button already exists to avoid duplicates
  if (document.getElementById("tokopedia-copy-category-btn")) {
    return;
  }

  // Find the "Kategori" header to ensure the section exists.
  // This is more reliable than just checking for a container class.
  const categoryHeader = Array.from(
    document.querySelectorAll('h6[data-unify="Typography"]')
  ).find((el) => el.textContent.trim() === "Kategori");

  // Find the header's parent button, which acts as the insertion point.
  const headerButton = categoryHeader?.closest("button");

  if (!headerButton) {
    console.error("Category header button not found, cannot add copy button.");
    return;
  }

  // Create the button
  const button = document.createElement("button");
  button.id = "tokopedia-copy-category-btn";
  button.textContent = "Copy Categories";
  button.style.display = "block";
  button.style.margin = "10px auto"; // Top margin 0, center horizontally, bottom margin 10px
  button.style.padding = "8px 16px";
  button.style.backgroundColor = "#42b549"; // Tokopedia green
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.style.fontWeight = "bold";
  button.style.width = "85%";

  // Add click event
  button.addEventListener("click", async () => {
    // Change button text to show processing
    button.textContent = "Expanding...";
    button.disabled = true;

    try {
      // First expand all categories
      await expandAllTokopediaCategories();

      // Then extract the categories
      button.textContent = "Copying...";
      const categoryText = extractTokopediaCategories();

      // Copy to clipboard
      await navigator.clipboard.writeText(categoryText);

      // Show success message
      button.textContent = "Copied!";
      button.style.backgroundColor = "#35a53c";

      setTimeout(() => {
        button.textContent = "Copy Categories";
        button.style.backgroundColor = "#42b549";
        button.disabled = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to process: ", err);
      button.textContent = "Error!";
      button.style.backgroundColor = "#e74c3c";

      setTimeout(() => {
        button.textContent = "Copy Categories";
        button.style.backgroundColor = "#42b549";
        button.disabled = false;
      }, 2000);
    }
  });

  // Insert the button right after the "Kategori" header button.
  headerButton.parentNode.insertBefore(button, headerButton.nextSibling);
}

// Run the function to add the button
addCopyTokopediaCategoryButton();

// For browser extension implementation
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on a Tokopedia page
  if (window.location.hostname.includes("tokopedia.com")) {
    addCopyTokopediaCategoryButton();
  }
});

// Additionally, monitor for possible DOM changes that might affect the category container
// (such as page navigation without full reload in SPA)
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      // If category container appears/changes, try to add the button
      if (!document.getElementById("tokopedia-copy-category-btn")) {
        addCopyTokopediaCategoryButton();
      }
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });