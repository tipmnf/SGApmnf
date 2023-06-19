let radio = document.querySelectorAll('[type="radio"]');
let submitInput = document.getElementById('submitButton');

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

function animateShowInScreen() {
    submitInput.animate({
        opacity: [0, 1],
        transform: ["scale(0)", "scale(1)"]
    }, {
        duration: 300,
    });
}

function animateShakeInScreen() {
    submitInput.animate({
        transform: ['rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)', 'rotate(3deg)', 'rotate(-3deg)']
    }, {
        duration: 800,
    });
}

for (let i = 0; i < radio.length; i++) {
    radio[i].addEventListener('change', function () {
        setTimeout(function () {
            animateShakeInScreen()
        }, 200)
        setTimeout(function () {
            submitInput.style.backgroundColor = 'green'
            animateShowInScreen()
        }, 200)
    })
}
