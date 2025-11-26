/* Card-Animated ---------------------------- */
$('.card-animated').on('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    $(this).css({
        '--mouse-x': (e.clientX - rect.left) + 'px',
        '--mouse-y': (e.clientY - rect.top) + 'px'
    });
});

import { animate, splitText, stagger } from 'https://esm.sh/animejs';

const lines = [
  "Turning caffeine into features since day one.",
  "My superpower? Googling errors like a pro.",
  "Pretending I know what I'm doing… and it's working."
];

let index = 0;
const $text = $('#rotatingText');

function showLine() {
  $text.text(lines[index]);

  const { words } = splitText($text[0], {
    words: { wrap: "clip" }
  });

  // Entrance animation
  animate(words, {
    y: ['100%', '0%'],
    opacity: [0, 1],
    duration: 800,
    ease: 'out(3)',
    delay: stagger(60)
  });

  // Exit animation
  setTimeout(() => {
    animate(words, {
      y: ['0%', '-100%'],
      opacity: [1, 0],
      duration: 700,
      ease: 'in(3)',
      delay: stagger(50),
      onComplete() {
        index = (index + 1) % lines.length;
        showLine();
      }
    });
  }, 2500);
}

// Start on page load
$(document).ready(() => {
  showLine();

  AOS.init({
      once: true,
  });

  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();

  var spanElement = document.getElementById('currentYear');

  spanElement.textContent = currentYear;

  const sections = $('section');
  const navLinks = $('nav ul li a');

  navLinks.removeClass('text-[#004A99]');
  $('nav ul li a[href="#home"]').addClass('active-link');

  // On scroll, update active link
  $(window).on('scroll', function() {
    let currentSection = '';

    sections.each(function() {
      const sectionTop = $(this).offset().top - 100; // offset to trigger a bit earlier
      if ($(window).scrollTop() >= sectionTop) {
        currentSection = $(this).attr('id');
      }
    });

    navLinks.removeClass('active-link'); // remove active color
    navLinks.each(function() {
      if ($(this).attr('href') === '#' + currentSection) {
        $(this).addClass('active-link');
      }
    });
  });
})
