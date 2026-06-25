// Grandma's House JavaScript - Adding Interactive Magic

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';

            // Only intercept same-page hash links (e.g. #study).
            // Let regular navigation links (e.g. index.html, post.html?slug=...) work normally.
            if (!href.startsWith('#')) {
                return;
            }

            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Welcome button interaction
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll to first room (kitchen)
            const kitchen = document.getElementById('kitchen');
            if (kitchen) {
                kitchen.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Add a little celebration
            showWelcomeMessage();
        });
    }

    attachCardHoverEffects();
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all room sections
    const rooms = document.querySelectorAll('.room');
    rooms.forEach(room => {
        room.style.opacity = '0';
        room.style.transform = 'translateY(30px)';
        room.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(room);
    });
    

    
    // Random comforting messages
    addComfortingMessages();
});

document.addEventListener('homepageCardsRendered', function() {
    attachCardHoverEffects();
});

function attachCardHoverEffects() {
    const cards = document.querySelectorAll('.recipe-card, .tech-card, .wisdom-card, .blog-card');
    cards.forEach(card => {
        if (card.dataset.hoverAttached === 'true') {
            return;
        }

        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        card.dataset.hoverAttached = 'true';
    });
}

// Welcome message function
function showWelcomeMessage() {
    const messages = [
        "Welcome, dear! Make yourself at home! 🏠",
        "So glad you could visit today! ☕",
        "Come in, come in! There's fresh cookies! 🍪",
        "Perfect timing - I just put the kettle on! 🫖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Create temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.textContent = randomMessage;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #d4a5a5, #9caf88);
        color: white;
        padding: 20px 30px;
        border-radius: 50px;
        font-family: 'Dancing Script', cursive;
        font-size: 1.5rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        animation: welcomeAnimation 3s ease-in-out forwards;
        pointer-events: none;
    `;
    
    // Add animation keyframes to document
    if (!document.getElementById('welcome-animation-style')) {
        const style = document.createElement('style');
        style.id = 'welcome-animation-style';
        style.textContent = `
            @keyframes welcomeAnimation {
                0% { opacity: 0; transform: translate(-50%, -50%); }
                20% { opacity: 1; transform: translate(-50%, -50%); }
                80% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -50%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageDiv);
    
    // Remove message after animation
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}





// Add comforting messages to the console
function addComfortingMessages() {
    const consoleMsgs = [
        "🏠 Welcome to Geeky Grands!",
        "☕ Take your time, dear. No need to rush.",
        "🍪 Made with love and lots of CSS!",
        "📚 Hope you find something useful here!",
        "💝 Thanks for visiting - you're always welcome!"
    ];
    
    consoleMsgs.forEach((msg, index) => {
        setTimeout(() => {
            console.log(`%c${msg}`, 'color: #8b5a3c; font-size: 14px; font-weight: bold;');
        }, index * 2000);
    });
}



// Add seasonal touches based on current date
function addSeasonalTouches() {
    const now = new Date();
    const month = now.getMonth();
    
    let seasonalClass = '';
    if (month >= 11 || month <= 1) { // Winter
        seasonalClass = 'winter-theme';
    } else if (month >= 2 && month <= 4) { // Spring
        seasonalClass = 'spring-theme';
    } else if (month >= 5 && month <= 7) { // Summer
        seasonalClass = 'summer-theme';
    } else { // Fall
        seasonalClass = 'fall-theme';
    }
    
    document.body.classList.add(seasonalClass);
}

// Initialize seasonal touches
addSeasonalTouches();