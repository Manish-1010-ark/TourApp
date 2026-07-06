// Central Data Store for all 28 Indian States & Multi-Image Attractions
const indianStatesData = {
    "andhra-pradesh": {
        title: "Andhra Pradesh",
        heroImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6hSPN0fVcC4azFijLLimM0qIjOjzfUfNRTS6UoeazScZGShqkhYs9ZQQ&s=10",
        description: "Home to scenic coastlines along the Bay of Bengal, ancient Buddhist sites, and rich spiritual heritage, Andhra Pradesh offers a perfect mix of pilgrimage centers and pristine beaches.",
        places: [
            { 
                name: "Tirupati Temple", 
                info: "Famous for the historic Sri Venkateswara Temple nestled in the sacred Tirumala Hills.", 
                images: [
                    "https://i.pinimg.com/736x/73/17/7a/73177a2aecb7003976e3d48156843d6e.jpg",
                    "https://images.unsplash.com/photo-1741003412854-bd4b264c4af3?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGlydXBhdGklMjB0ZW1wbGV8ZW58MHx8MHx8fDA%3D"
                ] 
            },
            { 
                name: "Araku Valley", 
                info: "A misty hill station renowned for its vast coffee plantations, tribal culture, and waterfalls.", 
                images: [
                    "https://hblimg.mmtcdn.com/content/hubble/img/tvdestinationimages/mmt/activities/m_ArakuValley_tv_destination_img_1_l_652_1000.jpg",
                    "https://araku-valley.com/wp-content/uploads/2024/06/photo_6332566594189901107_y.jpg"
                ] 
            }
        ]
    },
    "arunachal-pradesh": {
        title: "Arunachal Pradesh",
        heroImage: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1920&q=80",
        description: "India's easternmost frontier is a pristine sanctuary boasting snow-capped Himalayan peaks, deep verdant valleys, orchid forests, and ancient monasteries.",
        places: [
            { 
                name: "Tawang Monastery", 
                info: "Home to the majestic Tawang Monastery, alpine glacial lakes, and the spectacular Sela Pass.", 
                images: [
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/43/cf/85/monastery-view-from-city.jpg?w=1200&h=-1&s=1",
                    "https://thrillingtravel.in/wp-content/uploads/2025/03/Tawang-monastery-trip-attraction.jpg"
                ] 
            },
            {
                name: "Ziro Valley",
                info: " A UNESCO World Heritage site candidate famous for its pine-covered rolling hills and the unique culture of the Apatani tribe. It is also home to the famous Ziro Music Festival.",
                images: [
                    "https://travel-blog.happyeasygo.com/wp-content/uploads/2025/03/Ziro-Valley-Arunachal-Pradesh.png",
                    "https://encamp-s3b.s3.ap-south-1.amazonaws.com/1772605486503_ziro.avif.jpg"
                ]
            }
        ]
    },
    "assam": {
        title: "Assam",
        heroImage: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80",
        description: "Famous worldwide for its premium black tea estates, vibrant Bihu culture, silk weaving, and incredible biodiversity along the Brahmaputra valley.",
        places: [
            { 
                name: "Kaziranga Sanctuary", 
                info: "A legendary national park sanctuary hosting two-thirds of the world's great one-horned rhinoceroses.", 
                images: [
                    "https://flywelltours.com/wp-content/uploads/2026/03/kaziranga-entry-point-1024x576.webp",
                    "https://www.andbeyond.com/wp-content/uploads/sites/5/iStock_100620995_XLARGE.jpg"
                ] 
            },
            {
                name: " Kamakhya Temple",
                info: "A revered Hindu temple dedicated to the goddess Kamakhya, known for its unique architecture and spiritual significance.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJy_mNU_uMGVYE6xnLCr0TAStcJlrhZCsaa1mFBpGy2M9z_GE4mdpFESas&s=10",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSktMf6iwwbJsfelzwX9dmOjYeOo97Tu5ELxWcM_SpjCNooLv7qtdjb19w&s=10"
                ]
            }
        ]
    },
    "bihar": {
        title: "Bihar",
        heroImage: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?auto=format&fit=crop&w=1920&q=80",
        description: "Step into the ultimate epicenter of spiritual enlightenment and historic educational empires, where Buddhism and Jainism found their roots.",
        places: [
            { 
                name: "Bodh Gaya", 
                info: "The global spiritual site where Prince Siddhartha attained enlightenment beneath the sacred Bodhi Tree.", 
                images: [
                    "https://clubmahindra.gumlet.io/blog/images/Great-Buddha-Statue-resized.jpg?w=376&dpr=2.6",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxYgvPQmLEPUb5Ut3l2l9wiInNR3G6yOgneQceSI1XIBu5mnHLmID9npWN&s=10"
                ] 
            },
            {
                name: "Nalanda University Ruins",
                info: "Explore the ancient ruins of the world-renowned Nalanda University, a center of learning and scholarship in ancient India.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFNjkxz5D6mDfhUleF_dwvHI47h3WD9QvFGBXp5J6bj97n17Ka1x9ZbhA&s=10",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfP74K3ONDdZzj2tt2b4TrXBmuUQtBFf43Ek6eJpu5QfVfb3wCGKbx8VQ&s=10"
                ]
            },
            {
                name: "Rajgir",
                info: "Just 15 km from Nalanda, this ancient city features the Vishwa Shanti Stupa, Venu Van, and natural hot springs. Relax in the therapeutic Rajgir Hot Springs, known for their natural mineral-rich waters and historical significance.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxWFhVB_oyS7_cvZfaPlynATWToxL6_UqH6rXQqnBQMHC6c_PoNjiBkiue&s=10",
                    "https://www.trawell.in/admin/images/upload/125399242Rajgir_Hot_Springs_Main.jpg"
                ]
            }
        ]
    },
    "chhattisgarh": {
        title: "Chhattisgarh",
        heroImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/76/98/71/the-falls-from-a-distance.jpg?w=1000&h=-1&s=1",
        description: "An offbeat nature-lover's paradise covered in thick forests, cascading waterfalls, ancient carved temples, and unique tribal craft heritages.",
        places: [
            { 
                name: "Chitrakote Falls", 
                info: "Widely celebrated as the 'Niagara Falls of India' due to its massive horse-shoe width during monsoons.", 
                images: [
                    "https://s7ap1.scene7.com/is/image/incredibleindia/chitrakote-water-falls-jagdalpur-chhattisgarh-1-attr-hero?qlt=82&ts=1727011277081",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU6SaSBfyhvwMfCakkWmZ6pXDY6ze61iat00_CczY-2reZkazg7fHkgKQ&s=10"
                ] 
            },
            {
                name: "Bijapur",
                info: "Explore the historic town of Bijapur, known for its grand architectural marvels, including the ancient forts and temples.",
                images: [
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/1f/71/99/this-beautiful-monument.jpg?w=1000&h=-1&s=1",
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/56/d0/61/barah-kaman.jpg?w=500&h=500&s=1"
                ]
            },
            {
                name: "Barnawapara Wildlife Sanctuary",
                info: "A protected area known for its diverse wildlife and lush greenery, offering a serene escape into nature.",
                images: [
                    "https://trekgo.in/blog/barnawapara-wildlife-sanctuary/hero.jpg",
                    "https://www.chhattisgarhtourism.co.in/photo_gallery/barnawapara_wildlife_sanctuary/02.jpg"
                ]
            }
        ]
    },
    "goa": {
        title: "Goa",
        heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=80",
        description: "Experience India's pocket paradise, blending golden Mediterranean beach culture, vibrant nightlife, historical churches, and spicy coastal cuisines.",
        places: [
            { 
                name: "Calangute & Baga", 
                info: "Bustling coastal destinations known for adventure water sports, lively beach shacks, and sun lounging.", 
                images: [
                    "https://dq1q7qkthxkc0.cloudfront.net/StaticMedia/761df493-a103-4d23-9a3d-1081200391b2.jpg",
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/a6/e5/0d/caption.jpg?w=1000&h=800&s=1"
                ] 
            },
            {
                name: "Basilica of Bom Jesus",
                info: "A UNESCO World Heritage site famous for its baroque architecture and the preserved remains of St. Francis Xavier.",
                images: [
                    "https://porto-north-portugal.com/images/650-braga/bom-jesus-monte-church-2.jpg",
                    "https://s7ap1.scene7.com/is/image/incredibleindia/basilica-of-bom-jesus-goa-2-musthead-hero?qlt=82&ts=1742156651015"
                ]
            },
            {
                name: "Dudhsagar Waterfalls",
                info: "One of the tallest waterfalls in India, located in the Western Ghats, known for its scenic beauty and lush green surroundings.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lKQwCRg8WQE0cg_AaSKNoE5wwTWvJlRenMDmWidY8zEoL84UkVT0C-q2&s=10",
                    "https://5.imimg.com/data5/SELLER/Default/2023/8/339399772/BJ/GE/MR/147670257/dudh-sagar-waterfall-tour.jpg"
                ]
            }
        ]
    },
    "gujarat": {
        title: "Gujarat",
        heroImage: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=80",
        description: "A culturally rich state offering vast salt deserts, historic architectural stepwells, Asiatic lion sanctuaries, and legendary textile marketplaces.",
        places: [
            { 
                name: "Rann of Kutch", 
                info: "A breathtaking, massive white salt desert that comes alive during the vibrant winter Rann Utsav festival.", 
                images: [
                    "https://www.shikhar.com/images/gallery/tours/665/730346650.jpg",
                    "https://www.savaari.com/blog/wp-content/uploads/2025/11/Rann-Utsav-2025.webp"
                ] 
            },
            {
                name: "Bhuj",
                info: "A historic city known for its rich handicrafts, traditional architecture, and proximity to the Great Rann of Kutch.",
                images: [
                    "https://media.istockphoto.com/id/1329340845/photo/chattedi-a-famous-tourist-place-from-kutch-bhuj-gujarat-india.jpg?s=612x612&w=0&k=20&c=-NGgN4Cbv2zemIlLoBb61MzhQtBZAvi-GKrt_QdZzac=",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2FyKOcP_L8yo6BKlk0DIdGHcY6SUZoChzcVnVzS4jDh5DDGLDIHpRfOM&s=10"
                ]
            },
            {
                name: "Kevadia (Statue of Unity)",
                info: "Home to the world's tallest statue, the Statue of Unity, dedicated to Sardar Vallabhbhai Patel, surrounded by scenic gardens and a riverfront.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFIOwlGunfnSXzgNdmX34Rowe8RuF_pKGbz4FLZQ-tQ09fDkb5lmx6zs4&s=10",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzICjYCCwcN0qDJmkfv6JWNo9_DMo-GjCbFmRffmHkEA&s=10"
                ]
            },
            {
                name: "Somnath Temple and Dwarka",
                info: "A sacred pilgrimage site known for its ancient temples and spiritual significance.",
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/1/10/Somanath_mandir_%28cropped%29.jpg",
                    "https://www.pilgrimpackages.com/upload/package/image-HDQXYLOOU3WYR6XV.jpg"
                ]
            },
            {
                name: "Ahemdabad",
                info: "A historic city known for its rich handicrafts, traditional architecture, and proximity to the Great Rann of Kutch.",
                images: [
                    "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/depositphotos737713342xl1738988960141-1739322765609.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkGUf4LRAnEnKbN9Ce3MZNSXCLmQbCQIGIdpMUPeCtAzFX-K_wEbMMFls&s=10"
                ]
            }
        ]
    },
    "haryana": {
        title: "Haryana",
        heroImage: "https://vushii.com/uploads/1238105864_Fatehabad%20Fort.jpg",
        description: "The land of rich agricultural traditions, ancient Vedic battlegrounds, and sprawling ultra-modern futuristic business cyber cities.",
        places: [
            { 
                name: "Gurugram Skyline", 
                info: "A dazzling futuristic corporate skyline packed with tech hubs, luxury malls, and dining spots.", 
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTFHfm0pBSCdVsLzCQXRgJxJRwnHL8YMGnOia3fhtJENJIX70J9r-UOAc&s=10",
                    "https://res.cloudinary.com/diwgt4zc8/image/upload/f_auto,q_auto/v1/elan-imperial/image1"
                ] 
            },
            {
                name: "Kurukshetra",
                info: "A sacred site associated with the epic Mahabharata, known for its ancient temples and spiritual significance.",
                images: [
                    "https://tripandtales.com/wp-content/uploads/2025/09/Sheikh-Chillis-Tomb-Kurukshetra.jpg",
                    "https://indiatouristspots.weebly.com/uploads/7/9/4/2/79421790/kurukshetra_orig.jpg"
                ]
            },
            {
                name: "Neemrana Fort Palace",
                info: "A magnificent fort palace offering a glimpse into the opulent lifestyle of the Rajput rulers.",
                images: [
                    "https://assets.simplotel.com/simplotel/image/upload/q_80,fl_progressive,w_1500,f_auto,c_fit/neemrana-fort-palace---15th-century-delhi-jaipur-highway/Facade_Premises__Neemrana_Fort_Palace__palace_hotel_in_Rajasthan_14_4_d55b91",
                    "https://images.trvl-media.com/lodging/17000000/16230000/16224200/16224166/68a9378a.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill"
                ]
            }
        ]
    },
    "himachal-pradesh": {
        title: "Himachal Pradesh",
        heroImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80",
        description: "A mountain lover's dream destination filled with towering snow peaks, alpine pine forests, roaring river valleys, and action adventure sports.",
        places: [
            { 
                name: "Manali Resort Valley", 
                info: "A famous high-altitude resort town offering snow paragliding, Solang Valley views, and café hop culture.", 
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKzbcK5sOfnAQWp0uBVxv6mdzfumQLp4MbuINwJU5fTP9KY7AKt_-_zwyS&s=10",
                    "https://q-xx.bstatic.com/xdata/images/hotel/max500/848879027.jpg?k=cf9add5bfe02c96c79f124200f9ebc0213ae4991c1a9fe9e65a3ab7762f678d3&o="
                ] 
            },
            {
                name: "Spiti Valley",
                info: "A remote desert mountain valley known for its Buddhist monasteries, rugged landscapes, and adventure trekking.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9t66CHk8KGWPKwwPDeIPwCSEXbBpCoV-_sHS-brBeiJrn7EtCgo0ke3A&s=10",
                    "https://blog.dookinternational.com/wp-content/uploads/2017/07/a22.jpg"
                ]
            },
            {
                name: "Rohtang La",
                info: "A high mountain pass offering panoramic views of the surrounding snow-capped peaks and glaciers.",
                images: [
                    "https://tripstorz.com/_astro/snow-in-rohtang-pass.CGkQdILW_Z1Fqupd.jpg",
                    "https://www.hlimg.com/images/places2see/738X538/pexels-sanket-barik-7846473_1681907479-3824e.jpg"
                ]
            },
            {
                name: "Dalhousie",
                info: "A hill station known for its colonial architecture, scenic views, and vibrant local culture.",
                images: [
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/b0/3b/5f/main-exterior-shot.jpg?w=900&h=500&s=1",
                    "https://www.himalayancab.com/resource/images/package/image56.jpg"
                ]
            },
            {
                name: "Shimla",
                info: "A picturesque hill station known for its colonial architecture, scenic views, and vibrant local culture.",
                images: [
                    "https://oneday.travel/wp-content/uploads/one-day-shimla-local-sightseeing-tour-package-private-cab-header-1568x1045.jpg",
                    "https://s7ap1.scene7.com/is/image/incredibleindia/the-mall-road-shimla-himachal-pradesh-3-attr-hero?qlt=82&ts=1742177571287"
                ]
            }
        ]
    },
    "jammu-kashmir": {
        title: "Jammu & Kashmir",
        heroImage: "https://www.tourmyindia.com/states/jammu-kashmir/image/dal-lake-s1.jpg",
        description: "Widely regarded as Paradise on Earth, featuring mesmerizing snow peaks, deep valleys, pristine alpine lakes, and signature cozy wooden houseboats.",
        places: [
            { 
                name: "Srinagar (Dal Lake)", 
                info: "Famous for its relaxing Shikara lake rides, floating markets, and historic royal Mughal gardens.", 
                images: [
                    "https://q-xx.bstatic.com/xdata/images/hotel/max500/689960587.jpg?k=12be655de20d76094acd168de321abe4952e7c66e53fa34c94bef80f6089a6f1&o=",
                    "https://www.kashmironline.com/blog/wp-content/uploads/2022/05/dal.jpg"
                ] 
            },
            { 
                name: "Gulmarg Valley", 
                info: "A premier high-altitude ski destination famous for pristine snow pine forests and cable gondola rides.", 
                images: [
                    "https://sceneloc8.com/wp-content/uploads/2024/09/Gulmarg-pre-wedding-shoot.jpg",
                    "https://invisit.in/images/destination/kashmir/kashmir-thumbnail2.jpg"
                ] 
            },
            {
                name: "Sonamarg",
                info: "A scenic town known for its breathtaking views of the surrounding mountains and valleys.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnfoP73LXEUf7QTmyzfWHQaopyyG1D-MkndNycpyJ0VrMbalWC5910CCw-&s=10",
                    "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/a78a9549d6e1a4020e5d23799e486bfc940ce23c8eed36dff92ebe39f8111bb7.jpg"
                ]
            }
        ]
    },
    "jharkhand": {
        title: "Jharkhand",
        heroImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80",
        description: "Rich in mineral wealth, dense woodlands, sacred hill temples, and hidden mountain waterfalls, Jharkhand is a paradise for eco-tourism.",
        places: [
            { 
                name: "Ranchi Waterfalls", 
                info: "Explore beautiful cascading water falls like Hundru and Jonha scattered across the scenic landscape.", 
                images: [
                    "https://tourmyodisha.com/wp-content/uploads/2022/10/Ranchi.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFMjjhEJQleQPOqN6HnKp0R1sAEqZ4NCIqreUzNEZxPUgjf6iWSkDf6gs&s=10"
                ] 
            },
            {
                name: "Dalma Wildlife Sanctuary",
                info: "A protected area known for its diverse flora and fauna, offering a glimpse into the region's natural heritage.",
                images: [
                    "https://i0.wp.com/avenuemail.in/wp-content/uploads/2023/10/Screenshot_20231007-215813_Chrome.jpg?fit=1079%2C609&ssl=1",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFTYI7eJ54xsU0DgCtDyFPwvmy-ymcL8cnU0ESJbB2UIRIoUeN1GQsIXc&s=10"
                ]
            },
            {
                name: "Dassam Falls",
                info: "A stunning waterfall located near Ranchi, known for its scenic beauty and tranquil surroundings.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRDrwqMux6sj54a7Lds3FEqqpESymFykek7kNNwPSZ2ee9Cgdzb6DQirrn&s=10",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO22ibVQkCpszci19UxNx_qzHo2BN3Mb0xuZuvTCgkGe0SxG3EwNftqov0&s=10"
                ]
            },
            {
                name: "Jubilee Park",
                info: "Jubilee Park is a massive 225-acre green space in the center of Jamshedpur. It features lush manicured lawns, a boating lake, a rose garden, a zoo, and a musical fountain with laser shows. A beautiful urban park offering recreational facilities and a peaceful retreat from the bustling city life.",
                images: [
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/e2/a5/9a/jubilee-park.jpg?w=1200&h=1200&s=1",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4ivkVVa8D-zm-GRh4RkviMw3HfkvW7zwGysHMWAV7OoI4v6V3iV9d1v8&s=10"
                ]
            }
        ]
    },
    "karnataka": {
        title: "Karnataka",
        heroImage: "https://hblimg.mmtcdn.com/content/hubble/img/maingalleryimgs/mmt/activities/m_Badami_1_l_667_1000.jpg",
        description: "An incredible state offering high-tech modern metropolises, UNESCO world heritage ruins, aromatic spice hills, and coastal beaches.",
        places: [
            { 
                name: "Hampi Ruins", 
                info: "Breathtaking boulder-strewn ruins of the monumental historic Vijayanagara Empire capital.", 
                images: [
                    "https://dx466kr41l2b.cloudfront.net/images/evolve-back-hampi-india-elephant-stables-hero.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD01hxHwFQbbp_rvjlKbxChgKCB8FOaCW2N3nOeHjGcZ55zXfQJ8t-kL8&s=10"
                ] 
            },
            {
                name: "Mysuru Palace",
                info: "A magnificent palace showcasing the grandeur of the Wadiyar dynasty, with stunning architecture and a rich collection of artifacts.",
                images: [
                    "https://www.mysoretourism.org.in/images/v2/places-to-visit/mysore-maharaja-palace-header-mysore-tourism.jpg",
                    "https://footloosedev.com/wp-content/uploads/mysore-palace.jpg"
                ]
            },
            {
                name: "Maple beach",
                info: "A beautiful beach destination known for its serene atmosphere and pristine sands.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQYrwiARrf6lrYjpVenMstHe6woc5lEs5AEbMbnXXcFbIBH6-GqX7hnrgj&s=10",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqXtQJbpEFoWesEBmJauJwEzflXIAxQRWmZg0J08tpDVO515CDo-iwjPY&s=10"
                ]
            }
        ]
    },
    "kerala": {
        title: "Kerala",
        heroImage: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/5e/59/d4/alleppey-backwater-tour.jpg?w=800&h=-1&s=1",
        description: "Discover a serene tropical paradise stitched with emerald backwaters, sweeping tea gardens, spice plantations, and pristine palm-lined coastlines.",
        places: [
            { 
                name: "Alleppey Backwaters", 
                info: "Famous for its luxury houseboat cruises through interconnected network canals and lagoons.", 
                images: [
                    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
                    "https://static.toiimg.com/thumb/110817237/alleppey.jpg?width=1200&height=900"
                ] 
            }
        ]
    },
    "madhya-pradesh": {
        title: "Madhya Pradesh",
        heroImage: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1920&q=80",
        description: "Located right in central India, this destination boasts spectacular wildlife reserves, historic fortresses, and world-class architectural stone carvings.",
        places: [
            { 
                name: "Khajuraho Temples", 
                info: "Famous for its intricate UNESCO-listed temple stone carvings celebrating art, love, and philosophy.", 
                images: [
                    "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
                ] 
            }
        ]
    },
    "maharashtra": {
        title: "Maharashtra",
        heroImage: "https://images.unsplash.com/photo-1562158147-f8d6fbcd76f8?auto=format&fit=crop&w=1920&q=80",
        description: "A powerhouse state featuring dynamic metropolitan business centers, ancient rock-cut cave monuments, historical hilltop forts, and serene coastlines.",
        places: [
            { 
                name: "Mumbai City", 
                info: "The fast-paced City of Dreams, featuring colonial landmarks, Bollywood glamour, and Marine Drive.", 
                images: [
                    "https://i.natgeofe.com/n/2c18df9e-f799-4f3f-b9dd-b5059bc90ad3/bandra-worli-sea-link-mumbai-india.jpg",
                    "https://cdn.audleytravel.com/4613/3296/79/1328416-the-gateway-of-india-and-boats-as-seen-from-the-harbour-in-mumbai.jpg"
                ] 
            },
            {
                name: "Ajanta & Ellora Caves",
                info: "UNESCO World Heritage sites known for their ancient rock-cut Buddhist, Hindu, and Jain temples and monasteries.",
                images: [
                    "https://travelogyindia.b-cdn.net/images/mumbai/aurangabad-caves-600x436-1.jpg",
                    "https://res.klook.com/image/upload/w_750,h_469,c_fill,q_85/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/fv5h4p3t6e1ag3soaruv.jpg"
                ]
            },
            {
                name: "Lonavala & Khandala",
                info: "Popular hill stations known for their lush greenery, waterfalls, and scenic viewpoints.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsmbQPVNSpWNW2NFDdYuGcv8SAuM-k58poIutZwi0GOuN0I9033YIHN9k&s=10",
                    "https://sweethappyjourney.com/ptadmin/assets/images/media/services/890002549_1.webp"
                ]
            }
        ]
    },
    "manipur": {
        title: "Manipur",
        heroImage: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1920&q=80",
        description: "A gorgeous northeastern paradise surrounded by blue hills, unique floating lake eco-systems, and rich, graceful classical dance traditions.",
        places: [
            { 
                name: "Loktak Lake", 
                info: "The world's only floating lake, famous for its unique circular mass vegetation islands (phumdis).", 
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjlYP_NorHTjSscfVCyG_65ug9ilWIHyz8Pfq16p35cpFxRMDXImwZYyE&s=10",
                    "https://static-blog.treebo.com/wp-content/uploads/2024/07/Things-to-do-1-1024x675.jpg"
                ] 
            },
            {
                name: "Imphal",
                info: "The capital city of Manipur, known for its rich cultural heritage, historical sites, and vibrant local markets.",
                images: [
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Imphal_view.jpg/500px-Imphal_view.jpg",
                    "https://www.kupi.com/kland-storage/images/670x0/30x30/cities/in/imphal/dad33486-ce37-4ab3-a709-3c00f211db3d.webp"
                ]
            }
        ]
    },
    "meghalaya": {
        title: "Meghalaya",
        heroImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80",
        description: "A mist-covered playground in the clouds, globally celebrated for its rain-soaked green hills, massive underground cave systems, and bio-engineered root bridges.",
        places: [
            { 
                name: "Cherrapunji Bridges", 
                info: "Among the wettest places on Earth, filled with dramatic canyon gorges and living root bridges.", 
                images: [
                    "https://www.trawell.in/admin/images/upload/195195339Cherrapunji_Double_Decker_Living_Root_Bridge_Main.jpg",
                    "https://static2.tripoto.com/media/filter/tst/img/93486/TripDocument/1564643912_img_1077.jpg"
                ] 
            },
            {
                name: "Seven sisters Falls",
                info: "A breathtaking cascade of waterfalls surrounded by lush greenery and scenic landscapes.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREJcIq0Rz_siHVhuGNlpOQAZVK-qDHKrQdB1Yg3l_fS5kuuTRTKEBgkWBE&s=10",
                    "https://thumbs.dreamstime.com/b/waterfall-seven-sisters-geiranger-fjord-beautiful-nature-norway-natural-landscape-83537531.jpg"
                ]
            },
            {
                name: "Mawsynram",
                info: "Known as the wettest place on Earth, Mawsynram is famous for its heavy rainfall, lush landscapes, and unique cultural experiences.",
                images: [
                    "https://www.basilleafholidays.com/wp-content/uploads/2019/01/Mawsynram-Falls.jpg",
                    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEihCU3_CIx-QyB0m0YCp2HxrruxgGFyotu8YV99f7fx5rKT6l6xVLQDowNEqtp5MNOB5tGZLprnDxKxGMeAG9XJpoCxLLaz1YtokZxGPizrop1zauOokSCE2TBjHtm66STPcNNM8tnhTGgN/s1600/71950074_2675859305806684_240678555539734528_o.jpg"
                ]
            },
            {
                name: "Shillong Peak",
                info: "A popular viewpoint offering panoramic views of the city of Shillong and the surrounding hills.",
                images: [
                    "https://hblimg.mmtcdn.com/content/hubble/img/additionalttdimages/mmt/activities/m_Shillong_Peak_1_l_361_640.jpg",
                    "https://hblimg.mmtcdn.com/content/hubble/img/shillong/mmt/activities/t_ufs/m_activities_Shillong_Laitlum%20Canyons_l_400_640.jpg"
                ]
            }

        ]
    },
    "mizoram": {
        title: "Mizoram",
        heroImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80",
        description: "Perched along rolling ridges, Mizoram offers rich bamboo forest trails, dramatic valleys, and vibrant cultural bamboo dance traditions.",
        places: [
            { 
                name: "Aizawl Ridges", 
                info: "The scenic, cliffside capital city offering panoramic views of misty mountain ridges.", 
                images: [
                    "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80"
                ] 
            }
        ]
    },
    "nagaland": {
        title: "Nagaland",
        heroImage: "https://hornbillfestival.com/wp-content/uploads/2025/11/pexels-anusree-gs-44418848-30952346-1024x833.jpg",
        description: "A culturally rich mountain state home to various indigenous tribes, green valleys, and the world-famous annual Hornbill Festival.",
        places: [
            { 
                name: "Kohima Hills", 
                info: "The historic capital city known for its beautiful wartime memorials and panoramic green valley landscapes.", 
                images: [
                    "https://oneplanetjourney.com/wp-content/uploads/2025/10/Dzukou-Valley-Nagaland.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDZHJCQKjUMfS_yET89VlEZA105RmR04bvR4jU4JT-tVMLv5p3Ayc4Vc8&s=10"
                ] 
            }
        ]
    },
    "odisha": {
        title: "Odisha",
        heroImage: "https://i0.wp.com/somanytraveltales.com/wp-content/uploads/2024/04/Steps-leading-to-Jay-Vijay-Gufa-on-top-and-Cave-4-Alkapuri-Gufa-on-Right.jpg?resize=1024%2C653&ssl=1",
        description: "A treasure trove of majestic stone temples, pristine sandy beaches, and incredible migratory bird lake sanctuaries.",
        places: [
            { 
                name: "Sun Temple Konark", 
                info: "A stunning UNESCO world heritage monument carved out of stone in the shape of a massive celestial chariot.", 
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKe7hM_J_8QUHUaGZZZa9g91z3K9KrAV1Rb7jC_MYXZOG-8ErqaLhIaa8&s=10",
                    "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2023/12/05144212/Featured-Sun-Temple-Nmp-Asrith-Shutterstock.jpg?tr=w-480,f-jpg,pr-true"
                ] 
            },
            {
                name: "Chilika Lake",
                info: "Asia's largest brackish water lagoon, famous for its bird sanctuary and dolphin sightings.",
                images: [
                    "https://www.puritaxi.in/images/chilika_lake.webp",
                    "https://chalbanjare.com/crmnew/img_master/package/IMG_20251224_200416_17667353977.webp"
                ]
            },
            {
                name: "Puri Jagannath Temple",
                info: "A sacred Hindu temple dedicated to Lord Jagannath, known for its annual Rath Yatra festival.",
                images: [
                    "https://c.ndtvimg.com/2024-05/q067dafg_jagannath-temple-puri-odisha_625x300_21_May_24.jpg?im=FeatureCrop,algorithm=dnn,width=1200,height=738",
                    "https://www.puritaxi.in/images/about.webp"
                ]
            },
            {
                name: "Rock-cut Udayagiri and Khandagiri Caves.",
                info: "Ancient rock-cut caves showcasing impressive architecture and historical significance.",
                images: [
                    "https://s7ap1.scene7.com/is/image/incredibleindia/1-khandagiri-udaigiri-caves-attr-hero?qlt=82&ts=1742172787783",
                    "https://somanytraveltales.com/wp-content/uploads/2024/04/Cave-1-Rani-Gufa-2-scaled.jpg"
                ]
            }
        ]
    },
    "punjab": {
        title: "Punjab",
        heroImage: "https://static01.nyt.com/images/2023/09/27/multimedia/00india-punjab-01-lgbj/00india-punjab-01-lgbj-mediumSquareAt3X.jpg",
        description: "The heartwarming land of endless green fields, rich bhangra beats, legendary culinary experiences, and iconic golden spiritual shrines.",
        places: [
            { 
                name: "Golden Temple", 
                info: "The spiritual and cultural center of the Sikh religion, glowing beautifully over a sacred pool.", 
                images: [
                    "https://media2.thrillophilia.com/images/photos/000/152/188/original/1581765398_amritsar-3083693.jpg?w=753&h=450&dpr=1.5",
                    "https://www.fabhotels.com/blog/wp-content/uploads/2019/12/How-to-Reach-Amritsar-600.jpg"
                ] 
            },
            {
                name: "Patiala Fort and Gardens",
                info: "A historic fort complex with beautiful gardens, reflecting the grandeur of the Patiala royalty.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBaqHpoA_VyIuAqU9hIaV7RshAULB03xYSLruywnGYj-rn5ocqe1EZaxE&s=10",
                    "https://assets.simplotel.com/simplotel/image/upload/x_0,y_1100,w_2160,h_1214,r_0,c_crop,q_80,fl_progressive/w_500,f_auto,c_fit/neemrana-hotels/sheesh2_c03315ce"
                ]
            },
            {
                name: "Kapurthala City",
                info: "Known for its grand palaces, French-style architecture, and rich cultural heritage.",
                images: [
                    "https://s7ap1.scene7.com/is/image/incredibleindia/gurdwara-sri-hatt-sahib-kapurthala-punjab-hero?qlt=82&ts=1726661679032",
                    "https://holaciti.com/assets/place/1765557947place.webp"
                ]
            },
            {
                name: "Gobindgarh Fort and Wagah Border",
                info: "A historic fort in Amritsar and the nearby Wagah Border, known for its evening flag-lowering ceremony.",
                images: [
                    "https://s7ap1.scene7.com/is/image/incredibleindia/gobindgarh-fort-amritsar-punjab-3-musthead-hero?qlt=82&ts=1726661873870",
                    "https://hikerwolf.com/wp-content/uploads/2020/06/WhatsApp-Image-2020-06-13-at-8.46.50-PM-3.jpeg"
                ]
            }
        ]
    },
    "rajasthan": {
        title: "Rajasthan",
        heroImage: "https://www.prishindia.com/wp-content/uploads/2018/12/Jaisalmer-Desert-Safari-6_1438939406-1200x707.jpg",
        description: "Embark on a majestic journey through Rajasthan, where timeless fortresses rise out of glowing sand dunes. Immerse yourself in rich history, vibrant folk arts, and opulent palaces.",
        places: [
            { 
                name: "Jaipur (Pink City)", 
                info: "Famous for the magnificent Hawa Mahal, Amer Fort, and vibrant local handicraft bazaars.", 
                images: [
                    "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLAlVPczLat4PWG_bZESi7VUy-2l1ddrkZ_8WkNtrBE-HcPx6wXDDaNzg&s=10"
                ] 
            },
            { 
                name: "Udaipur", 
                info: "The City of Lakes, renowned for its romantic Lake Palace, serene boat rides, and gorgeous Mewar architecture.", 
                images: [
                    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/77/ea/4b/royalty-meets-fairy-tale.jpg?w=900&h=500&s=1",
                    "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/09/98/97/b3.jpg"
                ] 
            },
            {
                name: "Jaisalmer",  
                info: "The Golden City, famous for its stunning sandstone architecture, including the Jaisalmer Fort and intricately carved havelis.",
                images: [
                    "https://breathedreamgo.com/wp-content/uploads/2019/11/bada-bagh-3181803_1280-2.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt3tFM2khdqtqAPSNaD2Nw-fiXd0bCsbPXlpG0miaFi0Tdx2M9UqSHGI0&s=10"
                ]
            },
            {
                name: "Jodhpur",
                info: "Known for its majestic Mehrangarh Fort, vibrant local markets, and distinctive Rajasthani culture.",
                images: [
                    "https://assets.cntraveller.in/photos/66c2f3a430ce5b4ddab53c12/1:1/w_3898,h_3898,c_limit/Jodhpur-1206811372.jpg",
                    "https://static.thehosteller.com/blogimage/jodhpur-1695286806435.jpg"
                ]
            },
            {
                name: "Pushkar",
                info: "A sacred town famous for its Brahma Temple, annual camel fair, and serene Pushkar Lake.",
                images: [
                    "https://www.tourism.rajasthan.gov.in/content/dam/rajasthan-tourism/english/city/explore/213.jpg",
                    "https://www.rosastays.com/images/blog/living-space-Pushkar-3.jpg"
                ]
            }
        ]
    },
    "sikkim": {
        title: "Sikkim",
        heroImage: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1920&q=80",
        description: "A sparkling clean mountain eco-haven overseen by the massive Mt. Khangchendzonga, rich with high-altitude alpine lakes.",
        places: [
            { 
                name: "Gangtok Capital", 
                info: "A clean mountain capital offering panoramic Himalayan views and pathways leading to historic high passes.", 
                images: [
                    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
                ] 
            }
        ]
    },
    "tamil-nadu": {
        title: "Tamil Nadu",
        heroImage: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=1920&q=80",
        description: "Immerse yourself in towering Dravidian temple gateways, classical Bharatanatyam heritage, and relaxing mist-covered mountain hill stations.",
        places: [
            { 
                name: "Meenakshi Temple and Kanyakumari", 
                info: "Kanyakumari and the Meenakshi Amman Temple are iconic South Indian destinations located roughly 245 km apart in Tamil Nadu. The ancient city of Madurai houses the Meenakshi Temple, an architectural marvel spanning 14 acres, while Kanyakumari sits at India's southernmost tip, famous for its ocean confluence. ", 
                images: [
                    "https://www.sahyogmantratours.com/images/blogs/meenakshi-temple-20231009101928-1_crop.jpg",
                    "https://travelmelodies.com/wp-content/uploads/2019/12/travel-melodies-kanyakumari-tourist-places-tamil-nadu-india-vivekananda-memorial.jpg"
                ] 
            },
            {
                name: "Ooty (Udhagamandalam)",
                info: "A picturesque hill station known for its tea plantations, scenic views, and colonial architecture.",
                images: [
                    "https://hblimg.mmtcdn.com/content/hubble/img/destimg/mmt/destination/m_Ooty_main_tv_destination_img_1_l_764_1269.jpg",
                    "https://assets.cntraveller.in/photos/65f938eb6e28075e0a3bb8fa/1:1/w_3456,h_3456,c_limit/kumar-vivek-ph_C-DERTqE-unsplash.jpg"
                ]
            },
            {
                name: "Rameswaram",
                info: "A sacred Hindu pilgrimage site known for its beautiful temple and historical significance.",
                images: [
                    "https://www.poojn.in/wp-content/uploads/2025/03/Exploring-Rameshwaram-Hidden-Gems-Beyond-the-Ramanathaswamy-Temple.jpeg.jpg",
                    "https://chardhambooking.com/wp-content/uploads/2021/01/rameshwaram.jpg"
                ]
            },
            {
                name: "Madurai",
                info: "A historic city known for its stunning temples, vibrant culture, and rich literary heritage.",
                images: [
                    "https://maduraitourism.co.in/images/v2/places-to-visit/thirumalai-nayak-palace-madurai-tourism-header.jpg",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSUHDCKPE8biyBqFR1NyfpyKpdtYra0r6QMdH0snQcIiBYcxrw6ExFymOl&s=10"
                ]
            }
        ]
    },
    "telangana": {
        title: "Telangana",
        heroImage: "https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=1920&q=80",
        description: "A state rich in heritage, featuring massive historic fortresses, complex architectural monuments, and dynamic modern information technology clusters.",
        places: [
            { 
                name: "Charminar Hyderabad", 
                info: "The iconic historic mosque monument, famous alongside adjacent vibrant bazaars and biryanis.", 
                images: [
                    "https://media.hitex.co.in/posts/2022/charminar-the-arc-de-triomphe-of-the-east.jpg?1658579435",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqVLwJ3s1NZDP3AGqn9Nd6Wxs-LZcfACjAgouhApH0WczqT3Zpr3BBz7DP&s=10"
                ] 
            },
            {
                name: "Golconda Fort",
                info: "A historic fortress known for its impressive architecture, acoustics, and panoramic views of Hyderabad.",
                images: [
                    "https://www.swantour.com/blogs/wp-content/uploads/2018/02/Golconda-Fort-Hyderabad-1.jpg",
                    "https://www.savaari.com/blog/wp-content/uploads/2022/10/Golconda_Fort_and_the_Sunset_Hyderabad.jpg"
                ]
            }
        ]
    },
    "tripura": {
        title: "Tripura",
        heroImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&q=80",
        description: "An elegant royal frontier state hosting beautiful lake palaces, hills, and massive ancient rock-cut stone relief art pieces.",
        places: [
            { 
                name: "Ujjayanta Palace", 
                info: "A brilliant white legacy royal residence transformed into an interactive museum complex.", 
                images: [
                    "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80"
                ] 
            }
        ]
    },
    "uttar-pradesh": {
        title: "Uttar Pradesh",
        heroImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80",
        description: "The deep epicenter of Indian spiritualism, architecture, and history, split alongside the sacred banks of the Ganges and Yamuna rivers.",
        places: [
            { 
                name: "Agra", 
                info: "The world-famous monument of eternal love, built out of magnificent ivory-white marble.", 
                images: [
                    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBN_F7VKyRO1DL7lskMCjDIQmGufvf5szDBOC8sQEV-qAwd5VwaVIw2ssJ&s=10"
                ] 
            },
            {
                name: "Varanasi",
                info: "One of the oldest living cities in the world, known for its ghats, temples, and spiritual significance along the Ganges River.",
                images: [
                    "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/07/a8/1b/7a.jpg",
                    "https://kashiyatra.in/wp-content/uploads/2023/10/dashashwamedh-ghat-evening-ganga-aarti.jpg"
                ]
            },
            {
                name: "Lucknow",
                info: "The capital city of Uttar Pradesh, famous for its rich history, Mughal architecture, and delectable Awadhi cuisine.",
                images: [
                    "https://s7ap1.scene7.com/is/image/incredibleindia/1-chota-imambara-lucknow-uttar-pradesh-attr-hero?qlt=82&ts=1742164819097",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwRPlaM5HpXVevJUE3mD4t3-Z3eZbOYhoTa6alSWfW5JkKMj6zBWiEDii4&s=10"
                ]
            },
            {
                name: "Mathura and Vrindavan",
                info: "Sacred towns associated with the life of Lord Krishna, known for their temples, ghats, and vibrant festivals.",
                images: [
                    "https://oneday.travel/wp-content/uploads/wootrips-1-day-delhi-to-mathura-and-vrindavan-sightseeing-tour-package-private-car-header.jpg",
                    "https://www.travelshrine.com/wp-content/uploads/2025/12/Luxury-Mathura-Vrindavan-Tour-Package.webp"
                ]
            },
            {
                name: "Fatehpur Sikri",
                info: "A UNESCO World Heritage site, this historic city was once the capital of the Mughal Empire and is known for its stunning architecture.",
                images: [
                    "https://www.holidify.com/images/cmsuploads/compressed/shutterstock_1078858838_20200320164009.jpg",
                    "https://d37rmf1ynyg9aw.cloudfront.net/fit-in/1280x1280/data/v4/resources/images/328fc4ee-b6d6-4882-9e87-d7342b1b15bb.jpg"
                ]
            }
        ]
    },
    "uttarakhand": {
        title: "Uttarakhand",
        heroImage: "https://www.uttarakhandtourism.gov.in/assets/media/GodGrace.jpg",
        description: "A spectacular Himalayan state offering mountain adventure river rafting, expansive glacial trails, and deep holy pilgrimage hubs.",
        places: [
            { 
                name: "Rishikesh and Haridwar", 
                info: "The Yoga Capital of the World, offering white-water river rafting alongside peaceful riverside ceremonies.", 
                images: [
                    "https://www.gtholidays.in/wp-content/uploads/2019/06/Rishikesh-haridwar-tour-package-870x555.jpg",
                    "https://i.pinimg.com/736x/29/e2/ce/29e2ceef207dcfa546d05756f1cd0c31.jpg"
                ] 
            },
            {
                name: "Nainital Lake and Hill Station",
                info: "A serene hill station known for its beautiful lake, boating activities, and surrounding scenic landscapes.",
                images: [
                    "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2025/03/10153331/Places-to-visit-in-Nainital-FI--1600x900.jpg",
                    "https://uttarakhandtourism.gov.in/assets/media/UTDB_media_1736410806Ropeway.jpg"
                ]
            },
            {
                name: "Jim Corbett National Park",
                info: "India's first national park, famous for its Bengal tigers, diverse wildlife, and lush forests.",
                images: [
                    "https://mykotdwara.com/wp-content/uploads/2025/01/jim-corbett-national-park-kotdwara.jpg",
                    "https://www.sevencorbett.com/wp-content/uploads/2023/03/corbett-national-park-1.jpg"
                ]
            },
            {
                name: "Mussoorie",
                info: "A picturesque hill station known for its colonial architecture, scenic views, and pleasant climate.",
                images: [
                    "https://media-cdn.tripadvisor.com/media/photo-s/30/7c/47/15/discover-sterling-mussoorie.jpg",
                    "https://clubmahindra.gumlet.io/blog/media/section_images/shuttersto-17534db46414b71.jpg?w=376&dpr=2.6"
                ]
            }
        ]
    },
    "west-bengal": {
        title: "West Bengal",
        heroImage: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1920&q=80",
        description: "Blends rich artistic literary heritages, historic colonial architectures, misty mountain tea ridges, and the massive wild mangrove swamps.",
        places: [
            { 
                name: "Kolkata Landmarks", 
                info: "The City of Joy, showcasing the historic white-stone Victoria Memorial and rich cultural architectures.", 
                images: [
                    "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
                    "https://s7ap1.scene7.com/is/image/incredibleindia/howrah-bridge-howrah-west-bengal-city-1-hero?qlt=82&ts=1742154305591"
                ] 
            },
            {
                name: "Sundarbans Mangroves",
                info: "A UNESCO World Heritage site, home to the largest mangrove forest in the world and the Royal Bengal Tiger.",
                images: [
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIpGqGU1Qz015ckISOlIwordjq7bLge89xPtZ8EaWJPB1weIxcJM-y0sKl&s=10",
                    "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/16/9d/0e/ff.jpg"
                ]
            },
            {
                name: "Darjeeling",
                info: "Famous for its lush tea plantations, scenic views of the Himalayas, and the historic Darjeeling Himalayan Railway.",
                images: [
                    "https://www.darjeelingcarrentals.com/wp-content/uploads/2022/03/WhatsApp-Image-2024-11-19-at-12.20.06-PM.jpeg",
                    "https://res.cloudinary.com/jerrick/image/upload/c_scale,f_jpg,q_auto/6811cd5cdb9e31001dc781e8.jpg"
                ]
            }
        ]
    }
};