/* Card-Animated ---------------------------- */
$('.card-animated').on('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    $(this).css({
        '--mouse-x': (e.clientX - rect.left) + 'px',
        '--mouse-y': (e.clientY - rect.top) + 'px'
    });
});

/* Mobile Menu Toggle ----------------------- */
$('#nav-toggle').on('click', function () {
    $('#mobile-menu').toggleClass('hidden');
});

/* Close mobile menu when clicking any link */
$('#mobile-menu a').on('click', function () {
    $('#mobile-menu').addClass('hidden');
});
