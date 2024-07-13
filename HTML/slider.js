// Host Range
var sliderHostAvailability = document.getElementById("HostAvailabilityRange");
var outputHostAvailability = document.getElementById("HostAvailabilityValue");
outputHostAvailability.innerHTML = sliderHostAvailability.value;

sliderHostAvailability.oninput = function() {
  outputHostAvailability.innerHTML = this.value;
}

// Rent Range
var sliderMaxRent = document.getElementById("MaxRentRange");
var outputMaxRent = document.getElementById("MaxRentValue");
outputMaxRent.innerHTML = sliderMaxRent.value;

sliderMaxRent.oninput = function() {
  outputMaxRent.innerHTML = this.value;
}

var priceSlider = document.getElementById('price-slider');

noUiSlider.create(priceSlider, {
    start: [0.01, 128.00],
    connect: true,
    range: {
        'min': 0.01,
        'max': 128.00
    },
    format: {
        to: function (value) {
            return '$' + value.toFixed(2);
        },
        from: function (value) {
            return Number(value.replace('$', ''));
        }
    }
});

var minPrice = document.getElementById('min-price');
var maxPrice = document.getElementById('max-price');

priceSlider.noUiSlider.on('update', function (values, handle) {
    if (handle === 0) {
        minPrice.innerHTML = values[handle];
    } else {
        maxPrice.innerHTML = values[handle];
    }
});
