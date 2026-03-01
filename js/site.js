/* Blomdaele B&B - Main JavaScript */

document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initBookingModule();
    initLightbox();
    initCookieConsent();
});

/* ============================================
   Mobile Menu
   ============================================ */
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
        nav.classList.toggle('active');
        btn.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });
}

/* ============================================
   Booking Module (Cubilis redirect)
   ============================================ */
function initBookingModule() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    const startInput = document.getElementById('startdate');
    const endInput = document.getElementById('enddate');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (startInput) {
        startInput.valueAsDate = today;
        startInput.min = formatDateISO(today);
    }
    if (endInput) {
        endInput.valueAsDate = tomorrow;
        endInput.min = formatDateISO(tomorrow);
    }

    // Update end date min when start date changes
    if (startInput) {
        startInput.addEventListener('change', function () {
            const d = new Date(this.value);
            d.setDate(d.getDate() + 1);
            endInput.min = formatDateISO(d);
            if (new Date(endInput.value) <= new Date(this.value)) {
                endInput.valueAsDate = d;
            }
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const arrival = startInput.value; // yyyy-mm-dd
        const departure = endInput.value;
        const lang = document.documentElement.lang || 'nl';
        window.location.href =
            'https://reservations.cubilis.eu/3885/Rooms/Select?lang=' + lang +
            '&Arrival=' + arrival + '&Departure=' + departure;
    });
}

function formatDateISO(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

/* ============================================
   Lightbox Gallery
   ============================================ */
function initLightbox() {
    const items = document.querySelectorAll('.gallery-item[data-full]');
    if (!items.length) return;

    // Build array of full-size URLs
    const images = Array.from(items).map(el => el.getAttribute('data-full'));
    let currentIndex = 0;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
        <img src="" alt="Gallery image">
        <button class="lightbox-next" aria-label="Next">&#8250;</button>
    `;
    document.body.appendChild(overlay);

    const img = overlay.querySelector('img');
    const closeBtn = overlay.querySelector('.lightbox-close');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        img.src = images[currentIndex];
    }

    function openLightbox(index) {
        showImage(index);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    items.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            openLightbox(i);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex - 1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex + 1); });

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
}

/* ============================================
   Cookie Consent
   ============================================ */
function initCookieConsent() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    // Check if already consented
    if (getCookie('blomdaele_consent')) {
        banner.classList.add('hidden');
        return;
    }

    banner.querySelectorAll('.cookie-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            setCookie('blomdaele_consent', 'true', 365);
            banner.classList.add('hidden');
        });
    });
}

/* ============================================
    Contact Form — GitHub Pages compatible
    Uses FormSubmit AJAX endpoint by default (free tier).
    Override per-form via data-endpoint or globally with
    window.BLOMDAELE_CONTACT_ENDPOINT.
    ============================================ */

function contactMessages() {
    var lang = (document.documentElement.lang || 'nl').toLowerCase();
    if (lang.startsWith('fr')) return {
        privacy: 'Veuillez accepter la politique de confidentialité.',
        success: 'Merci pour votre message. Nous vous contacterons prochainement.',
        error:   'Une erreur est survenue. Veuillez réessayer plus tard.'
    };
    if (lang.startsWith('en')) return {
        privacy: 'Please accept the privacy policy.',
        success: 'Thank you for your message. We will contact you shortly.',
        error:   'An error occurred. Please try again later.'
    };
    return {
        privacy: 'Gelieve het privacybeleid te accepteren.',
        success: 'Bedankt voor je bericht. We nemen spoedig contact met je op.',
        error:   'Er is een fout opgetreden. Probeer het later opnieuw.'
    };
}

function handleContactForm(form) {
    var msgs = contactMessages();

    if (!form.querySelector('[name="privacy"]').checked) {
        showFormAlert(form, msgs.privacy, 'error');
        return false;
    }

    var endpoint = form.getAttribute('data-endpoint') ||
        window.BLOMDAELE_CONTACT_ENDPOINT ||
        'https://formsubmit.co/ajax/info@blomdaele.be';

    var formData = new FormData(form);
    formData.append('_captcha', 'false');
    formData.append('_subject', 'New message contactform blomdaele.be');
    formData.delete('privacy');

    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    fetch(endpoint, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    formData
    })
    .then(function (res) {
        if (res.ok) {
            showFormAlert(form, msgs.success, 'success');
            form.reset();
        } else {
            showFormAlert(form, msgs.error, 'error');
        }
    })
    .catch(function () {
        showFormAlert(form, msgs.error, 'error');
    })
    .finally(function () {
        if (btn) btn.disabled = false;
    });

    return false;
}

function showFormAlert(form, message, type) {
    let alert = form.querySelector('.form-alert');
    if (!alert) {
        alert = document.createElement('div');
        alert.className = 'form-alert';
        form.insertBefore(alert, form.firstChild);
    }
    alert.className = 'form-alert ' + type;
    alert.textContent = message;
}

/* Cookie helpers */
function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Strict';
}

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

/* ============================================
   Google Maps
   ============================================ */
function initMap() {
    var styleArray = [
        { "featureType": "all", "elementType": "geometry.fill", "stylers": [{ "weight": "2.00" }, { "color": "#aa9c9c" }, { "visibility": "on" }] },
        { "featureType": "all", "elementType": "geometry.stroke", "stylers": [{ "color": "#9c9c9c" }] },
        { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
        { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#4a1d1d" }] },
        { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#fbe3ef" }] },
        { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "color": "#fbe3ef" }] },
        { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
        { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#7b7b7b" }] },
        { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
        { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
        { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] },
        { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#f4d5e5" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#070707" }] },
        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] }
    ];

    var myLatlng = new google.maps.LatLng(51.34383380895727, 3.288609985098632);
    var map = new google.maps.Map(document.getElementById("maps"), {
        zoom: 14,
        center: myLatlng,
        styles: styleArray
    });
    new google.maps.Marker({
        position: myLatlng,
        map: map
    });
}
