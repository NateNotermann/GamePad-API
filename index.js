let controllerIndex = null; // controller is null aka disconnected by default, until button is pressed

window.addEventListener('gamepadconnected', (event) => { // Listen for controller to be connect
    handleConnectDisconnect(event, true);
    console.log(
        "Gamepad connected from index %d: %s",
        event.gamepad.index,
        event.gamepad.id,
      );
})

window.addEventListener('gamepaddisconnected', (event) => { // Listen for controller to be disconnect
    handleConnectDisconnect(event, false);
    console.log(
        "Gamepad DISCONNECTED from index %d: %s",
        event.gamepad.index,
        event.gamepad.id,
      );
})

function handleConnectDisconnect(event, connected) {
    // console.log('controller connected is:', connected); //  CL if connected status true/false
    const controllerAreaNotConnected = document.getElementById( // store element in variable
        'controller-not-connected-area'
        );
    const controllerAreaConnected = document.getElementById( // store element in variable
        'controller-connected-area'
        );
            
const gamepad = event.gamepad;  // store gamepad attributes  in variable
// console.log(gamepad); // console logs all of the gamepad's attributes 

if (connected) { // if connected
        controllerIndex = gamepad.index; // get the index
        controllerAreaNotConnected.style.display = "none";  // turn off disconnected message
        controllerAreaConnected.style.display = "block";  // turn on connected message
        createButtonLayout(gamepad.buttons); // run function to create button layout
        createAxesLayout(gamepad.axes); // run function to create Axes layout
    } else {
        controllerIndex = null; // set controller back to null
        controllerAreaNotConnected.style.display = "block"; // turn on disconnected message
        controllerAreaConnected.style.display = "none"; // turn off connected message
    }
}

function createAxesLayout(axes) { // create axes element using HTML & string interpolation
    const buttonsArea = document.getElementById("buttons");
    for ( let i=0; i < axes.length; i++ ) {
        buttonsArea.innerHTML += `<div id=axis-${i} class='axis'>
                                    <div class='axis-name'>AXIS ${i}</div>
                                    <div class='axis-value'>${axes[i].toFixed(4)}</div>
                                  </div>`;
    }
}

function createButtonLayout(buttons) { // loop through all buttons
    const buttonArea = document.getElementById("buttons");
    buttonArea.innerHTML = "";
    for(let i=0; i < buttons.length; i++) { 
        buttonArea.innerHTML += createButtonHtml(i,0);
    }
}

function createButtonHtml(index, value) { // create each button layout element using HTML & string interpolation
    return `<div class="button" id="button-${index}">
                <svg width="10px" height="50px">
                    <rect width="10px" height="50px" fill="grey"></rect>
                    <rect
                        class="button-meter"
                        width="10px"
                        x="0"
                        y="50"
                        data-original-y-position="50"
                        height="50px"
                        fill="rgb(60, 61, 60)"
                    ></rect>
                </svg>
                <div class='button-text-area'>
                    <div class="button-name">B${index}</div>
                    <div class="button-value">${value.toFixed(2)}</div>
                </div>
            </div>`;
}

function updateButtonOnGrid (index, value) { 
    const buttonArea = document.getElementById(`button-${index}`);
    const buttonValue = buttonArea.querySelector(".button-value");
    buttonValue.innerHTML = value.toFixed(2); // show each buttons value live

    const buttonMeter = buttonArea.querySelector(".button-meter");
    const meterHeight = Number(buttonMeter.dataset.originalYPosition) 
    const meterPosition = meterHeight - (meterHeight / 100) * (value * 100); // change meter size and position live
    buttonMeter.setAttribute("y", meterPosition);
}

function updateControllerButton(index, value) {
    const button = document.getElementById(`controller-b${index}`);
    const selectedButtonClass = "selected-button";

    if( button) { // if pressed, match trigger contrast to pressure of press
        if(value > 0 ) {
            button.classList.add(selectedButtonClass);
            button.style.filter = `contrast(${value * 200}%)`
        } else {
            button.classList.remove(selectedButtonClass);
            button.style.filter = `contrast(100%)`
        }
    }
}

function handleButtons(buttons) { // loop through buttons
    for ( let i=0; i < buttons.length; i++ ) {
        const buttonValue = buttons[i].value;
        updateButtonOnGrid(i, buttonValue); // update buttons value
        updateControllerButton(i, buttonValue); // update buttons color/style CSS
    }
}

function handleSticks(axes){
    updateAxesGrid(axes);
    updateStick("controller-b10", axes[0], axes[1]) 
    updateStick("controller-b11", axes[2], axes[3]) 
}

function updateAxesGrid(axes) { // update and print axes values
    for ( let i = 0; i < axes.length; i++ ) {
        const axis = document.querySelector(`#axis-${i} .axis-value`);
        const value = axes[i];
        // if (value > 0.06 || value < 0.06) {      
            axis.innerHTML = value.toFixed(4); 
            // }    // code for PlayStation controllers so the axis doesn't constantly update even when not moving
    }
}

function updateStick(elementId, leftRightAxis, upDownAxis){ // move sticks
    const multiplier = 25; // set amount to move stick images
    const stickLeftRight = leftRightAxis * multiplier;
    const stickUpDown = upDownAxis * multiplier;

    const stick = document.getElementById(elementId);
    const x = Number(stick.dataset.originalXPosition);
    const y = Number(stick.dataset.originalYPosition);

    stick.setAttribute('cx', x + stickLeftRight);
    stick.setAttribute('cy', y + stickUpDown);
}

function handleRumble(gamepad) { // handle controller rumble
    const rumbleOnButtonPress = document.getElementById("rumble-on-button-press");

    if(rumbleOnButtonPress.checked) {
        if(gamepad.buttons.some(button => button.value > 0)) {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: 25,
                weakMagnitude: .5,
                strongMagnitude: 1.0,
            });           
        }
    }
}

function gameLoop() { // main game loop to continuously render gamepad
    if (controllerIndex !== null){ //if not disconnected
        const gamepad = navigator.getGamepads()[controllerIndex]; // get index
        handleButtons(gamepad.buttons); 
        handleSticks(gamepad.axes);
        handleRumble(gamepad);
    }
    requestAnimationFrame(gameLoop); 
};

gameLoop(); 