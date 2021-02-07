
// App state
let store = Immutable.fromJS({
    apod: '',
    selectedRover: '',
    rovers: [],
    roversNames: ['Curiosity', 'Opportunity', 'Spirit'],
    roversPhotos: new Map([ ['Curiosity', {}], ['Opportunity', {}], ['Spirit', {}] ]),
    sol_keys: [],
    weather: []
})


const root = document.getElementById('root')
const render = async (root, state) => { root.innerHTML = App(state.toJS()) }

//Update App state
const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}


//listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);

    //Event Handler for rover selection
    root.onclick = event => {
        if (event.target.innerHTML == 'Photos') {
            roverName = event.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML;
            console.log(roverName);
            if (JSON.stringify(store.toJS().roversPhotos.get(roverName)) === '{}') getRoverPhotos(store, roverName);
            else updateStore(store, {'selectedRover': roverName});
        }
    }
})



//------------------------------------------------------ create content
const App = (state) => {
    const apod = state.apod;
    
    return `
            <section>
                ${ImageOfTheDay(apod)}
                ${createWeather(state)}
                ${createRoversInfo(state)}
                ${clickPhotosButton(state,creteContentImages)}
            </section>
        `
}

// ------------------------------------------------------  COMPONENTS


// Create showcase image
const ImageOfTheDay = (apod) => {

    const today = new Date()
    if (!apod || apod.date === today.getDate() ) { // If image does not already exist, or it is not from today -- request it again
        getImageOfTheDay();
    } else {

        // check if the photo of the day is actually type video!
        if (apod.image.media_type === "video") {
            return (`
                <div class="row  text-white">
                    <div class="col-lg-6 col-md-9 mx-auto rounded">
                        <iframe width="620" height="315"src="${apod.image.url}">
                        </iframe>
                    </div>
                    <div class="col-lg-6 col-md-9 text-center m-auto">
                        <p>${apod.image.title}</p>
                        <p>${apod.image.explanation}</p>
                    </div>
                </div>
            `)
        } else {
            return (`
                <div class="row  text-white">
                    <div class="col-lg-6 col-md-9 mx-auto rounded">
                        <img src="${apod.image.url}" class="img-fluid" />
                    </div>

                    <div class="col-lg-6 col-md-9 text-center m-auto">
                        <h1 class="p-2">${apod.image.title}</h1>
                        <p class="my-5 p-2">${apod.image.explanation}</p>
                    </div>

                </div>
            `)
        }
    }
}



// ------------------------------------------------------  API CALLS & Utility methods


// Higher-order function
const createRoversInfo = (state) => {
    let rovers = state.rovers;
    let roversNames = state.roversNames;

    if (rovers.length === 0)
        getRovers(roversNames);
    else{
        let content = `<div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-6">
                <h1 class="text-white">Rovers Details</h1>
            </div>
        </div>
    </div>`;

        rovers.forEach( (rover, index) => {
             content = content.concat(createRoversDetails(rover))
         })

        return `<div class="py-5"><div class="container"><div class="row hidden-md-up">${content}</div></div></div>`;
    }

}

const createRoversDetails= (rover) => {
    return `
    <div class="col-md-4">
        <div class="card">
            <div class="card-block position-relative">
                <h1 class="card-title">${rover.name}</h5>
                <h3 class="card-subtitle mb-2 text-muted">Status: ${rover.status}</h6>
                <p class="card-text">Landing date: ${rover.landing_date}</p>
                <p class="card-text">Launch Date: ${rover.launch_date}</p>
                <p class="card-text">Total Photos: ${rover.total_photos}</p>
                <button type="button" class="btn btn-primary">Photos</button>
            </div>
        </div>
    </div>`;
}

const clickPhotosButton = (state,creteContentImages) => {
    if (state.selectedRover != '' && state.selectedRover != undefined) {
        
        return `<div class="container">
                    <div class="row py-5 text-center">
                        <h2 class="text-white text-uppercase mb-5">${state.selectedRover}'s Photos</h2>
                        ${creteContentImages(state)}
                    </div>
                </div> `
    }
    
}

const creteContentImages = (state) => {
    let content = ``;
        
    state.roversPhotos.get(state.selectedRover).forEach( photo => {
        content = content.concat(`<div class="col-lg-3 col-md-5 col-sm-10 mx-auto rounded m-4">
                                        <img src="${photo}" class="img-fluid">
                                    </div>`);
    })

    return content;
}

const createWeather = (state) => {
    const sol_keys = state.sol_keys;

    if(sol_keys.length === 0){
        getWeatherMars();
    }
    else{
        let content =``;

        content = `<div class="container">
            <div class="row py-5 text-center">
                <div class="row hidden-md-up">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["775"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["775"].Southern_season}</p>
                                <p class="card-text">${sol_keys["775"].First_UTC}</p>
                                <p class="card-text">${sol_keys["775"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["775"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["775"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["775"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["775"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["775"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["776"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["776"].Southern_season}</p>
                                <p class="card-text">${sol_keys["776"].First_UTC}</p>
                                <p class="card-text">${sol_keys["776"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["776"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["776"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["776"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["776"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["776"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["777"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["777"].Southern_season}</p>
                                <p class="card-text">${sol_keys["777"].First_UTC}</p>
                                <p class="card-text">${sol_keys["777"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["777"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["777"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["777"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["777"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["777"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["778"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["778"].Southern_season}</p>
                                <p class="card-text">${sol_keys["778"].First_UTC}</p>
                                <p class="card-text">${sol_keys["778"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["778"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["778"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["778"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["778"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["778"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["779"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["779"].Southern_season}</p>
                                <p class="card-text">${sol_keys["779"].First_UTC}</p>
                                <p class="card-text">${sol_keys["779"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["779"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["779"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["779"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["779"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["779"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys["780"].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys["780"].Southern_season}</p>
                                <p class="card-text">${sol_keys["780"].First_UTC}</p>
                                <p class="card-text">${sol_keys["780"].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys["780"].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys["780"].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys["780"].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys["780"].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys["780"].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>`
        
        return content;
    }
}

const getImageOfTheDay = () => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, Immutable.Map( { apod } ) ) )
}


const getRovers = (roversNames) => {

    const urls = Array.from(roversNames).map(rover => `http://localhost:3000/rover?name=${rover}`)

    Promise.all(urls.map(url =>
        fetch(url).then(resp => resp.json())
    )).then(data => {
        const rovers = data.map(rover => rover.rover.photo_manifest)
        updateStore(store, {rovers: rovers})
    })
}


const getRoverPhotos = (state, roverName) => {
    const roversPhotos = state.toJS().roversPhotos;

    fetch(`http://localhost:3000/rover-photos?name=${roverName}`)
        .then(res => res.json())
        .then(data => {
            roversPhotos.set(roverName, data.latest_photos.map(imgObj => imgObj.img_src));
            updateStore(state, Immutable.Map({roversPhotos: roversPhotos, selectedRover: roverName}));
        } )
}

const getWeatherMars = () => {
    fetch(`http://localhost:3000/insight`)
        .then(res => res.json())
        .then(data => {
            const sol_keys = data
            console.log(sol_keys)
            updateStore(store, {sol_keys: sol_keys})
        })
}
