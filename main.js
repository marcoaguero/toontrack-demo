function beforeRequestsCallbackFunction() {
  var fsb_spinner = document.getElementById("fastspring_spinner");
  fsb_spinner.style.display = "block";
}

function afterMarkupCallbackFunction() {
  var fsb_spinner = document.getElementById("fastspring_spinner");
  fsb_spinner.style.animationName = "fsb-revfadeIn";
  setTimeout(function () {
    fsb_spinner.style.animationName = "fsb-fadeIn";
    fsb_spinner.style.display = "none";
  }, 450);
}

function dataPopupWebhookReceived(orderReference) {
  // Set a timer to delay the execution by 2000 miliseconds
  const delay = 2000;

  setTimeout(function () {
    if (orderReference) {
      console.log(orderReference.id);
      fastspring.builder.reset();
      window.location.href = "./thankyou.html?orderId=" + orderReference.id;
    } else {
      console.log("no order ID");
    }
    // fastspring.builder.reset();
    // window.location.replace("./thankyou.html");
  }, delay);
}

function addItem(item) {
  const productAdded = {
    path: item,
    quantity: 1,
  };
  const payload = {
    products: [productAdded],
  };

  // Generate a unique ID for the quantity dropdown based on the item's path
  var quantityDropdownId = `quantity_${item.replace(/[^\w\d]/g, "_")}`;

  // Disable the button and change its text
  const addButton = document.querySelector(
    `[data-fsc-item-path="${item}"] + .cartButton`
  );
  addButton.dataset.quantityDropdownId = quantityDropdownId;
  addButton.classList.add("disabled");
  addButton.textContent = "Added ✅";
  console.log(payload);
  fastspring.builder.push(payload);
}

function togglePopoverDisplay() {
  const elements = document.querySelectorAll(".popover-display");
  elements.forEach((element) => {
    if (element.classList.contains("d-block")) {
      element.classList.remove("d-block");
      // Hide the popover
      const popover = bootstrap.Popover.getInstance(element);
      if (popover) {
        popover.hide();
      }
    } else {
      element.classList.add("d-block");
    }
  });
}

function enableAddToCartButton(itemPath) {
  // Find the "Add to cart" button with the matching item path
  const addButton = document.querySelector(
    `[data-fsc-item-path="${itemPath}"] + .cartButton`
  );

  if (addButton) {
    addButton.textContent = "Add to cart"; // Reset the button text
    addButton.classList.remove("disabled"); // Enable the button
  }
}

function resetCart() {
  // Reset the FastSpring cart
  fastspring.builder.reset();

  // Reset the buttons with the class .cartButton
  const addButtonList = document.querySelectorAll(".cartButton");
  addButtonList.forEach((addButton) => {
    addButton.textContent = "Add to cart"; // Reset the button text
    addButton.classList.remove("disabled"); // Enable the button
  });
}

// Function to handle applying a coupon
function applyCoupon() {
  // Get the coupon code entered by the user
  const couponCodeInput = document.getElementById("couponCode");
  const couponCode = couponCodeInput.value;

  // Check if the coupon code is not empty
  if (couponCode.trim() !== "") {
    // Apply the coupon code using FastSpring API
    fastspring.builder.promo(couponCode);

    // Clear the input field
    couponCodeInput.value = "";
  } else {
    // Handle empty coupon code (you can show an error message if needed)
    console.error("Coupon code is empty.");
  }

  // Prevent the default form submission
  return false;
}

// Event listener for coupon form submission
const couponForm = document.getElementById("couponForm");
couponForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent form submission
  applyCoupon(); // Call the function to apply the coupon
});

function buyNow() {
  var orderSession = {
    paymentContact: {
      email: "maguero@fastspring.com",
      firstName: "marco",
      lastName: "aguero",
    },
    language: "en",
  };

  fastspring.builder.push(orderSession, function () {
    window.location = "./checkout.html";
  });
}

function sumQuantities(data) {
  let totalQuantity = 0;
  // Loop through each item in the groups and sum up the quantities
  data.groups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.selected) {
        totalQuantity += item.quantity;
      }
    });
  });
  console.log("Total Quantity: ", totalQuantity);
  return totalQuantity;
}

