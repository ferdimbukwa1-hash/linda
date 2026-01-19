 script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded and DOM fully parsed');

    // 1. Get references to HTML elements
    const passwordInput = document.getElementById('password-input');
    const submitPasswordBtn = document.getElementById('submit-password');
    const passwordMessage = document.getElementById('password-message');
    const passwordSection = document.getElementById('password-section');
    const countdownSection = document.getElementById('countdown-section');
    const birthdayTextSection = document.getElementById('birthday-text-section');
    const birthdayTextElement = birthdayTextSection.querySelector('h1'); // Get the H1 element
    const birthdayAudio = document.getElementById('birthday-audio'); // Get the audio element
    const fireworksSection = document.getElementById('fireworks-section');
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const shutdownCountdownElement = document.getElementById('shutdown-countdown'); // Get shutdown countdown element
    const ctx = fireworksCanvas.getContext('2d');

    // Countdown display elements
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');

    // Secret password
    const secretPassword = 'amanya';

    // 2. Define the target birthday date (Example: December 25, 2024)
    // IMPORTANT: Update this date to Belinda's actual birthday for the countdown to work correctly.
    const targetDate = new Date('December 25, 2024 00:00:00').getTime();

    let countdownInterval;
    let fireworksInterval;

    // Fireworks particles logic
    let particles = [];
    const MAX_PARTICLES = 100; // Limit particles for performance

    function resizeCanvas() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }

    // Particle constructor
    function Particle(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
        this.alpha = 1;
        this.color = color;
        this.gravity = 0.05; // Simulate gravity
        this.friction = 0.99; // Simulate air resistance
    }

    Particle.prototype.update = function() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.01; // Fade out
    };

    Particle.prototype.draw = function() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
    };

    function createFireworks(x, y) {
        const color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
        for (let i = 0; i < 50; i++) { // Each firework creates 50 particles
            if (particles.length < MAX_PARTICLES) {
                particles.push(new Particle(x, y, color));
            }
        }
    }

    function animateFireworks() {
        ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        // Remove dead particles
        particles = particles.filter(p => p.alpha > 0.05 && p.y < fireworksCanvas.height);

        requestAnimationFrame(animateFireworks);
    }

    function startFireworks() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        fireworksSection.classList.remove('hidden');

        // Launch initial fireworks bursts
        setTimeout(() => createFireworks(fireworksCanvas.width * 0.2, fireworksCanvas.height * 0.8), 0);
        setTimeout(() => createFireworks(fireworksCanvas.width * 0.5, fireworksCanvas.height * 0.7), 500);
        setTimeout(() => createFireworks(fireworksCanvas.width * 0.8, fireworksCanvas.height * 0.85), 1000);

        // Continuously launch more fireworks
        fireworksInterval = setInterval(() => {
            const x = Math.random() * fireworksCanvas.width;
            const y = Math.random() * fireworksCanvas.height * 0.6; // Upper half of the screen
            createFireworks(x, y);
        }, 700); // New firework every 0.7 seconds

        animateFireworks();
    }

    // Function to start the shutdown countdown
    function startShutdownCountdown() {
        let count = 5;
        shutdownCountdownElement.classList.remove('hidden');
        shutdownCountdownElement.style.fontSize = '2em';
        shutdownCountdownElement.style.marginTop = '20px';
        shutdownCountdownElement.style.zIndex = '1000'; // Ensure it's above fireworks

        const shutdownInterval = setInterval(() => {
            if (count > 0) {
                shutdownCountdownElement.textContent = `Closing in ${count}...`;
                count--;
            } else {
                clearInterval(shutdownInterval);
                clearInterval(fireworksInterval); // Stop new fireworks from being created
                shutdownCountdownElement.textContent = 'Thank you for watching! You can now close this tab.';
                // Optionally, clear the canvas or hide fireworks elements
                // ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
                // particles = [];
            }
        }, 1000);
    }


    // Function to update the countdown timer
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update the HTML elements
        daysSpan.textContent = String(days).padStart(2, '0');
        hoursSpan.textContent = String(hours).padStart(2, '0');
        minutesSpan.textContent = String(minutes).padStart(2, '0');
        secondsSpan.textContent = String(seconds).padStart(2, '0');

        // If the countdown is finished, clear the interval and show the next section
        if (distance < 0) {
            clearInterval(countdownInterval);
            daysSpan.textContent = '00';
            hoursSpan.textContent = '00';
            minutesSpan.textContent = '00';
            secondsSpan.textContent = '00';
            countdownSection.classList.add('hidden');
            birthdayTextSection.classList.remove('hidden');
            // Add the animated-text class to trigger the animation
            birthdayTextElement.classList.add('animated-text');
            // Play the birthday audio
            birthdayAudio.play();
        }
    }

    // Event listener for audio ending to start fireworks
    birthdayAudio.addEventListener('ended', () => {
        startFireworks();
        // Call shutdown countdown after fireworks have played for some time (e.g., 15 seconds)
        setTimeout(startShutdownCountdown, 15000); // 15 seconds after audio ends
    });

    // Event listener for password submission
    submitPasswordBtn.addEventListener('click', () => {
        const enteredPassword = passwordInput.value;

        if (enteredPassword.toLowerCase() === secretPassword) {
            passwordSection.classList.add('hidden');
            countdownSection.classList.remove('hidden');
            passwordMessage.textContent = '';

            // Start the countdown
            updateCountdown(); // Call once immediately to avoid 1-second delay
            countdownInterval = setInterval(updateCountdown, 1000);

        } else {
            passwordMessage.textContent = 'Incorrect password. Try again!';
            passwordInput.value = '';
        }
    });

});
