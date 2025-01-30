// Create the <div> element
const draggableDiv = document.createElement("div");
draggableDiv.innerHTML = `<button id="hideButton">X</button>`;
draggableDiv.id = "draggableDiv";
draggableDiv.style.position = "fixed";
draggableDiv.style.zIndex = "9999";
draggableDiv.style.backgroundColor = "white";
draggableDiv.style.color = "black";
draggableDiv.style.padding = "10px";
draggableDiv.style.border = "2px solid black";
draggableDiv.style.cursor = "move";
document.body.appendChild(draggableDiv);

const checkListContentElement = document.createElement("div")
checkListContentElement.id = "checkListContent"
draggableDiv.appendChild(checkListContentElement)

const style = document.createElement("style")
style.innerHTML = `
#hideButton {
  border: 1px solid #000;
  background: white;
  font-size: 8px;
  padding: 3px 10px;
  cursor: pointer;
}
.container {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
}
.input-group {
    margin: 10px 0;
}
.radio-container, .checkbox-container {
    display: flex;
    gap: 10px;
}
.radio-container label, .checkbox-container label {
    opacity: 0.15;
    border: 2px solid black;
    padding: 5px 10px;
    cursor: pointer;
    transition: opacity 0.2s ease;
    min-width: 20px;
    min-height: 20px;
}
input[type="radio"], input[type="checkbox"] {
    display: none;
}
input[type="radio"]:checked + label, 
input[type="checkbox"]:checked + label {
    opacity: 1;
}
label {
    user-select: none;
}
`
document.body.appendChild(style)

bootstrap()
function bootstrap() {
  const storageData = localStorage.getItem("popupInputValue")
  if (storageData) {
    const parseData = JSON.parse(JSON.parse(storageData))
    generateForm(parseData)
  }
}


// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.message) {
    const data = JSON.parse(request.message)
    
    localStorage.setItem("popupInputValue", JSON.stringify(request.message))
    generateForm(data)
  }
});

function toggleHide() {
  let targetElement = document.getElementById("checkListContent");
  if (targetElement) {
      targetElement.style.display = (targetElement.style.display === "none") ? "block" : "none";
  }
}
const hideButtonElement = document.getElementById("hideButton")
hideButtonElement.addEventListener("click", (event) => {
  if (hideButtonElement) {
    toggleHide()
  }
})

function generateForm(data) {
  const formContainer = document.getElementById('checkListContent');

  formContainer.innerHTML = ""

  data.forEach((section, sectionIndex) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.classList.add('input-group');

      let groupColor = ""
      let groupBg    = ""

      if (section.color) {
          groupColor = `${section.color}`;
      }
      
      if (section.background) {
          groupBg = `${section.background}`;
      }

      sectionDiv.innerHTML = `
          <strong style="color: ${groupColor}; background: ${groupBg}; padding-right: 5px; padding-left: 5px;">
              ${section.name}
          </strong>
      `;

      const inputContainer = document.createElement('div');
      inputContainer.classList.add(section.type + '-container');
      
      section.inputs.forEach((input, inputIndex) => {
          const inputElement = document.createElement('input');
          inputElement.type = section.type;
          // inputElement.name = section.name;
          inputElement.name = sectionIndex;

          if (!section.name) {
              inputElement.name = `__${sectionIndex}`;
          }

          // Generate unique ID using section name and index for empty text
          // const uniqueId = input.text ? 
          //     `${section.name}-${input.text}` : 
          //     `${section.name}-option-${inputIndex}`;
          const uniqueId = `${sectionIndex}-${inputElement.type}-${inputIndex}`;

          inputElement.id = uniqueId;
          inputElement.value = input.text || `option-${inputIndex}`;

          const label = document.createElement('label');
          label.setAttribute('for', uniqueId);
          
          if (input.text) {
              label.innerText = input.text;
          }
          
          if (input.color) {
              label.style.color = input.color;
          }
          
          if (input.background) {
              label.style.background = input.background;
          }

          // Add click handler for radio buttons to allow deselection
          if (section.type === 'radio') {
              label.addEventListener('click', function(e) {
                  const radio = document.getElementById(this.getAttribute('for'));
                  if (radio.checked) {
                      e.preventDefault();
                      radio.checked = false;
                  }
              });
          }
          
          inputContainer.appendChild(inputElement);
          inputContainer.appendChild(label);
      });

      sectionDiv.appendChild(inputContainer);
      formContainer.appendChild(sectionDiv);
  });
}

// Load saved position from localStorage
const savedPosition = localStorage.getItem("draggableDivPosition");
if (savedPosition) {
  const { top, left } = JSON.parse(savedPosition);
  draggableDiv.style.top = `${top}px`;
  draggableDiv.style.left = `${left}px`;
} else {
  // Default position
  draggableDiv.style.top = "10px";
  draggableDiv.style.left = "10px";
}

// Add the <div> to the webpage
document.body.appendChild(draggableDiv);

// Variables to track dragging state
let isDragging = false;
let offsetX, offsetY;

// Mouse down event to start dragging
draggableDiv.addEventListener("mousedown", (event) => {
  isDragging = true;
  offsetX = event.clientX - draggableDiv.offsetLeft;
  offsetY = event.clientY - draggableDiv.offsetTop;
  draggableDiv.style.cursor = "grabbing";
});

// Mouse move event to drag the <div>
document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const newLeft = event.clientX - offsetX;
    const newTop = event.clientY - offsetY;
    draggableDiv.style.left = `${newLeft}px`;
    draggableDiv.style.top = `${newTop}px`;
  }
});

// Mouse up event to stop dragging and save the position
document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    draggableDiv.style.cursor = "move";

    // Save the position to localStorage
    const position = {
      top: parseInt(draggableDiv.style.top, 10),
      left: parseInt(draggableDiv.style.left, 10),
    };
    localStorage.setItem("draggableDivPosition", JSON.stringify(position));
  }
});