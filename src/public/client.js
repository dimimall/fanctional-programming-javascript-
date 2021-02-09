
// App state
let store = Immutable.fromJS({
    apod: '',
    selectedRover: '',
    rovers: [],
    roversNames: ['Curiosity', 'Opportunity', 'Spirit'],
    roversPhotos: new Map([ ['Curiosity', {}], ['Opportunity', {}], ['Spirit', {}] ]),
    sol_keys: []
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
            roverName = event.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML;
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
                ${createRoversInfo(state)}
                ${clickPhotosButton(state,creteContentImages)}
                ${createWeather(state)}
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

        rovers.map( (rover) => {
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
                <p class="card-text">Latest_photo: ${rover.photos.reduce((a, b) => {
                    return (new Date(a.earth_date) > new Date(b.earth_date) ? a.earth_date : b.earth_date)
                  })}</p>
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
        
    state.roversPhotos.get(state.selectedRover).map( photo => {
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

        let content = ``;

        content = `<div class="container">
            <div class="row py-5 text-center">
                <div class="row hidden-md-up">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[0].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[0].Southern_season}</p>
                                <p class="card-text">${sol_keys[0].First_UTC}</p>
                                <p class="card-text">${sol_keys[0].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[0].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[0].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[0].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[0].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[0].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[1].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[1].Southern_season}</p>
                                <p class="card-text">${sol_keys[1].First_UTC}</p>
                                <p class="card-text">${sol_keys[1].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[1].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[1].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[1].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[1].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[1].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[2].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[2].Southern_season}</p>
                                <p class="card-text">${sol_keys[2].First_UTC}</p>
                                <p class="card-text">${sol_keys[2].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[2].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[2].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[2].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[2].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[2].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[3].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[3].Southern_season}</p>
                                <p class="card-text">${sol_keys[3].First_UTC}</p>
                                <p class="card-text">${sol_keys[3].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[3].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[3].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[3].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[3].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[3].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[4].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[4].Southern_season}</p>
                                <p class="card-text">${sol_keys[4].First_UTC}</p>
                                <p class="card-text">${sol_keys[4].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[4].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[4].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[4].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[4].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[4].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[5].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[5].Southern_season}</p>
                                <p class="card-text">${sol_keys[5].First_UTC}</p>
                                <p class="card-text">${sol_keys[5].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[5].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[5].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[5].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[5].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[5].PRE.mx}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-block position-relative">
                                <p class="card-title">Season: ${sol_keys[6].Season}</p>
                                <p class="card-subtitle mb-2 text-muted">Southern season: ${sol_keys[6].Southern_season}</p>
                                <p class="card-text">${sol_keys[6].First_UTC}</p>
                                <p class="card-text">${sol_keys[6].Last_UTC}</p>
                                <p class="card-text">Month ordinal: ${sol_keys[6].Month_ordinal}</p>
                                <p class="card-text">Southern season: ${sol_keys[6].Northern_season}</p>
                                <p class="card-text">Average: ${sol_keys[6].PRE.av}</p>
                                <p class="card-text">Min temperature: ${sol_keys[6].PRE.mn}</p>
                                <p class="card-text">Min temperature: ${sol_keys[6].PRE.mx}</p>
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
            const sol_keys = Object.values(data)
            updateStore(store, {sol_keys: sol_keys})
        })
}