function callbackFunction(data) {
  console.log(data);
  var cartItemsList = document.getElementById("cartItems");
  // Calculate total quantity of selected items
  const totalQuantity = sumQuantities(data);
  document.getElementById("cart-quantity").textContent = totalQuantity;
  // Clear the existing items
  cartItemsList.innerHTML = "";
  // Filter and populate the cart with selected items from the group
  const selectedItems = data.groups[0].items.filter((item) => item.selected);

  // Inside your callbackFunction where we populate the cart:
  if (selectedItems.length === 0) {
    // If no items are selected, show "Your cart is empty"
    var emptyCartItem = document.createElement("li");
    emptyCartItem.className = "list-group-item";
    emptyCartItem.textContent = "Your cart is empty";
    cartItemsList.appendChild(emptyCartItem);

    // Hide the cart section by adding 'd-none' class
    document.getElementById("cartSection").classList.add("d-none");
  } else {
    // Populate the cart with selected items
    selectedItems.forEach(function (item) {
      var cartItem = document.createElement("li");
      cartItem.className =
        "list-group-item d-flex justify-content-between align-items-center";

      // Item name on the left
      var itemName = document.createElement("span");
      itemName.textContent = item.display;
      itemName.className = "col-3 col-md-4";
      cartItem.appendChild(itemName);

      // Item price on the middle
      var itemPrice = document.createElement("span");
      itemPrice.textContent = item.price; // Fixed the typo here
      itemPrice.className = "col-3 col-md-4 text-end";
      cartItem.appendChild(itemPrice);

      // Create a menu for "Remove" button and quantity dropdown
      var menuDiv = document.createElement("div");
      menuDiv.className = "col-5 col-md-4 d-flex";

      // Add the "Remove" button to the menu
      var removeButton = document.createElement("a");
      removeButton.className = "text-decoration-none me-1 me-lg-3 my-auto btn";
      removeButton.textContent = "🗑️";
      // removeButton.href = "#";
      removeButton.onclick = function () {
        fastspring.builder.remove(item.path);
        enableAddToCartButton(item.path);
      };
      menuDiv.appendChild(removeButton);

      // Generate a unique ID for the quantity dropdown based on the item's path
      var quantityDropdownId = `quantity_${item.path.replace(/[^\w\d]/g, "_")}`;

      // Add the "Update Quantity" dropdown to the menu
      var quantityDropdown = document.createElement("select");
      quantityDropdown.className = "form-select";
      quantityDropdown.id = quantityDropdownId; // Set the ID for the dropdown
      quantityDropdown.onchange = function () {
        updateItemQuantity(item.path, quantityDropdownId);
      };
      for (let i = 1; i <= 5; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        quantityDropdown.appendChild(option);
        if (item.quantity === i) {
          option.selected = true;
        }
      }

      menuDiv.appendChild(quantityDropdown);

      // Add the menu to the cart item
      cartItem.appendChild(menuDiv);
      cartItemsList.appendChild(cartItem);
      console.log(item);
    });
    // Show the cart section by removing 'd-none' class
    document.getElementById("cartSection").classList.remove("d-none");
  }

  // Update quantity function
  function updateItemQuantity(itemPath, quantityDropdownId) {
    // Get the selected quantity from the dropdown using the unique ID
    var quantityDropdown = document.getElementById(quantityDropdownId);
    var selectedQuantity = quantityDropdown.value;

    // Use fastspring.builder.update to update the item's quantity
    fastspring.builder.update(itemPath, selectedQuantity);
  }
}

function selectCountry(country) {
  // You can replace 'countrycodegoeshere' with the actual country code or variable
  const countryCode = getCountryCodeForCountry(country);

  // Update the dropdown button's text with the selected country
  document.getElementById("countryDropdown").textContent = country;

  // Launch the FastSpring builder with the selected country code
  fastspring.builder.country(countryCode);
}

// Function to map country names to country codes (replace with your own mapping)
function getCountryCodeForCountry(country) {
  const countryCodes = {
    "🇳🇱 Netherlands": "NL",
    "🇺🇸 USA": "US",
    "🇯🇵 Japan": "JP",
    // Add more mappings as needed
  };
  return countryCodes[country];
}
