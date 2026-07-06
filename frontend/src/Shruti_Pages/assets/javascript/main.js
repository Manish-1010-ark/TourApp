// assets/javascript/main.js

// 1. SUPABASE CONFIGURATION (Make sure these match your credentials in auth-handler.js)
const SB_ANON_KEY = "your-actual-anon-public-key-here";
const SB_URL = "https://your-project-id.supabase.co";

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const destinationToggle = document.getElementById('destination-toggle');
    const stateSubmenu = document.getElementById('state-submenu');

    // Sidebar Slide Open Handler
    const openDrawer = () => {
        if(sideDrawer && drawerOverlay) {
            sideDrawer.classList.remove('translate-x-full');
            drawerOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };

    // Sidebar Slide Close Handler
    const closeDrawer = () => {
        if(sideDrawer && drawerOverlay) {
            sideDrawer.classList.add('translate-x-full');
            drawerOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    if (menuToggle && menuClose) {
        menuToggle.onclick = openDrawer;
        menuClose.onclick = closeDrawer;
        drawerOverlay.onclick = closeDrawer;
    }

    // Navigation Accordion System
    if (destinationToggle && stateSubmenu) {
        destinationToggle.onclick = (e) => {
            e.preventDefault();
            stateSubmenu.classList.toggle('hidden');
            const icon = destinationToggle.querySelector('.fa-chevron-down');
            if (icon) icon.classList.toggle('rotate-180');
        };
    }

    // Route Dynamic Parameter Passing Interceptors with Analytics Integration
    document.querySelectorAll('.state-link').forEach(link => {
        link.onclick = function(e) {
            e.preventDefault(); 
            const stateKey = this.getAttribute('data-state');
            
            if (indianStatesData && indianStatesData[stateKey]) {
                // Trigger dynamic pipeline tracker view logging logic
                logDestinationView(stateKey);

                localStorage.setItem('selectedState', stateKey);
                window.location.href = 'state-explorer.html';
            }
        };
    });

    // Invoke view compiler framework conditionally
    if (window.location.pathname.includes('state-explorer.html')) {
        renderStateExplorerPage();
    }
});

// Dynamic Light-Theme View Compiler Layout Renderer
function renderStateExplorerPage() {
    const stateKey = localStorage.getItem('selectedState') || 'jammu-kashmir';
    const data = indianStatesData[stateKey];

    if (!data) return;

    const heroBg = document.getElementById('state-hero-bg');
    if (heroBg) heroBg.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${data.heroImage}')`;
    
    const textTitle = document.getElementById('state-title');
    if (textTitle) textTitle.innerText = data.title;

    const badgeTitle = document.getElementById('state-badge-title');
    if (badgeTitle) badgeTitle.innerText = stateKey.replace('-', ' ');

    const descText = document.getElementById('state-desc');
    if (descText) descText.innerText = data.description;

    const cardsGrid = document.getElementById('places-grid');
    if (!cardsGrid) return;
    cardsGrid.innerHTML = ''; 

    // Render multi-image rows per spot inside a clean, light card container layout
    data.places.forEach(place => {
        let imagesHTML = '';
        place.images.forEach(imgUrl => {
            imagesHTML += `
                <div class="h-64 sm:h-80 overflow-hidden rounded-xl shadow-xs border border-gray-100">
                    <img src="${imgUrl}" alt="${place.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                </div>
            `;
        });

        const cardHTML = `
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                <div class="max-w-3xl space-y-2">
                    <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">${place.name}</h3>
                    <p class="text-base text-gray-600 leading-relaxed">${place.info}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${imagesHTML}
                </div>
            </div>
        `;
        cardsGrid.innerHTML += cardHTML;
    });
}

// Analytics Logger Engine: UPDATED for Supabase REST endpoint compatibility
async function logDestinationView(stateName) {
    const formattedLabel = stateName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
        // Sends an update to a Supabase table named 'destination_analytics'
        // Hint: Supabase RPC or an upscale endpoint function can handle incrementing automatically.
        // For standard inserts, we log a row entry for every visit.
        await fetch(`${SB_URL}/rest/v1/destination_analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SB_ANON_KEY,
                'Authorization': `Bearer ${SB_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ state: formattedLabel })
        });
    } catch (error) {
        console.log("Supabase connection offline or unconfigured. Falling back to local tracking backup layer...");
        
        // Dynamic state updates fallback tracking inside localStorage (Kept safe!)
        let hits = JSON.parse(localStorage.getItem("destination_hits")) || {};
        hits[formattedLabel] = (hits[formattedLabel] || 0) + 1; 
        localStorage.setItem("destination_hits", JSON.stringify(hits));
    }
}